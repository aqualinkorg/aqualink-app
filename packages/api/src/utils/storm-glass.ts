import axios from 'axios';
import axiosRetry from 'axios-retry';
import { SOFAR_MARINE_URL } from './constants';

axiosRetry(axios, { retries: 3 });

export async function sofarHindcast(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
  start: string,
  end: string,
) {
  return axios
    .get(`${SOFAR_MARINE_URL}${modelId}/hindcast/point`, {
      params: {
        variableIDs: [variableID],
        latitude,
        longitude,
        start,
        end,
        token: process.env.SOFAR_API_TOKEN,
      },
    })
    .then((response) => {
      return response.data.hindcastVariables[0];
    })
    .catch((error) => {
      if (error.response) {
        console.error(
          `Sofar Hindcast API responded with a ${error.response.status} status. ${error.response.data.message}`,
        );
      } else {
        console.error(
          `An error occurred accessing the Sofar Hindcast API - ${error}`,
        );
      }
    });
}
