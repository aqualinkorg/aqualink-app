export type RangeValue = "three_months" | "one_year" | "max" | "custom";

export interface RangeButton {
  id: RangeValue;
  title: string;
  disabled?: boolean;
  tooltip: string;
}

export interface CardColumn {
  title: string;
  titleClass: string;
  rows: {
    max: string;
    mean: string;
    min: string;
  };
  display: boolean;
}
