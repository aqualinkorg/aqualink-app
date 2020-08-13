import axios from "axios";
import moment from "moment";

const getModelTimes = (modelName: string) => {
  const sofarUrl = "https://api.sofarocean.com/marine-weather/v1/models/";
  const { REACT_APP_SOFAR_API_TOKEN: token } = process.env;
  return axios({
    method: "GET",
    url: `${sofarUrl}${modelName}/outputTimes?token=${token}&closest=${moment
      .utc()
      .startOf("hour")
      .toISOString()}`,
  });
};

export default {
  getModelTimes,
};
