import { AxiosResponse } from "axios";

import requests from "../helpers/requests";
import { ReefState } from "../store/Reefs/types";

const getReef = (id: string): Promise<ReefResponse> => {
  return requests.send<ReefResponse>({
    url: `/reefs/${id}`,
    method: "GET",
  });
};

export default {
  getReef,
};

type ReefResponse = AxiosResponse<ReefState["details"]>;
