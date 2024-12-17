import { isEqual, mean, meanBy, minBy } from 'lodash';
import L, { LatLng, LatLngBounds, Polygon as LeafletPolygon } from 'leaflet';
import { makeStyles } from '@material-ui/core';

import type { Point, SurveyPoints, Polygon, Position } from 'store/Sites/types';
import { CollectionDetails } from 'store/Collection/types';
import { spotter } from '../assets/spotter';
import { spotterSelected } from '../assets/spotterSelected';
import { spotterAnimation } from '../assets/spotterAnimation';
import { hobo } from '../assets/hobo';
import { hoboSelected } from '../assets/hoboSelected';

/**
 * Get the middle point of a polygon (average of all points). Returns the point itself if input isn't a polygon.
 */
export const getMiddlePoint = (point: Point | Polygon): Position => {
  if (point.type === 'Point') {
    return point.coordinates;
  }

  const coordArray = point.coordinates[0];
  const lngArray = coordArray.map((item) => item[0]);
  const latArray = coordArray.map((item) => item[1]);

  const lngMean = mean(lngArray);
  const latMean = mean(latArray);

  return [lngMean, latMean];
};

export const samePosition = (
  polygon1: Polygon | Point,
  polygon2: Polygon | Point,
) => {
  const coords1 =
    polygon1.type === 'Polygon'
      ? getMiddlePoint(polygon1)
      : polygon1.coordinates;
  const coords2 =
    polygon2.type === 'Polygon'
      ? getMiddlePoint(polygon2)
      : polygon2.coordinates;

  return isEqual(coords1, coords2);
};

export const getCollectionCenterAndBounds = (
  collection?: CollectionDetails,
): [LatLng | undefined, LatLngBounds | undefined] => {
  if (!collection) {
    return [undefined, undefined];
  }

  const coordinates = collection.sites.map((item) =>
    getMiddlePoint(item.polygon),
  );

  const center = new LatLng(
    meanBy(coordinates, (item) => item[1]),
    meanBy(coordinates, (item) => item[0]),
  );

  const bounds =
    coordinates.length > 1
      ? new LeafletPolygon(
          coordinates.map((item) => new LatLng(item[1], item[0])),
        ).getBounds()
      : undefined;

  return [center, bounds];
};

// TODO - Use geolib to calculate distance and other things
/**
 * Returns the distance between two points in radians
 */
export const radDistanceCalculator = (point1: Position, point2: Position) => {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;

  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
  }

  const radLat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lng1 - lng2;
  const radtheta = (Math.PI * theta) / 180;

  const dist =
    Math.sin(radLat1) * Math.sin(radlat2) +
    Math.cos(radLat1) * Math.cos(radlat2) * Math.cos(radtheta);

  return Math.acos(dist > 1 ? 1 : dist);
};

export const findClosestSurveyPoint = (
  sitePolygon?: Polygon | Point,
  points?: SurveyPoints[],
) => {
  if (!sitePolygon || !points) {
    return undefined;
  }

  const [siteLng, siteLat] =
    sitePolygon.type === 'Polygon'
      ? getMiddlePoint(sitePolygon)
      : sitePolygon.coordinates;

  const closestPoint = minBy(
    points.filter((item) => item.polygon),
    (point) => {
      const polygon = point.polygon as Polygon | Point;
      return radDistanceCalculator(
        [siteLng, siteLat],
        polygon.type === 'Point'
          ? polygon.coordinates
          : getMiddlePoint(polygon),
      );
    },
  );

  // if there is no closestPoint - return the first one by id.
  const resultingPoint = closestPoint || minBy(points, 'id');

  return {
    ...resultingPoint,
    id: resultingPoint?.id.toString(),
    name: resultingPoint?.name || undefined,
  };
};

