type SegmentsEntity = {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
};

export function segmentsTotalSortComparator<T extends SegmentsEntity>(
  a: T,
  b: T,
) {
  return b.s1 + b.s2 + b.s3 + b.s4 - (a.s1 + a.s2 + a.s3 + a.s4);
}
