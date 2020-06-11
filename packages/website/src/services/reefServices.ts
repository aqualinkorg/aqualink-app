import requests from "../helpers/requests";
import { ReefState } from "../store/Reefs/types";

const getReef = (id: string) => {
  return requests.send<ReefState["details"]>({
    url: `/reefs/${id}`,
    method: "GET",
  });
};

export default {
  getReef,
};
