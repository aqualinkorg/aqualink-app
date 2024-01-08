import { useEffect } from 'react';
import { useLeaflet } from 'react-leaflet';
import Locate from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

export default function LocateControl() {
  const { map } = useLeaflet();

  useEffect(() => {
    // geo locate props
    const locateOptions = {
      startDirectly: true,
      setView: false,
      flyTo: false,
      showCompass: true,
      onActivate: () => {}, // callback before engine starts retrieving locations
    };

    // @ts-ignore
    const lc = new Locate(locateOptions);
    lc.addTo(map);
    // start on load
    lc.start(locateOptions);
  }, [map]);

  return null;
}
