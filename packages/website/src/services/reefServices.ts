import requests from "../helpers/requests";
import { SelectedReefState, ReefsListState } from "../store/Reefs/types";

const getReef = (id: string) =>
  requests.send<SelectedReefState["details"]>({
    url: `/reefs/${id}`,
    method: "GET",
  });

const getReefDailyData = (id: string) =>
  requests.send<SelectedReefState["details"]["dailyData"]>({
    url: `reefs/${id}/daily_data`,
    method: "GET",
  });

const getReefs = () =>
  requests.send<ReefsListState["list"]>({
    url: "reefs",
    method: "GET",
  });

export default {
  getReef,
  getReefs,
  getReefDailyData,
};
