import { useEffect, useState } from 'react';
import requests from '../helpers/requests';

interface SeapHOxMetric {
  metric: string;
  value: number | null;
}

export const useSeapHOxData = (siteId: number) => {
  const [data, setData] = useState<SeapHOxMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeapHOxData = async () => {
      try {
        setLoading(true);

        // Fetch the last 24 hours of SeapHOx data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 24);

        const metrics = [
          'seaphox_temperature',
          'seaphox_external_ph',
          'seaphox_pressure',
          'seaphox_salinity',
          'seaphox_conductivity',
          'seaphox_oxygen',
        ];

        const response = await requests.send<any>({
          url: `/time-series/sites/${siteId}${requests.generateUrlQueryParams({
            metrics: metrics.join(','),
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          })}`,
          method: 'GET',
        });

        // Transform the response to get the latest value for each metric
        const latestValues: SeapHOxMetric[] = metrics.map((metric) => {
          const metricData = response.data?.[metric];
          const latestDataPoint = metricData?.[metricData.length - 1];

          return {
            metric,
            value: latestDataPoint?.value ?? null,
          };
        });

        setData(latestValues);
        setError(null);
      } catch (err) {
        console.error('Error fetching SeapHOx data:', err);
        setError('Failed to load SeapHOx data');
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchSeapHOxData();
    }
  }, [siteId]);

  return { data, loading, error };
};
