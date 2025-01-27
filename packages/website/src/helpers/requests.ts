import { setupCache } from 'axios-cache-interceptor';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { isUndefined, omitBy } from 'lodash';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    Accept: 'application/json, text/html',
    crossDomain: true,
  },
});

const cachedInstance = setupCache(instance);

const agent = (contentType?: string) => {
  cachedInstance.defaults.headers['Content-Type'] =
    contentType || 'application/json';

  return cachedInstance;
};

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
    responseType: request.responseType || 'json',
  });
}

const generateUrlQueryParams = (params: Record<string, any>) => {
  const stringifiedParams = new URLSearchParams({
    ...omitBy(params, isUndefined),
  }).toString();

  return stringifiedParams.length ? `?${stringifiedParams}` : '';
};

interface Request {
  method: AxiosRequestConfig['method'];
  url: AxiosRequestConfig['url'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  token?: string | null;
  responseType?: AxiosRequestConfig['responseType'];
  cancelToken?: AxiosRequestConfig['cancelToken'];
  contentType?: string;
}

export default {
  axiosInstance: cachedInstance,
  agent,
  send,
  generateUrlQueryParams,
};
