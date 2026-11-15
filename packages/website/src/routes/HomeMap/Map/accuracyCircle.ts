const EARTH_RADIUS_M = 6378137;

export const accuracyCirclePolygon = (
  latitude: number,
  longitude: number,
  radiusMeters: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> => {
  const lat1 = (latitude * Math.PI) / 180;
  const lng1 = (longitude * Math.PI) / 180;
  const angularDistance = radiusMeters / EARTH_RADIUS_M;
  const ring = Array.from({ length: steps + 1 }, (_, index) => {
    const bearing = (index / steps) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
      );
    return [(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI] as [number, number];
  });

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  };
};
