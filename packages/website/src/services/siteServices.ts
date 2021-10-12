import { AxiosRequestConfig } from "axios";
import requests from "../helpers/requests";
import {
  DailyData,
  LiveData,
  Site,
  Pois,
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
} from "../store/Sites/types";

const getSite = (id: string) =>
  requests.send<Site>({
    url: `sites/${id}`,
    method: "GET",
  });

const getSiteDailyData = (id: string, start?: string, end?: string) =>
  requests.send<DailyData[]>({
    url: `sites/${id}/daily_data${
      start && end ? `?end=${end}&start=${start}` : ""
    }`,
    method: "GET",
  });

const getSiteLiveData = (id: string) =>
  requests.send<LiveData>({
    url: `sites/${id}/live_data`,
    method: "GET",
  });

const getSiteTimeSeriesData = ({
  siteId,
  pointId,
  start,
  end,
  metrics,
  hourly,
}: TimeSeriesDataRequestParams) =>
  requests.send<TimeSeriesDataResponse>({
    url: `time-series/sites/${siteId}${
      pointId ? `/pois/${pointId}` : ""
    }?start=${start}&end=${end}&metrics=${metrics.join()}&hourly=${hourly}`,
    method: "GET",
  });

const getSiteTimeSeriesDataRange = ({
  siteId,
  pointId,
}: TimeSeriesDataRangeRequestParams) =>
  requests.send<TimeSeriesDataRangeResponse>({
    url: `time-series/sites/${siteId}${
      pointId ? `/pois/${pointId}` : ""
    }/range`,
    method: "GET",
  });

const getSites = () =>
  requests.send<SiteResponse[]>({
    url: "sites",
    method: "GET",
  });

const getSitePois = (
  id: string,
  cancelToken?: AxiosRequestConfig["cancelToken"]
) =>
  requests.send<Pois[]>({
    url: `pois?siteId=${id}`,
    method: "GET",
    cancelToken,
  });

const deleteSitePoi = (id: number, token: string) =>
  requests.send({
    url: `pois/${id}`,
    method: "DELETE",
    token,
  });

const registerSite = (
  name: string,
  latitude: number,
  longitude: number,
  depth: number,
  token: string
) => {
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
    url: "sites",
    method: "POST",
    data,
    token,
  });
};

const applySite = (
  siteId: number,
  appId: string,
  data: SiteApplyParams,
  token: string
) =>
  requests.send({
    url: `site-applications/${appId}/sites/${siteId}`,
    method: "PUT",
    data,
    token,
  });

const getSiteApplication = (siteId: number, token: string) =>
  requests.send<SiteApplication>({
    url: `site-applications/sites/${siteId}`,
    method: "GET",
    token,
  });

const updateSite = (siteId: number, data: SiteUpdateParams, token: string) =>
  requests.send<Site>({
    url: `sites/${siteId}`,
    method: "PUT",
    data,
    token,
  });

const getExclusionDates = (siteId: number, token: string) =>
  requests.send<ExclusionDateResponse>({
    url: `sites/${siteId}/exclusion_dates`,
    method: "GET",
    token,
  });

const deploySpotter = (
  siteId: number,
  data: DeploySpotterParams,
  token: string
) =>
  requests.send({
    url: `sites/${siteId}/deploy`,
    method: "POST",
    data,
    token,
  });

const maintainSpotter = (
  siteId: number,
  data: MaintainSpotterParams,
  token: string
) =>
  requests.send({
    url: `sites/${siteId}/exclusion_dates`,
    method: "POST",
    data,
    token,
  });

const getOceanSenseData = ({
  sensorID,
  startDate,
  endDate,
}: OceanSenseDataRequestParams) =>
  requests.send<OceanSenseDataResponse>({
    url: `https://us-central1-oceansense-app.cloudfunctions.net/queryData?sensorID=${sensorID}&param=all&startDate=${startDate}&endDate=${endDate}`,
    method: "GET",
  });

export default {
  getSite,
  getSites,
  getSiteDailyData,
  getSiteLiveData,
  getSiteTimeSeriesData,
  getSiteTimeSeriesDataRange,
  getSitePois,
  deleteSitePoi,
  registerSite,
  applySite,
  getSiteApplication,
  updateSite,
  getExclusionDates,
  deploySpotter,
  maintainSpotter,
  getOceanSenseData,
};
