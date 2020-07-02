export type Extent = [number, number, number, number];

export function pointToPixel(
  lat: number,
  long: number,
  boundingBox: Extent,
  height: number,
  width: number,
) {
  const [minLong, minLat, maxLong, maxLat] = boundingBox;

  const tempLat = ((lat - minLat) % 180) + minLat;
  const tempLong = ((long - minLong) % 360) + minLong;

  const x = ((tempLong - minLong) / (maxLong - minLong)) * width;
  const y = ((tempLat - minLat) / (maxLat - minLat)) * height;

  return { x, y };
}
