import { setupCache } from 'axios-cache-interceptor';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { isUndefined, omitBy } from 'lodash';

const instance = axios.create({
  baseURL:
    process.env.REACT_APP_API_BASE_URL ||
    'https://production-dot-ocean-systems.uc.r.appspot.com/api',
  headers: {
    Accept: 'application/json, text/html',
    crossDomain: true,
  },
});

// Lazy initialization: only setup cache when first accessed (inside a handler)
// This prevents async I/O operations in global scope
let cachedInstance: ReturnType<typeof setupCache> | null = null;

const getCachedInstance = () => {
  if (!cachedInstance) {
    // eslint-disable-next-line fp/no-mutation
    cachedInstance = setupCache(instance);
  }
  return cachedInstance;
};

const agent = (contentType?: string) => {
  const instanceToUse = getCachedInstance();
  // eslint-disable-next-line fp/no-mutation
  instanceToUse.defaults.headers['Content-Type'] =
    contentType || 'application/json';

  return instanceToUse;
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
  get axiosInstance() {
    return getCachedInstance();
  },
  agent,
  send,
  generateUrlQueryParams,
};
