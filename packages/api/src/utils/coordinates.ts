import { Point } from 'geojson';

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

  // Normalize longitude and latitude depending on the boundingBox convention
  const tempLong =
    minLong >= 0
      ? (((long % 360) + 540) % 360) - 180
      : ((long + 180) % 360) - 180;

  const tempLat =
    minLat >= 0 ? (((lat % 180) + 270) % 180) - 90 : ((lat + 90) % 180) - 90;

  // Pixel (0, 0) is the top left corner.
  const pixelX = Math.round((Math.abs(tempLong - minLong) / geoWidth) * width);
  const pixelY =
    height - Math.round((Math.abs(tempLat - minLat) / geoHeight) * height);

  return { pixelX, pixelY };
}

export const createPoint = (longitude: number, latitude: number): Point => ({
  type: 'Point',
  coordinates: [longitude, latitude],
});
