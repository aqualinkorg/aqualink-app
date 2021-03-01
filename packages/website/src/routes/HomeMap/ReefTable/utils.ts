import type { TableRow } from "../../../store/Homepage/types";

export type Order = "asc" | "desc";

export enum OrderKeys {
  LOCATION_NAME = "locationName",
  TEMP = "temp",
  DEPTH = "depth",
  DHW = "dhw",
  ALERT = "alert",
}

// This type isn't used anywhere, it just forces the above enum to only hold valid keys to TableRow.
type __CheckOrderKeys = TableRow[OrderKeys];

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  return b[orderBy] >= a[orderBy] ? 1 : -1;
}

export function getComparator(
  order: Order,
  orderBy: OrderKeys
): (
  a: {
    [key in OrderKeys]: number | string | null;
  },
  b: {
    [key in OrderKeys]: number | string | null;
  }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  // eslint-disable-next-line fp/no-mutating-methods
  return [...array].sort(comparator);
}
