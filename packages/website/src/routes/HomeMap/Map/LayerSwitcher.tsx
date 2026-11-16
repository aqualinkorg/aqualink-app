import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import LayersIcon from '@mui/icons-material/Layers';
import { mapIconSize } from 'layout/App/theme';
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const layerNames = [
    SATELLITE_IMAGERY_LAYER_NAME,
    ...SOFAR_LAYERS.map((layer) => layer.name),
    ...(showSstAnomaly ? [SST_ANOMALY_LAYER.name] : []),
  ];

  useEffect(() => {
    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const { target } = event;
      if (!root || !(target instanceof Node) || root.contains(target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePointerDown, true);
    return () =>
      document.removeEventListener(
        'pointerdown',
        closeOnOutsidePointerDown,
        true,
      );
  }, []);

  return (
    <div className={classes.root} ref={rootRef}>
      <button
        type="button"
        className={classes.toggle}
        aria-label="Map layers"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <LayersIcon color="primary" />
      </button>
      <div
        className={classes.panel}
        style={{ display: open ? 'block' : 'none' }}
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
    },
    toggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: mapIconSize,
      height: mapIconSize,
      padding: 0,
      borderRadius: 5,
      border: 'none',
      appearance: 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    panel: {
      position: 'absolute',
      top: 0,
      right: `calc(${mapIconSize} + 6px)`,
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
