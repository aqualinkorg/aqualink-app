import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LocateControl as Locate } from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

export default function LocateControl() {
  const map = useMap();

  useEffect(() => {
    const lc = new Locate({
      setView: false,
      flyTo: false,
      showCompass: true,
    });
    lc.addTo(map);
    // start on load
    lc.start();
  }, [map]);

  return null;
}
