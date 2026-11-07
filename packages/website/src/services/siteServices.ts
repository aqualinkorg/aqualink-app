import { AxiosRequestConfig } from 'axios';
import {
  DailyData,
  Site,
  SurveyPoints,
  SiteRegisterResponseData,
  SiteApplyParams,
  SiteApplication,
  SiteUpdateParams,
  DeploySpotterParams,
  MaintainSpotterParams,
  ExclusionDateResponse,
  TimeSeriesDataResponse,
  TimeSeriesDataRangeResponse,
  TimeSeriesDataRequestParams,
  TimeSeriesDataRangeRequestParams,
  OceanSenseDataRequestParams,
  OceanSenseDataResponse,
  SiteResponse,
  SiteUploadHistory,
  LatestData,
  ForecastData,
  SpotterInfoResponse,
  GetSiteContactInfoProps,
  GetSiteContactInfoResponse,
} from 'store/Sites/types';
import requests from 'helpers/requests';
import { constructTimeSeriesDataRequestUrl } from 'helpers/siteUtils';

type SiteIdParam = TimeSeriesDataRequestParams['siteId'];
type NumericSiteId = Site['id'];
type AuthToken = GetSiteContactInfoProps['token'];
type OptionalAuthToken = AuthToken | null | undefined;
type SiteDateParam = TimeSeriesDataRequestParams['start'];
type RegisterSiteTuple = [
  Site['name'],
  number,
  number,
  NonNullable<Site['depth']>,
  AuthToken,
];
type ApplySiteTuple = [
  NumericSiteId,
  SiteApplication['appId'],
  SiteApplyParams,
  AuthToken,
];
type AuthenticatedSiteMutationTuple<T> = [NumericSiteId, T, AuthToken];

interface SiteMutationOptions {
  method: 'POST' | 'PUT';
  suffix?: string;
}

/**
 * Builds the optional query suffix for daily_data requests, supporting both bounded
 * [start, end] windows and historical 90-day lookbacks anchored at an end date.
 */
const buildDailyDataQuery = (
  start?: SiteDateParam,
  end?: SiteDateParam,
): string => {
  if (start && end) {
    return `?end=${end}&start=${start}`;
  }
  if (end) {
    return `?end=${end}`;
  }
  return '';
};

const sendAuthenticatedSiteMutation = <TResponse, TPayload>(
  options: SiteMutationOptions,
  args: AuthenticatedSiteMutationTuple<TPayload>,
) => {
  const [siteId, data, token] = args;
  const suffix = options.suffix ? `/${options.suffix}` : '';
  return requests.send<TResponse>({
    url: `sites/${siteId}${suffix}`,
    method: options.method,
    data,
    token,
  });
};

const getSite = (id: SiteIdParam, date?: SiteDateParam) =>
  requests.send<Site>({
    url: date ? `sites/${id}?date=${encodeURIComponent(date)}` : `sites/${id}`,
    method: 'GET',
  });

const getSiteDailyData = (
  id: SiteIdParam,
  ...range: [SiteDateParam?, SiteDateParam?]
) =>
  requests.send<DailyData[]>({
    url: `sites/${id}/daily_data${buildDailyDataQuery(range[0], range[1])}`,
    method: 'GET',
  });

const getSiteForecastData = (id: SiteIdParam) =>
  requests.send<ForecastData[]>({
    url: `wind-wave-data-hindcast/sites/${id}`,
    method: 'GET',
  });

const getSiteLatestData = (id: SiteIdParam) =>
  requests.send<{ latestData: LatestData[] }>({
    url: `sites/${id}/latest_data`,
    method: 'GET',
  });

const getSiteSpotterPosition = (id: SiteIdParam) =>
  requests.send<{
    position?: {
      longitude: number;
      latitude: number;
    };
    isDeployed: boolean;
    timestamp?: string;
  }>({
    url: `sites/${id}/spotter_position`,
    method: 'GET',
  });

const getSiteTimeSeriesData = (params: TimeSeriesDataRequestParams) =>
  requests.send<TimeSeriesDataResponse>({
    url: constructTimeSeriesDataRequestUrl(params),
    method: 'GET',
  });

