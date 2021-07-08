import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const agent = (contentType?: string) =>
  axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      "Content-Type": contentType || "application/json",
      Accept: "application/json, text/html",
      crossDomain: true,
    },
  });

function send<T>(request: Request): Promise<AxiosResponse<T>> {
  const headers = request.token
    ? { Authorization: `Bearer ${request.token}` }
    : {};
  return agent(request.contentType).request<T>({
    method: request.method,
    url: request.url,
    headers,
    data: request.data,
    params: request.params,
    cancelToken: request.cancelToken,
    responseType: request.responseType || "json",
  });
}

interface Request {
  method: AxiosRequestConfig["method"];
  url: AxiosRequestConfig["url"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  token?: string | null;
  responseType?: AxiosRequestConfig["responseType"];
  cancelToken?: AxiosRequestConfig["cancelToken"];
  contentType?: string;
}

export default {
  agent,
  send,
};
