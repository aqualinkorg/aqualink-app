import React from "react";
import { LayersControl, TileLayer } from "react-leaflet";

type SofarLayerDefinition = {
  name: string;
  model: string;
  variableId: string;
  cmap: string;
};

const SOFAR_LAYERS: SofarLayerDefinition[] = [
  {
    name: "Sea Surface Temperature",
    model: "HYCOM",
    variableId: "seaSurfaceTemperature",
    cmap: "turbo",
  },
  {
    name: "NOAA Degree Heating Week",
    model: "NOAACoralReefWatch",
    variableId: "degreeHeatingWeek",
    cmap: "noaacoral",
  },
];

const { REACT_APP_SOFAR_API_TOKEN: API_TOKEN } = process.env;

const sofarUrlFromDef = ({ model, cmap, variableId }: SofarLayerDefinition) =>
  `https://api.sofarocean.com/marine-weather/v1/models/${model}/tile/{z}/{x}/{y}.png?colormap=${cmap}&token=${API_TOKEN}&variableID=${variableId}`;

export const SofarLayers = () => {
  return (
    <LayersControl position="topright">
      {SOFAR_LAYERS.map((def) => (
        <LayersControl.Overlay name={def.name} key={def.name}>
          <TileLayer
            url={sofarUrlFromDef(def)}
            key={def.variableId}
            opacity={0.5}
          />
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  );
};

export default SofarLayers;
