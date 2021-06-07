import { AxiosRequestConfig } from "axios";
import requests from "../helpers/requests";
import {
  DailyData,
  LiveData,
  Reef,
  Pois,
  ReefRegisterResponseData,
  ReefApplyParams,
  ReefApplication,
  ReefUpdateParams,
  DeploySpotterParams,
  MaintainSpotterParams,
  ExclusionDateResponse,
  TimeSeriesDataResponse,
  TimeSeriesDataRangeResponse,
  TimeSeriesDataRequestParams,
  TimeSeriesDataRangeRequestParams,
  OceanSenseDataRequestParams,
  OceanSenseDataResponse,
} from "../store/Reefs/types";

const getReef = (id: string) =>
  requests.send<Reef>({
    url: `reefs/${id}`,
    method: "GET",
  });

const getReefDailyData = (id: string, start?: string, end?: string) =>
  requests.send<DailyData[]>({
    url: `reefs/${id}/daily_data${
      start && end ? `?end=${end}&start=${start}` : ""
    }`,
    method: "GET",
  });

const getReefLiveData = (id: string) =>
  requests.send<LiveData>({
    url: `reefs/${id}/live_data`,
    method: "GET",
  });

const getReefTimeSeriesData = ({
  reefId,
  pointId,
  start,
  end,
  metrics,
  hourly,
}: TimeSeriesDataRequestParams) =>
  requests.send<TimeSeriesDataResponse>({
    url: `time-series/reefs/${reefId}${
      pointId ? `/pois/${pointId}` : ""
    }?start=${start}&end=${end}&metrics=${metrics.join()}&hourly=${hourly}`,
    method: "GET",
  });

const getReefTimeSeriesDataRange = ({
  reefId,
  pointId,
}: TimeSeriesDataRangeRequestParams) =>
  requests.send<TimeSeriesDataRangeResponse>({
    url: `time-series/reefs/${reefId}${
      pointId ? `/pois/${pointId}` : ""
    }/range`,
    method: "GET",
  });

const getReefs = () =>
  requests.send<Reef[]>({
    url: "reefs",
    method: "GET",
  });

const getReefPois = (
  id: string,
  cancelToken?: AxiosRequestConfig["cancelToken"]
) =>
  requests.send<Pois[]>({
    url: `pois?reefId=${id}`,
    method: "GET",
    cancelToken,
  });

const deleteReefPoi = (id: number, token: string) =>
  requests.send({
    url: `pois/${id}`,
    method: "DELETE",
    token,
  });

const registerReef = (
  name: string,
  latitude: number,
  longitude: number,
  depth: number,
  token: string
) => {
  const data = {
    reefApplication: {},
    reef: {
      name,
      latitude,
      longitude,
      depth,
    },
  };

  return requests.send<ReefRegisterResponseData>({
    url: "reefs",
    method: "POST",
    data,
    token,
  });
};

const applyReef = (
  reefId: number,
  appId: string,
  data: ReefApplyParams,
  token: string
) =>
  requests.send({
    url: `reef-applications/${appId}/reefs/${reefId}`,
    method: "PUT",
    data,
    token,
  });

const getReefApplication = (reefId: number, token: string) =>
  requests.send<ReefApplication>({
    url: `reef-applications/reefs/${reefId}`,
    method: "GET",
    token,
  });

const updateReef = (reefId: number, data: ReefUpdateParams, token: string) =>
  requests.send<Reef>({
    url: `reefs/${reefId}`,
    method: "PUT",
    data,
    token,
  });

const getExclusionDates = (reefId: number, token: string) =>
  requests.send<ExclusionDateResponse>({
    url: `reefs/${reefId}/exclusion_dates`,
    method: "GET",
    token,
  });

const deploySpotter = (
  reefId: number,
  data: DeploySpotterParams,
  token: string
) =>
  requests.send({
    url: `reefs/${reefId}/deploy`,
    method: "POST",
    data,
    token,
  });

const maintainSpotter = (
  reefId: number,
  data: MaintainSpotterParams,
  token: string
) =>
  requests.send({
    url: `reefs/${reefId}/exclusion_dates`,
    method: "POST",
    data,
    token,
  });

const getOceanSenseData = ({
  param,
  sensorID,
  startDate,
  endDate,
}: OceanSenseDataRequestParams) =>
  requests.send<OceanSenseDataResponse>({
    url: `https://us-central1-oceansense-app.cloudfunctions.net/queryData?sensorID=${sensorID}&param=${param}&startDate=${startDate}&endDate=${endDate}`,
    method: "GET",
  });

export default {
  getReef,
  getReefs,
  getReefDailyData,
  getReefLiveData,
  getReefTimeSeriesData,
  getReefTimeSeriesDataRange,
  getReefPois,
  deleteReefPoi,
  registerReef,
  applyReef,
  getReefApplication,
  updateReef,
  getExclusionDates,
  deploySpotter,
  maintainSpotter,
  getOceanSenseData,
};
