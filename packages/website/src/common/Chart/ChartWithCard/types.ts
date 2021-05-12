export type RangeValue = "three_months" | "one_year" | "max" | "custom";

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
}

export type Dataset = "spotter" | "hobo" | "sst";
