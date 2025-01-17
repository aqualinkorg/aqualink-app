import L from 'leaflet';
import 'leaflet-markers-canvas';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLeaflet } from 'react-leaflet';

const CanvasIconLayerContext = createContext<L.LayerGroup | null>(null);
export const useCanvasIconLayer = () => {
  return useContext(CanvasIconLayerContext);
};

type CanvasMarkersLayerProps = {
  children: React.ReactNode | React.ReactNode[];
};
export const CanvasMarkersLayer = ({ children }: CanvasMarkersLayerProps) => {
  const { map } = useLeaflet();

  const [canvasIconLayer, setCanvasIconLayer] = useState<L.LayerGroup | null>(
    null,
  );

  useEffect(() => {
    if (map && !canvasIconLayer) {
      // @ts-ignore
      const markersCanvas = new L.MarkersCanvas();
      markersCanvas.addTo(map);
      setCanvasIconLayer(markersCanvas);
    }
  }, [map, canvasIconLayer]);

  return (
    <CanvasIconLayerContext.Provider value={canvasIconLayer}>
      {children}
    </CanvasIconLayerContext.Provider>
  );
};
