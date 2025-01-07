import { LeafletEventHandlerFn } from 'leaflet';
import { useMapEvents } from 'react-leaflet';

type LocationMapEventsProps = {
  updateMarkerPosition: (position: [number, number]) => void;
  onZoomEnd: LeafletEventHandlerFn;
};

export const LocationMapEvents = ({
  updateMarkerPosition,
  onZoomEnd,
}: LocationMapEventsProps) => {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng.wrap();
      updateMarkerPosition([lat, lng]);
    },
    zoomend: onZoomEnd,
  });
  return null;
};
