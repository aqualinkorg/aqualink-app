import { DataRange, ValueWithTimestamp } from 'store/Sites/types';

export type RangeValue = 'one_month' | 'one_year' | 'max' | 'custom';

export interface RangeButton {
  id: RangeValue;
  title: string;
  disabled?: boolean;
  tooltip: string;
}

export interface CardColumn {
  title: string;
  key: string;
  color: string;
  rows: { key: string; value: number | undefined }[];
  tooltip?: string;
  display: boolean;
  unit: string;
}

export interface OceanSenseDataset {
  unit: string;
  data: ValueWithTimestamp[];
  title: string;
  id: string;
}

export interface AvailableRange {
  name: string;
  data?: DataRange[];
}

export interface CSVColumnData {
  name: string;
  values: ValueWithTimestamp[];
}
