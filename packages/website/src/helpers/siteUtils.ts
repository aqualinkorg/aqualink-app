import { LatLng } from 'leaflet';
import { maxBy, meanBy, snakeCase } from 'lodash';

import {
  DataRangeWithMetric,
  MetricsKeys,
  Site,
  Sources,
  SurveyPoints,
  TimeSeriesDataRange,
  UpdateSiteNameFromListArgs,
} from 'store/Sites/types';
import type {
  TimeSeriesDataRequestParams,
  siteOptions,
} from 'store/Sites/types';
import requests from './requests';

export const longDHW = (dhw: number | null): string =>
  `0000${dhw ? Math.round(dhw * 10) : '0'}`.slice(-4);

export const findSiteById = (sites: Site[], siteId: string): Site | null => {
  return (
    sites.find((site: Site) => {
      return site.id.toString() === siteId;
    }) || null
  );
};

/**
 * If an initial site is provided we try to load it, otherwise we find the site with the highest
 * alert level.
 * @param sites
 * @param initialSiteId
 * @returns LatLng of the initial Site
 */
export const findInitialSitePosition = (
  sites: Site[],
  initialSiteId?: string,
): LatLng | null => {
  const initialSite =
    (initialSiteId && findSiteById(sites, initialSiteId)) ||
    maxBy(
      sites,
      (site) =>
        `${site.collectionData?.tempWeeklyAlert || 0},${longDHW(
          site.collectionData?.dhw || null,
        )}`,
    );

  // If the polygon type is a Point, return its coordinates
  if (initialSite?.polygon.type === 'Point') {
    return new LatLng(
      initialSite.polygon.coordinates[1],
      initialSite.polygon.coordinates[0],
    );
  }

  // If the polygon type is a Polygon, return the coordinates of its centroid
  if (initialSite?.polygon.type === 'Polygon') {
    const centroidLat = meanBy(
      initialSite.polygon.coordinates[0],
      (coords) => coords[1],
    );
    const centroidLng = meanBy(
      initialSite.polygon.coordinates[0],
      (coords) => coords[0],
    );

    return new LatLng(centroidLat, centroidLng);
  }

  return null;
};

// Util function that checks if a site has a deployed spotter
export const hasDeployedSpotter = (site?: Site | null) =>
  Boolean(site?.sensorId && site?.status === 'deployed');

export const belongsToCollection = (siteId: number, siteIds?: number[]) =>
  siteIds?.includes(siteId) || false;

export const setSiteNameFromList = ({
  id,
  list,
  name,
}: UpdateSiteNameFromListArgs): Site[] | undefined =>
  list?.map((item) => (item.id === id && name ? { ...item, name } : item));

export const constructTimeSeriesDataRequestUrl = ({
  siteId,
  pointId,
  ...rest
}: TimeSeriesDataRequestParams) => {
  return `time-series/sites/${encodeURIComponent(siteId)}${
    pointId ? `/site-survey-points/${encodeURIComponent(pointId)}` : ''
  }${requests.generateUrlQueryParams(rest)}`;
};

export const constructTimeSeriesDataCsvRequestUrl = ({
  siteId,
  ...rest
}: TimeSeriesDataRequestParams) => {
  return `time-series/sites/${encodeURIComponent(
    siteId,
  )}/csv${requests.generateUrlQueryParams(rest)}`;
};

export const findSurveyPointFromList = (
  pointId?: string,
  points?: SurveyPoints[],
) =>
  points
    ?.map((item) => ({
      ...item,
      id: item.id.toString(),
      name: item.name || undefined,
    }))
    .find(({ id }) => id === pointId);

export const getSourceRanges = (
  dataRanges: TimeSeriesDataRange,
  source: Sources,
): DataRangeWithMetric[] => {
  const result = Object.entries(dataRanges).map(([metric, sources]) => {
    return (
      sources
        .find((x) => x.type === source)
        ?.data.map((range) => ({
          metric: snakeCase(metric) as MetricsKeys,
          minDate: range.minDate,
          maxDate: range.maxDate,
        })) || []
    );
  });

  return result.flat();
};

export const sitesFilterFn = (
  filter: typeof siteOptions[number],
  s?: Site | null,
) => {
  switch (filter) {
    case 'All sites':
      return true;
    case 'Live streams':
      return !!s?.videoStream;
    case '3D Models':
      return !!s?.sketchFab;
    case 'Active buoys':
      return hasDeployedSpotter(s);
    case 'HOBO loggers':
      return s?.hasHobo;
    case 'Water quality':
      return s?.waterQuality?.length;
    default:
      console.error(`Unhandled Option: ${filter}`);
      return true;
  }
};
