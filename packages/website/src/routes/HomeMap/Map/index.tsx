import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
/* eslint-disable import/no-unresolved -- package exports map; node resolver predates exports */
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  useMap,
  type MapRef,
} from 'react-map-gl/maplibre';
/* eslint-enable import/no-unresolved */
import { setWorkerUrl, type Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CircularProgress,
  IconButton,
  Snackbar,
  Hidden,
  Alert,
  Theme,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles, {
  CreateCSSProperties,
  CSSProperties,
} from '@mui/styles/withStyles';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import InfoIcon from '@mui/icons-material/Info';
import { sitesListLoadingSelector } from 'store/Sites/sitesListSlice';
import {
  searchResultSelector,
  siteOnMapSelector,
} from 'store/Homepage/homepageSlice';
import type { HomepageMapHandle } from 'helpers/homepageMapHandle';
import { createHomepageMapHandle } from 'helpers/maplibreFocus';
import { mapIconSize } from 'layout/App/theme';
import { GlobeSiteMarkers } from './GlobeMarkers';
import { InfoDialog } from './InfoDialog';
import Legend from './Legend';
import AlertLevelLegend from './alertLevelLegend';
import LayerSwitcher from './LayerSwitcher';
import {
  SATELLITE_IMAGERY_LAYER_NAME,
  SOFAR_LAYERS,
  SST_ANOMALY_LAYER,
  sofarTileUrl,
  useLatestOisstAnomalyWmsUrl,
} from './sofarLayers';
import { buildOisstAnomalyTileTemplate } from './oisstAnomalyWms';
import { accuracyCirclePolygon } from './accuracyCircle';
import {
  globeMapStyle,
  globeSky,
  satelliteAttribution,
  satelliteTileUrl,
} from './basemap';

// Rspack rewrites import.meta.url inside maplibre-gl, so the library cannot
// find its worker. 6.4.1's worker imports ./maplibre-gl-shared.mjs, and
// `new URL(...)` emits the worker without that sibling.
setWorkerUrl('/maplibre-gl-worker.mjs');

function MapHandleBinder({
  onReady,
}: {
  onReady: (map: MaplibreMap) => void | (() => void);
}) {
  const { current } = useMap();

  useEffect(() => {
    if (!current) {
      return undefined;
    }
    return onReady(current.getMap() as MaplibreMap);
  }, [current, onReady]);

  return null;
}

function HomepageMap({
  initialCenter,
  initialZoom,
  showSiteTable = true,
  setShowSiteTable,
  showAlertLevelLegend = true,
  geolocationEnabled = true,
  classes,
  onMapLoad,
}: HomepageMapProps) {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string>(
    SATELLITE_IMAGERY_LAYER_NAME,
  );
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationAccuracy, setCurrentLocationAccuracy] =
    useState<number>();
  const [currentLocationErrorMessage, setCurrentLocationErrorMessage] =
    useState<string>();
  const [mapReady, setMapReady] = useState(false);
  const loading = useSelector(sitesListLoadingSelector);
  const searchResult = useSelector(searchResultSelector);
  const siteOnMap = useSelector(siteOnMapSelector);
  const mapRef = useRef<MapRef>(null);
  const handleRef = useRef<HomepageMapHandle | null>(null);
  const sstAnomalyWmsUrl = useLatestOisstAnomalyWmsUrl();
  const locationAccuracyCircle = useMemo(() => {
    if (!currentLocation || !currentLocationAccuracy) {
      return null;
    }
    return accuracyCirclePolygon(
      currentLocation[0],
      currentLocation[1],
      currentLocationAccuracy,
    );
  }, [currentLocation, currentLocationAccuracy]);

  const onMapReady = useCallback(
    (map: MaplibreMap) => {
      const handle = createHomepageMapHandle(map);
      handleRef.current = handle;
      setMapReady(true);
      onMapLoad?.(handle);
      return () => {
        if (handleRef.current === handle) {
          handleRef.current = null;
          setMapReady(false);
        }
        onMapLoad?.(null);
      };
    },
    [onMapLoad],
  );

  const resizeMap = () => {
    window.setTimeout(() => {
      mapRef.current?.resize();
    }, 0);
  };

  const onLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng = [
            position.coords.latitude,
            position.coords.longitude,
          ] as [number, number];
          setCurrentLocation(latLng);
          setCurrentLocationAccuracy(position.coords.accuracy);

          const map = mapRef.current;
          if (map) {
            const newZoom = Math.max(map.getZoom() || 6, 8);
            map.flyTo({
              center: [latLng[1], latLng[0]],
              zoom: newZoom,
              duration: 2000,
              essential: true,
            });
          }
        },
        () => {
          setCurrentLocationErrorMessage('Unable to find your location');
        },
      );
    } else {
      setCurrentLocationErrorMessage(
        'Geolocation is not supported by your browser',
      );
    }
  };

  const onLocationErrorAlertClose = () =>
    setCurrentLocationErrorMessage(undefined);

  useEffect(() => {
    if (!mapReady || !searchResult) {
      return;
    }
    handleRef.current?.fitBounds(
      searchResult.bbox.southWest,
      searchResult.bbox.northEast,
    );
  }, [searchResult, mapReady]);

  useEffect(() => {
    if (!mapReady || siteOnMap?.polygon.type !== 'Point') {
      return;
    }
    const [lng, lat] = siteOnMap.polygon.coordinates;
    const finalLng = siteOnMap.displayLng ?? lng;
    handleRef.current?.focusOnSite(lat, finalLng);
  }, [siteOnMap, mapReady]);

  useEffect(() => {
    if (mapReady) {
      resizeMap();
    }
  }, [showSiteTable, mapReady]);

  const ExpandIcon = showSiteTable ? FullscreenIcon : FullscreenExitIcon;

  return loading ? (
    <div className={classes.loading}>
      <CircularProgress size="4rem" thickness={1} />
    </div>
  ) : (
    <div className={classes.map}>
      <Map
        id="sites-map"
        ref={mapRef}
        initialViewState={{
          longitude: initialCenter.lng,
          latitude: initialCenter.lat,
          zoom: initialZoom ?? 10,
        }}
        mapStyle={globeMapStyle}
        projection="globe"
        sky={globeSky}
        minZoom={2}
        maxZoom={18}
        renderWorldCopies={false}
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        fadeDuration={0}
        style={{ width: '100%', height: '100%' }}
      >
        <MapHandleBinder onReady={onMapReady} />
        <NavigationControl position="top-left" showCompass={false} />
        <Source
          id="satellite"
          type="raster"
          tiles={[satelliteTileUrl]}
          tileSize={256}
          attribution={satelliteAttribution || undefined}
        >
          <Layer id="satellite" type="raster" />
        </Source>
        {SOFAR_LAYERS.map((def) => (
          <Source
            key={def.variableId}
            id={`sofar-${def.variableId}`}
            type="raster"
            tiles={[sofarTileUrl(def)]}
            tileSize={256}
            maxzoom={9}
          >
            <Layer
              id={`sofar-${def.variableId}`}
              type="raster"
              paint={{ 'raster-opacity': 0.5 }}
              layout={{
                visibility: activeLayer === def.name ? 'visible' : 'none',
              }}
            />
          </Source>
        ))}
        {sstAnomalyWmsUrl && (
          <Source
            id="oisst-anomaly"
            type="raster"
            tiles={[buildOisstAnomalyTileTemplate(sstAnomalyWmsUrl)]}
            tileSize={256}
          >
            <Layer
              id="oisst-anomaly"
              type="raster"
              paint={{ 'raster-opacity': 0.7 }}
              layout={{
                visibility:
                  activeLayer === SST_ANOMALY_LAYER.name ? 'visible' : 'none',
              }}
            />
          </Source>
        )}
        <GlobeSiteMarkers />
        {currentLocation && (
          <Marker
            longitude={currentLocation[1]}
            latitude={currentLocation[0]}
            anchor="center"
          >
            <div
              className="current-position-marker"
              style={{ width: 16, height: 16 }}
            />
          </Marker>
        )}
        {locationAccuracyCircle ? (
          <Source
            id="geolocation-accuracy"
            type="geojson"
            data={locationAccuracyCircle}
          >
            <Layer
              id="geolocation-accuracy-fill"
              type="fill"
              paint={{ 'fill-color': '#3388ff', 'fill-opacity': 0.2 }}
            />
            <Layer
              id="geolocation-accuracy-line"
              type="line"
              paint={{ 'line-color': '#3388ff', 'line-width': 3 }}
            />
          </Source>
        ) : null}
        <div className={classes.overlay}>
          <Snackbar
            open={Boolean(currentLocationErrorMessage)}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            onClose={onLocationErrorAlertClose}
          >
            <Alert
              className={classes.locationAlert}
              severity="error"
              onClose={onLocationErrorAlertClose}
            >
              {currentLocationErrorMessage}
            </Alert>
          </Snackbar>
          <Hidden mdDown>
            <div className={classes.expandIconButton}>
              <IconButton
                onClick={() => {
                  if (setShowSiteTable) {
                    setShowSiteTable((prev) => !prev);
                  }
                }}
                size="large"
              >
                <ExpandIcon color="primary" className={classes.expandIcon} />
              </IconButton>
            </div>
          </Hidden>
          <div className={classes.infoIconButton}>
            <IconButton onClick={() => setInfoDialogOpen(true)} size="large">
              <InfoIcon color="primary" />
            </IconButton>
          </div>
          <InfoDialog
            infoDialogOpen={infoDialogOpen}
            handleInfoClose={() => setInfoDialogOpen(false)}
          />
          <LayerSwitcher
            activeLayer={activeLayer}
            showSstAnomaly={Boolean(sstAnomalyWmsUrl)}
            onChange={setActiveLayer}
          />
          <Legend legendName={activeLayer} />
          {showAlertLevelLegend && <AlertLevelLegend />}
          <div className="mapbox-wordmark" />
          {geolocationEnabled && (
            <div className={classes.locationIconButton}>
              <IconButton onClick={onLocationSearch} size="large">
                <MyLocationIcon color="primary" />
              </IconButton>
            </div>
          )}
        </div>
      </Map>
    </div>
  );
}

