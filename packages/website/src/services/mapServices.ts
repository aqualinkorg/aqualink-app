import axios from "axios";
import moment from "moment";

const getModelTimes = (modelName: string) =>
  axios({
    method: "GET",
    url: `${
      process.env.REACT_APP_SOFAR_API_BASE_URL
    }${modelName}/outputTimes?token=${
      process.env.REACT_APP_SOFAR_API_TOKEN
    }&closest=${moment.utc().startOf("hour").toISOString()}`,
  });

export default {
  getModelTimes,
};
