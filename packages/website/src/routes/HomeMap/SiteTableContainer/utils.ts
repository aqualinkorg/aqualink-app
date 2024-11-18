import { startCase } from 'lodash';
import type { TableRow } from 'store/Homepage/types';

export type Order = 'asc' | 'desc';

export enum OrderKeys {
  ALERT = 'alert',
  DEPTH = 'depth',
  DHW = 'dhw',
  LOCATION_NAME = 'locationName',
  SST = 'sst',
  HISTORIC_MAX = 'historicMax',
  SST_ANOMALY = 'sstAnomaly',
  BUOY_TOP = 'buoyTop',
  BUOY_BOTTOM = 'buoyBottom',
}

// This type isn't used anywhere, it just forces the above enum to only hold valid keys to TableRow.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type __CheckOrderKeys = TableRow[OrderKeys];

/**
 * Returns a human friendly string of a order key.
 * @param orderKey key to return the string for.
 */
export function getOrderKeysFriendlyString(orderKey: OrderKeys) {
  switch (orderKey) {
    case OrderKeys.DHW:
      return 'DHW';
    default:
      return startCase(orderKey);
  }
}

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  return b[orderBy] >= a[orderBy] ? 1 : -1;
}

export function getComparator(
  order: Order,
  orderBy: OrderKeys,
): (
  a: {
    [key in OrderKeys]: number | string | null;
  },
  b: {
    [key in OrderKeys]: number | string | null;
  },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  // eslint-disable-next-line fp/no-mutating-methods
  return [...array].sort(comparator);
}
