import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import Locate from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

export default function LocateControl() {
  const map = useMap();

  useEffect(() => {
    const locateOptions = {
      setView: false,
      flyTo: false,
      showCompass: true,
    };

    // @ts-ignore
    const lc = new Locate(locateOptions);
    lc.addTo(map);
    // start on load
    lc.start(locateOptions);
  }, [map]);

  return null;
}
