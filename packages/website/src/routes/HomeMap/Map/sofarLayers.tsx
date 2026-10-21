import React, { useEffect, useState } from 'react';
import { LayersControl, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MapLayerName } from 'store/Homepage/types';
import {
  fetchLatestOisstAnomalyWmsUrl,
  fetchHistoricalOisstWmsUrl,
} from './oisstAnomalyWms';

type SofarLayerDefinition = {
  name: MapLayerName;
  model: string;
  variableId: string;
  cmap: string;
};

const SOFAR_LAYERS: SofarLayerDefinition[] = [
  {
    name: 'Sea Surface Temperature',
    model: 'NOAACoralReefWatch',
    variableId: 'analysedSeaSurfaceTemperature',
    cmap: 'turbo',
  },
  {
    name: 'Heat Stress',
    model: 'NOAACoralReefWatch',
    variableId: 'degreeHeatingWeek',
    cmap: 'noaacoral',
  },
];

const SST_ANOMALY_LAYER = {
  name: 'SST Anomaly' as const satisfies MapLayerName,
  layer: 'anom',
};

const { REACT_APP_SOFAR_API_TOKEN: API_TOKEN } = process.env;

const sofarUrlFromDef = ({ model, cmap, variableId }: SofarLayerDefinition) =>
  `https://api.sofarocean.com/marine-weather/v1/models/${model}/tile/{z}/{x}/{y}.png?colormap=${cmap}&token=${API_TOKEN}&variableID=${variableId}`;

function useLatestOisstAnomalyWmsUrl(asOf?: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (asOf
      ? fetchHistoricalOisstWmsUrl(asOf, controller.signal)
      : fetchLatestOisstAnomalyWmsUrl(controller.signal)
    )
      .then((resolved) => {
        if (!controller.signal.aborted) {
          setUrl(resolved);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUrl(null);
        }
      });
    return () => controller.abort();
  }, [asOf]);

  return url;
}

export function SofarLayers({ defaultLayerName, asOf }: SofarLayersProps) {
  const sstAnomalyWmsUrl = useLatestOisstAnomalyWmsUrl(asOf);

  if (asOf) {
    return (
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          checked={!defaultLayerName || defaultLayerName === 'Heat Stress'}
          name="Satellite Imagery"
        >
          <TileLayer url="" />
        </LayersControl.BaseLayer>
        {sstAnomalyWmsUrl &&
          [
            { name: 'Sea Surface Temperature', layer: 'sst', scale: '0,35' },
            { name: 'SST Anomaly', layer: 'anom', scale: '-5,5' },
          ].map(({ name, layer, scale }) => (
            <LayersControl.BaseLayer
              key={layer}
              checked={defaultLayerName === name}
              name={name}
            >
              <WMSTileLayer
                layers={layer}
                styles="raster/default"
                transparent
                format="image/png"
                opacity={0.7}
                url={`${sstAnomalyWmsUrl}?COLORSCALERANGE=${scale}`}
              />
            </LayersControl.BaseLayer>
          ))}
      </LayersControl>
    );
  }

  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer
        checked={!defaultLayerName}
        name="Satellite Imagery"
        key="no-verlay"
      >
        <TileLayer url="" key="no-overlay" />
      </LayersControl.BaseLayer>
      {SOFAR_LAYERS.map((def) => (
        <LayersControl.BaseLayer
          checked={def.name === defaultLayerName}
          name={def.name}
          key={def.name}
        >
          <TileLayer
            // Sofar tiles have a max native zoom of 9
            maxNativeZoom={9}
            url={sofarUrlFromDef(def)}
            key={def.variableId}
            opacity={0.5}
          />
        </LayersControl.BaseLayer>
      ))}
      {sstAnomalyWmsUrl && (
        <LayersControl.BaseLayer
          checked={SST_ANOMALY_LAYER.name === defaultLayerName}
          name={SST_ANOMALY_LAYER.name}
          key={SST_ANOMALY_LAYER.name}
        >
          <WMSTileLayer
            layers={SST_ANOMALY_LAYER.layer}
            styles="raster/x-Sst"
            transparent
            format="image/png"
            opacity={0.7}
            url={sstAnomalyWmsUrl}
          />
        </LayersControl.BaseLayer>
      )}
    </LayersControl>
  );
}

interface SofarLayersProps {
  asOf?: string;
  defaultLayerName?: MapLayerName;
}

export default SofarLayers;
