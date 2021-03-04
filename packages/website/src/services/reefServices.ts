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
  SelectedReefState,
  DeploySpotterParams,
  MaintainSpotterParams,
  ExclusionDateResponse,
  MetricsKeys,
  HoboDataResponse,
  HoboDataRangeResponse,
} from "../store/Reefs/types";

const getReef = (id: string) =>
  requests.send<Reef>({
    url: `reefs/${id}`,
    method: "GET",
  });

const getReefDailyData = (id: string) =>
  requests.send<DailyData[]>({
    url: `reefs/${id}/daily_data`,
    method: "GET",
  });

const getReefLiveData = (id: string) =>
  requests.send<LiveData>({
    url: `reefs/${id}/live_data`,
    method: "GET",
  });

const getReefSpotterData = (id: string, startDate: string, endDate: string) =>
  requests.send<SelectedReefState["spotterData"]>({
    url: `reefs/${id}/spotter_data?endDate=${endDate}&startDate=${startDate}`,
    method: "GET",
  });

const getReefHoboData = (
  reefId: string,
  pointId: string,
  start: string,
  end: string,
  metrics: MetricsKeys[]
) =>
  requests.send<HoboDataResponse>({
    url: `time-series/reefs/${reefId}/pois/${pointId}?start=${start}&end=${end}&metrics=${metrics.join()}&hourly=true`,
    method: "GET",
  });

const getReefHoboDataRange = (reefId: string, pointId: string) =>
  requests.send<HoboDataRangeResponse>({
    url: `time-series/reefs/${reefId}/pois/${pointId}/range`,
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
    url: `pois?reef=${id}`,
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

export default {
  getReef,
  getReefs,
  getReefDailyData,
  getReefLiveData,
  getReefSpotterData,
  getReefHoboData,
  getReefHoboDataRange,
  getReefPois,
  deleteReefPoi,
  registerReef,
  applyReef,
  getReefApplication,
  updateReef,
  getExclusionDates,
  deploySpotter,
  maintainSpotter,
};