const useMarkerStyles = makeStyles({
  spotterIconWrapper: {},
  hoboIcon: {
    height: 'inherit',
    width: 'inherit',
  },
  spotterIconSteady: {
    height: 'inherit',
    width: 'inherit',
    position: 'relative',
    left: 0,
    right: 0,
    top: '-100%',
  },
  spotterIconBlinking: {
    width: 'inherit',
    height: 'inherit',
    WebkitAnimationName: 'pulse',
    WebkitAnimationDuration: '2s',
    WebkitAnimationIterationCount: 'infinite',
    animationName: 'pulse',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
  },
});

export const buoyIcon = (iconUrl: string) =>
  new L.Icon({
    iconUrl,
    iconSize: [24, 27],
    iconAnchor: [12, 27],
    popupAnchor: [0, -28],
  });

export const useSensorIcon = (
  sensor: 'spotter' | 'hobo',
  selected: boolean,
  color: string,
) => {
  const classes = useMarkerStyles();
  const iconWidth = sensor === 'spotter' ? 15 : 20;
  const iconHeight = sensor === 'spotter' ? 15 : 20;
  return L.divIcon({
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconWidth / 2, 0],
    html:
      sensor === 'spotter'
        ? `
          <div class=${classes.spotterIconBlinking}>
            ${spotterAnimation(color)}
          </div>
          <div class=${classes.spotterIconSteady}>
            ${selected ? spotterSelected(color) : spotter(color)}
          </div>
        `
        : `
          <div class=${classes.hoboIcon}>
            ${selected ? hoboSelected(color) : hobo(color)}
          </div>
        `,
    className: classes.spotterIconWrapper,
  });
};

export const useMarkerIcon = (
  hasSpotter: boolean,
  hasHobo: boolean,
  selected: boolean,
  color: string,
  iconUrl: string,
) => {
  const sensorIcon = useSensorIcon(
    hasSpotter ? 'spotter' : 'hobo',
    selected,
    color,
  );
  if (hasSpotter || hasHobo) return sensorIcon;
  return buoyIcon(iconUrl);
};

// Create a donut chart with the given counts and colors
// Source: https://maplibre.org/maplibre-gl-js/docs/examples/cluster-html/
export function createDonutChart(counts: number[], colors: string[]) {
  const offsets: number[] = [];

  let total = 0;
  counts.forEach((count) => {
    // eslint-disable-next-line fp/no-mutating-methods
    offsets.push(total);
    // eslint-disable-next-line fp/no-mutation
    total += count;
  });
  const fontSize =
    // eslint-disable-next-line no-nested-ternary
    total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
  // eslint-disable-next-line no-nested-ternary
  const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
  const r0 = Math.round(r * 0.6);
  const w = r * 2;

  const segments = counts.map((count, i) =>
    donutSegment(
      offsets[i] / total,
      (offsets[i] + count) / total,
      r,
      r0,
      colors[i],
    ),
  );
  const html = `
    <svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle"  style="font: ${fontSize}px sans-serif; display: block; transform: translate(-50%, -50%)">
      ${segments.join('')}
      <circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
      <text dominant-baseline="central" transform="translate(${r}, ${r})">${total.toLocaleString()}</text>
    </svg>`;

  return html;
}

function donutSegment(
  start: number,
  end: number,
  r: number,
  r0: number,
  color: string,
) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  if (end - start === 1) end -= 0.00001;
  const a0 = 2 * Math.PI * (start - 0.25);
  const a1 = 2 * Math.PI * (end - 0.25);
  const x0 = Math.cos(a0);
  const y0 = Math.sin(a0);
  const x1 = Math.cos(a1);
  const y1 = Math.sin(a1);
  const largeArc = end - start > 0.5 ? 1 : 0;

  return [
    '<path d="M',
    r + r0 * x0,
    r + r0 * y0,
    'L',
    r + r * x0,
    r + r * y0,
    'A',
    r,
    r,
    0,
    largeArc,
    1,
    r + r * x1,
    r + r * y1,
    'L',
    r + r0 * x1,
    r + r0 * y1,
    'A',
    r0,
    r0,
    0,
    largeArc,
    0,
    r + r0 * x0,
    r + r0 * y0,
    `" fill="${color}" />`,
  ].join(' ');
}
