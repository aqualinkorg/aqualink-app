import React, { useCallback, useEffect, useMemo } from 'react';
/* eslint-disable import/no-unresolved -- package exports map; node resolver predates exports */
import {
  Layer,
  Marker,
  Source,
  useMap,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
/* eslint-enable import/no-unresolved */
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { sitesToDisplayListSelector } from 'store/Sites/sitesListSlice';
import type { Site } from 'store/Sites/types';
import {
  setSearchResult,
  setSiteOnMap,
  siteOnMapSelector,
  unsetSiteOnMap,
} from 'store/Homepage/homepageSlice';
import { alertColorFinder } from 'helpers/bleachingAlertIntervals';
import { useMarkerIcon } from 'helpers/map';
import { hasDeployedSpotter } from 'helpers/siteUtils';
import GlobePopup from './GlobePopup';

const SITE_CIRCLE_LAYER_ID = 'site-circles';
const SITE_CIRCLE_SOURCE_ID = 'site-circle-source';

const hasSensor = (site: Site) => site.hasHobo || hasDeployedSpotter(site);

const isPointSite = (
  site: Site,
): site is Site & {
  polygon: { type: 'Point'; coordinates: [number, number] };
} => site.polygon.type === 'Point';

function SensorMarker({
  site,
  onSelect,
}: {
  site: Site & { polygon: { type: 'Point'; coordinates: [number, number] } };
  onSelect: (site: Site) => void;
}) {
  const isSelected = useSelector(siteOnMapSelector)?.id === site.id;
  const { tempWeeklyAlert } = site.collectionData || {};
  const markerIcon = useMarkerIcon(
    hasDeployedSpotter(site),
    site.hasHobo,
    isSelected,
    alertColorFinder(tempWeeklyAlert),
    '',
  );
  const [lng, lat] = site.polygon.coordinates;
  const { iconSize } = markerIcon.options;
  const width = Array.isArray(iconSize) ? iconSize[0] : iconSize?.x || 20;
  const height = Array.isArray(iconSize) ? iconSize[1] : iconSize?.y || 20;
  const html =
    'html' in markerIcon.options && typeof markerIcon.options.html === 'string'
      ? markerIcon.options.html
      : '';

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="top"
      opacityWhenCovered={0}
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelect(site);
      }}
    >
      <div
        style={{ width, height, cursor: 'pointer' }}
        // Sensor SVGs are generated in-app, same markup Leaflet used.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Marker>
  );
}

export function GlobeSiteMarkers() {
  const storedSites = useSelector(sitesToDisplayListSelector);
  const siteOnMap = useSelector(siteOnMapSelector);
  const dispatch = useAppDispatch();
  const { current: map } = useMap();
  const sites = useMemo(() => storedSites || [], [storedSites]);
  const pointSites = useMemo(() => sites.filter(isPointSite), [sites]);
  const sensorSites = useMemo(() => pointSites.filter(hasSensor), [pointSites]);
  const circleSites = useMemo(
    () => pointSites.filter((site) => !hasSensor(site)),
    [pointSites],
  );
  const circleData = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: circleSites.map((site) => ({
        type: 'Feature' as const,
        id: site.id,
        properties: {
          id: site.id,
          color: alertColorFinder(site.collectionData?.tempWeeklyAlert),
        },
        geometry: {
          type: 'Point' as const,
          coordinates: site.polygon.coordinates,
        },
      })),
    }),
    [circleSites],
  );

  const selectSite = useCallback(
    (site: Site) => {
      if (!isPointSite(site)) {
        return;
      }
      const [lng] = site.polygon.coordinates;
      dispatch(setSearchResult());
      dispatch(setSiteOnMap({ ...site, displayLng: lng }));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!map) {
      return undefined;
    }

    const sitesById = new Map(circleSites.map((site) => [site.id, site]));
    const onMapClick = (event: MapLayerMouseEvent) => {
      const { target } = event.originalEvent;
      if (target instanceof Element && target.closest('.maplibregl-marker')) {
        return;
      }
      if (!map.getLayer(SITE_CIRCLE_LAYER_ID)) {
        dispatch(unsetSiteOnMap());
        return;
      }
      const [hit] = map.queryRenderedFeatures(event.point, {
        layers: [SITE_CIRCLE_LAYER_ID],
      });
      const id = hit?.properties?.id;
      const site = typeof id === 'number' ? sitesById.get(id) : undefined;
      if (site) {
        selectSite(site);
        return;
      }
      dispatch(unsetSiteOnMap());
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [circleSites, dispatch, map, selectSite]);

  return (
    <>
      <Source id={SITE_CIRCLE_SOURCE_ID} type="geojson" data={circleData}>
        <Layer
          id={SITE_CIRCLE_LAYER_ID}
          type="circle"
          paint={{
            'circle-radius': 5,
            'circle-color': ['get', 'color'],
            'circle-opacity': 1,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000',
          }}
        />
      </Source>
      {sensorSites.map((site) => (
        <SensorMarker key={site.id} site={site} onSelect={selectSite} />
      ))}
      {siteOnMap && isPointSite(siteOnMap) && <GlobePopup site={siteOnMap} />}
    </>
  );
}

export default GlobeSiteMarkers;
