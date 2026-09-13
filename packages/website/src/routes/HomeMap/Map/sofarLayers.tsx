import React, { useEffect, useState } from 'react';
import { LayersControl, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MapLayerName } from 'store/Homepage/types';
import {
  buildOisstAnomalyWmsUrl,
  fetchLatestOisstAnomalyWmsUrl,
  oisstPreliminaryDatasetPathForDate,
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

  useEffect(() => {
    const controller = new AbortController();

    if (historicalDate) {
      // Daily files are named deterministically, so the WMS URL for the
      // selected date can be built directly. If NCEI no longer serves that
      // file, its tiles fail to load and the layer stays blank.
      const datasetPath = oisstPreliminaryDatasetPathForDate(historicalDate);
      setUrl(datasetPath ? buildOisstAnomalyWmsUrl(datasetPath) : null);
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

  return url;
}

export function SofarLayers({
  defaultLayerName,
  historicalDate,
}: SofarLayersProps) {
  const sstAnomalyWmsUrl = useOisstAnomalyWmsUrl(historicalDate);

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
  /** ISO date (yyyy-MM-dd). When set, the SST Anomaly layer serves that date. */
  historicalDate?: string | null;
}

export default SofarLayers;
