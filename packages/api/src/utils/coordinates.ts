export type Extent = [number, number, number, number];

export function pointToPixel(
  long: number,
  lat: number,
  boundingBox: Extent,
  width: number,
  height: number,
) {
  const [minLong, minLat, maxLong, maxLat] = boundingBox;

  const geoWidth = Math.abs(maxLong - minLong);
  const geoHeight = Math.abs(maxLat - minLat);

  const tempLat = ((lat - minLat) % 180) + minLat;
  const tempLong = ((long - minLong) % 360) + minLong;

  const pixelX = Math.round(((tempLong - minLong) / geoWidth) * width);
  const pixelY = Math.round(((tempLat - minLat) / geoHeight) * height);

  return { pixelX, pixelY };
}