const mapButtonStyles: CSSProperties | CreateCSSProperties<{}> = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  height: mapIconSize,
  width: mapIconSize,
  borderRadius: 5,
  margin: '10px',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  border: '2px solid rgba(0,0,0,0.2)',
  pointerEvents: 'auto',
};

const styles = (theme: Theme) =>
  createStyles({
    map: {
      flex: 1,
      width: '100%',
      display: 'flex',
      minHeight: 0,
      backgroundColor: '#0b1d2a',
      // Covered markers stay in the DOM at opacity 0 and would still take clicks.
      '& .maplibregl-marker-covered': {
        pointerEvents: 'none',
      },
    },
    loading: {
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 1,
    },
    locationAlert: {
      pointerEvents: 'auto',
    },
    locationIconButton: {
      ...mapButtonStyles,
      left: 0,
      top: 90,
      zIndex: 2,
    },
    expandIconButton: {
      ...mapButtonStyles,
      right: 0,
      top: 50,
      zIndex: 2,
    },
    infoIconButton: {
      ...mapButtonStyles,
      right: 0,
      top: 100,
      zIndex: 2,
      [theme.breakpoints.down('lg')]: {
        top: 50,
      },
    },
    expandIcon: {
      fontSize: '34px',
    },
  });

interface LatLngLike {
  lat: number;
  lng: number;
}

interface HomepageMapIncomingProps {
  initialCenter: LatLngLike;
  initialZoom?: number;
  showSiteTable?: boolean;
  setShowSiteTable?: React.Dispatch<React.SetStateAction<boolean>>;
  showAlertLevelLegend?: boolean;
  geolocationEnabled?: boolean;
  onMapLoad?: (map: HomepageMapHandle | null) => void;
}

type HomepageMapProps = WithStyles<typeof styles> & HomepageMapIncomingProps;

export default withStyles(styles)(HomepageMap);
