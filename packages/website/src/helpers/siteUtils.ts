import { LatLng } from 'leaflet';
import { isEmpty, keyBy, maxBy, meanBy, snakeCase } from 'lodash';

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
  SiteFilters,
  SiteOption,
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
  if (!s) {
    return false;
  }
  switch (filter) {
    case 'All sites':
      return true;
    case 'Live streams':
      return !!s.videoStream;
    case '3D Models':
      return !!s.sketchFab;
    case 'Active buoys':
      return hasDeployedSpotter(s);
    case 'HOBO loggers':
      return s.hasHobo;
    case 'Water quality':
      return s.waterQualitySources?.length;
    case 'Reef Check':
      return !!(s.reefCheckSites && s.reefCheckSites.length > 0);
    default:
      console.error(`Unhandled Option: ${filter}`);
      // This will cause a TS error if there is an unhandled option
      // eslint-disable-next-line prettier/prettier
      filter satisfies never;
      return true;
  }
};

export const filterOutFalsy = <T extends Record<string, boolean>>(obj: T): Record<string, true> => {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value)) as Record<string, true>;
};


export const filterSiteByHeatStress = (site: Site, { heatStress }: SiteFilters) => {
  if (isEmpty(heatStress)) {
    return true;
  }
  const { tempWeeklyAlert } = site.collectionData || {};
  return heatStress[tempWeeklyAlert ?? 0];
}

export const filterSiteBySensorData = (site: Site, { siteOptions: sensorDataTypes }: SiteFilters) => {
  if (isEmpty(sensorDataTypes)) {
    return true;
  }
  const siteOptions: SiteOption[] = Object.entries(sensorDataTypes).filter(([, value]) => value).map(([key]) => key) as SiteOption[];
  return siteOptions.every((option) => {
    switch (option) {
      case 'liveStreams':
        return !!site.videoStream;
      case '3DModels':
        return !!site.sketchFab;
      case 'activeBuoys':
        return hasDeployedSpotter(site);
      case 'hoboLoggers':
        return site.hasHobo;
      case 'waterQuality':
        return site.waterQualitySources?.length;
      case 'reefCheckSites':
        return !!(site.reefCheckSites && site.reefCheckSites.length > 0);
      default:
        console.error(`Unhandled Option: ${option}`);
        // This will cause a TS error if there is an unhandled option
        // eslint-disable-next-line prettier/prettier
        option satisfies never;
        return true;
    }
  });
}

export const filterSiteBySpecies = (site: Site, { species }: SiteFilters) => {
  if (isEmpty(species)) {
    return true;
  }
  const speciesToMatch = Object.entries(species).filter(([, value]) => value).map(([key]) => key);
  return speciesToMatch.every((s) => (site.reefCheckData?.organism || []).find((o) => o.includes(s)));
}

export const filterSiteByReefComposition = (site: Site, { reefComposition }: SiteFilters) => {
  if (isEmpty(reefComposition)) {
    return true;
  }
  
  const substratesToMatch = Object.entries(reefComposition).filter(([, value]) => value).map(([key]) => key);
  const siteSubstratesMap = keyBy(site.reefCheckData?.substrate || []);
  return substratesToMatch.every((s) => siteSubstratesMap[s]);
}

export const filterSiteByImpact = (site: Site, { impact }: SiteFilters) => {
  if (isEmpty(impact)) {
    return true;
  }
  const impactToMatch = Object.entries(impact).filter(([, value]) => value).map(([key]) => key);
  return impactToMatch.every((i) => site.reefCheckData?.impact?.includes(i));
}
