import React from 'react';
import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import LayersIcon from '@mui/icons-material/Layers';
import {
  SATELLITE_IMAGERY_LAYER_NAME,
  SOFAR_LAYERS,
  SST_ANOMALY_LAYER,
} from './sofarLayers';

function LayerSwitcher({
  activeLayer,
  onChange,
  showSstAnomaly,
  classes,
}: LayerSwitcherProps) {
  const layerNames = [
    SATELLITE_IMAGERY_LAYER_NAME,
    ...SOFAR_LAYERS.map((layer) => layer.name),
    ...(showSstAnomaly ? [SST_ANOMALY_LAYER.name] : []),
  ];

  return (
    <div className={classes.root}>
      <button
        type="button"
        className={classes.toggle}
        aria-label="Map layers"
        aria-haspopup="true"
      >
        <LayersIcon color="primary" />
      </button>
      <div
        className={classes.panel}
        role="group"
        aria-labelledby="map-layers-title"
      >
        <div id="map-layers-title" className={classes.title}>
          Map layers
        </div>
        {layerNames.map((name) => (
          <label
            key={name}
            className={classes.option}
            htmlFor={`map-layer-${name}`}
          >
            <input
              id={`map-layer-${name}`}
              type="radio"
              name="homepage-map-layer"
              checked={activeLayer === name}
              onChange={() => onChange(name)}
            />
            <span>{name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 2,
      pointerEvents: 'auto',
      '&:hover $panel, &:focus-within $panel': {
        display: 'block',
      },
    },
    toggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      padding: 0,
      borderRadius: 4,
      border: '2px solid rgba(0,0,0,0.2)',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    panel: {
      display: 'none',
      position: 'absolute',
      top: 0,
      right: 42,
      margin: 0,
      padding: '8px 12px',
      minWidth: 230,
      maxWidth: 'min(260px, calc(100vw - 72px))',
      border: '2px solid rgba(0,0,0,0.2)',
      borderRadius: 4,
      backgroundColor: 'white',
      color: '#333',
    },
    title: {
      display: 'block',
      margin: 0,
      padding: '2px 0 4px',
      fontSize: theme.typography.caption.fontSize,
      lineHeight: 1.2,
      // Theme text.primary is white; keep the title readable on the white panel.
      backgroundColor: 'white',
      color: '#333',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
      cursor: 'pointer',
      color: '#333',
      fontSize: theme.typography.body2.fontSize,
    },
  });

interface LayerSwitcherIncomingProps {
  activeLayer: string;
  onChange: (name: string) => void;
  showSstAnomaly: boolean;
}

type LayerSwitcherProps = LayerSwitcherIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(LayerSwitcher);
