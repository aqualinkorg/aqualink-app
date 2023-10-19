import requests from 'helpers/requests';
import { MonitoringMetric } from 'utils/types';

interface postMonitoringMetricRequestProps {
  token?: string;
  metric: MonitoringMetric;
  siteId: number;
}

const postMonitoringMetric = ({
  token,
  ...rest
}: postMonitoringMetricRequestProps) =>
  requests.send<void>({
    method: 'POST',
    url: 'monitoring',
    data: {
      ...rest,
    },
    token,
  });

export default {
  postMonitoringMetric,
};
