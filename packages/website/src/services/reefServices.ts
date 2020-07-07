import requests from "../helpers/requests";
import { ReefState } from "../store/Reefs/types";

const getReef = (id: string) =>
  requests.send<ReefState["details"]>({
    url: `/reefs/${id}`,
    method: "GET",
  });

const getReefDailyData = (id: string) =>
  requests.send<ReefState["details"]["dailyData"]>({
    url: `reefs/${id}/daily_data`,
    method: "GET",
  });

export default {
  getReef,
  getReefDailyData,
};