const getSiteTimeSeriesDataRange = ({
  siteId,
  pointId,
}: TimeSeriesDataRangeRequestParams) =>
  requests.send<TimeSeriesDataRangeResponse>({
    url: `time-series/sites/${siteId}${
      pointId ? `/site-survey-points/${pointId}` : ''
    }/range`,
    method: 'GET',
  });

const getSites = (date?: SiteDateParam) =>
  requests.send<SiteResponse[]>({
    url: date ? `sites?date=${encodeURIComponent(date)}` : 'sites',
    method: 'GET',
  });

const getSiteSurveyPoints = (
  id: SiteIdParam,
  cancelToken?: AxiosRequestConfig['cancelToken'],
) =>
  requests.send<SurveyPoints[]>({
    url: `site-survey-points?siteId=${id}`,
    method: 'GET',
    cancelToken,
  });

const deleteSiteSurveyPoint = (id: NumericSiteId, token?: OptionalAuthToken) =>
  requests.send({
    url: `site-survey-points/${id}`,
    method: 'DELETE',
    token,
  });

const registerSite = (...args: RegisterSiteTuple) => {
  const [name, latitude, longitude, depth, token] = args;
  const data = {
    siteApplication: {},
    site: {
      name,
      latitude,
      longitude,
      depth,
    },
  };

  return requests.send<SiteRegisterResponseData>({
    url: 'sites',
    method: 'POST',
    data,
    token,
  });
};

const applySite = (...args: ApplySiteTuple) => {
  const [siteId, appId, data, token] = args;
  return requests.send({
    url: `site-applications/${appId}/sites/${siteId}`,
    method: 'PUT',
    data,
    token,
  });
};

const getSiteApplication = (siteId: NumericSiteId, token: AuthToken) =>
  requests.send<SiteApplication>({
    url: `site-applications/sites/${siteId}`,
    method: 'GET',
    token,
  });

const getSiteUploadHistory = (siteId: NumericSiteId) =>
  requests.send<SiteUploadHistory>({
    url: `data-uploads/sites/${siteId}`,
    method: 'GET',
  });

const updateSite = (
  ...args: AuthenticatedSiteMutationTuple<SiteUpdateParams>
) => sendAuthenticatedSiteMutation<Site, SiteUpdateParams>({ method: 'PUT' }, args);

const getExclusionDates = (siteId: NumericSiteId, token: AuthToken) =>
  requests.send<ExclusionDateResponse>({
    url: `sites/${siteId}/exclusion_dates`,
    method: 'GET',
    token,
  });

const deploySpotter = (
  ...args: AuthenticatedSiteMutationTuple<DeploySpotterParams>
) =>
  sendAuthenticatedSiteMutation<unknown, DeploySpotterParams>(
    { method: 'POST', suffix: 'deploy' },
    args,
  );

const maintainSpotter = (
  ...args: AuthenticatedSiteMutationTuple<MaintainSpotterParams>
) =>
  sendAuthenticatedSiteMutation<unknown, MaintainSpotterParams>(
    { method: 'POST', suffix: 'exclusion_dates' },
    args,
  );

const getOceanSenseData = ({
  sensorID,
  startDate,
  endDate,
}: OceanSenseDataRequestParams) =>
  requests.send<OceanSenseDataResponse>({
    url: `https://us-central1-oceansense-app.cloudfunctions.net/queryData?sensorID=${sensorID}&param=all&startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
  });

const getSpotterInfo = (query: SiteIdParam, token?: AuthToken) =>
  requests.send<SpotterInfoResponse>({
    url: `sensor-data/info/${query}`,
    method: 'GET',
    token,
  });

const getSiteContactInfo = ({ siteId, token }: GetSiteContactInfoProps) =>
  requests.send<GetSiteContactInfoResponse>({
    url: `sites/${encodeURIComponent(siteId)}/contact_info`,
    method: 'GET',
    token,
  });

export default {
  getSite,
  getSites,
  getSiteDailyData,
  getSiteForecastData,
  getSiteLatestData,
  getSiteSpotterPosition,
  getSiteTimeSeriesData,
  getSiteTimeSeriesDataRange,
  getSiteSurveyPoints,
  deleteSiteSurveyPoint,
  registerSite,
  applySite,
  getSiteApplication,
  getSiteUploadHistory,
  updateSite,
  getExclusionDates,
  deploySpotter,
  maintainSpotter,
  getOceanSenseData,
  getSpotterInfo,
  getSiteContactInfo,
};
