import axios, { AxiosRequestConfig } from "axios";

const agent = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    crossDomain: true,
  },
  // withCredentials: true
});

function send<T>(request: Request): Promise<T> {
  const headers = request.token
    ? { Authorization: `Bearer ${request.token}` }
    : {};
  return agent.request({
    method: request.method,
    url: request.url,
    headers,
    data: request.data,
    params: request.params,
    responseType: request.responseType || "json",
  });
}

interface Request {
  method: AxiosRequestConfig["method"];
  url: AxiosRequestConfig["url"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  token?: string;
  responseType?: AxiosRequestConfig["responseType"];
}

export default {
  send,
};
