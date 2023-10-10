import L from 'leaflet';

export const mapConstants = {
  // Allow the map to move infinitely left or right but force it
  // between the two poles.
  MAX_BOUNDS: L.latLngBounds(L.latLng(-90, -Infinity), L.latLng(90, Infinity)),
};
