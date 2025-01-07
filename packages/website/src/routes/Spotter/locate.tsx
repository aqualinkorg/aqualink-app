import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LocateControl as Locate, LocateOptions } from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';

export default function LocateControl() {
  const map = useMap();

  useEffect(() => {
    const locateOptions: LocateOptions = {
      setView: false,
      flyTo: false,
      showCompass: true,
    };

    const lc = new Locate(locateOptions);
    lc.addTo(map);
    // start on load
    lc.start();
  }, [map]);

  return null;
}
