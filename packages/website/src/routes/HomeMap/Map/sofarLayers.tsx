import React, { useEffect, useState } from 'react';
import { LayersControl, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MapLayerName } from 'store/Homepage/types';
import {
  fetchLatestOisstAnomalyWmsUrl,
  fetchOisstAnomalyWmsUrlForDate,
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

function useOisstAnomalyWmsUrl(historicalDate?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    if (historicalDate) {
      // NCEI prunes daily preliminary files after ~two weeks, so the date has
      // to be probed: a path that is no longer served would render a blank
      // layer with nothing to tell the user.
      setChecking(true);
      fetchOisstAnomalyWmsUrlForDate(historicalDate, controller.signal)
        .then((resolved) => {
          if (!controller.signal.aborted) {
            setUrl(resolved);
            setChecking(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setUrl(null);
            setChecking(false);
          }
        });
      return () => controller.abort();
    }

    fetchLatestOisstAnomalyWmsUrl(controller.signal)
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
  }, [historicalDate]);

  return { url, checking };
}

export { useOisstAnomalyWmsUrl };

export function SofarLayers({
  defaultLayerName,
  historicalDate,
  sstAnomalyWmsUrl,
}: SofarLayersProps) {
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
          key={`${SST_ANOMALY_LAYER.name}-${historicalDate || 'latest'}`}
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
  defaultLayerName?: MapLayerName;
  /** ISO date (yyyy-MM-dd). Only used to re-mount the anomaly layer per date. */
  historicalDate?: string | null;
  /** WMS url of the anomaly layer for the current (or selected) date. */
  sstAnomalyWmsUrl: string | null;
}

export default SofarLayers;
