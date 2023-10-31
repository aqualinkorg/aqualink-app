import requests from 'helpers/requests';
import { MonitoringMetric } from 'utils/types';

interface PostMonitoringMetricRequestProps {
  token?: string;
  metric: MonitoringMetric;
  siteId: number;
}

const postMonitoringMetric = ({
  token,
  ...rest
}: PostMonitoringMetricRequestProps) =>
  requests.send<void>({
    method: 'POST',
    url: 'monitoring',
    data: {
      ...rest,
    },
    token,
  });

interface GetMonitoringMetricsRequestProps {
  token: string;
  spotterId?: string;
  siteIds?: string[];
  monthly?: boolean;
  start?: string;
  end?: string;
}

export interface MonitoringData {
  date: string;
  totalRequests: number;
  registeredUserRequests: number;
  siteAdminRequests: number;
  timeSeriesRequests: number;
  CSVDownloadRequests: number;
}

export type GetMonitoringMetricsResponse = {
  siteName: string;
  siteId: number;
  data: MonitoringData[];
}[];

const getMonitoringStats = ({
  token,
  ...rest
}: GetMonitoringMetricsRequestProps) =>
  requests.send<GetMonitoringMetricsResponse>({
    method: 'GET',
    url: `monitoring${requests.generateUrlQueryParams(rest)}`,
    token,
  });

export default {
  postMonitoringMetric,
  getMonitoringStats,
};
