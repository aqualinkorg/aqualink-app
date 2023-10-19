import { MetricsKeys } from 'store/Sites/types';

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export interface BaseSourceConfig {
  title: string;
  units: string;
  description: string;
  visibility: 'public' | 'admin' | 'none';
  order: number;
  convert?: number;
}

// Helper function to create a sub array containing valid elements from arrayA
export function createSubMetricsKeysArray<T extends MetricsKeys[]>(
  ...elements: T
) {
  return elements;
}

export enum MonitoringMetric {
  TimeSeriesRequest = 'time_series_request',
  CSVDownload = 'csv_download',
}
