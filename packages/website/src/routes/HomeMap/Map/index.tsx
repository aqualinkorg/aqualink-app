import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from 'react-leaflet';
import L, { LatLng, LatLngBounds, LayersControlEvent } from 'leaflet';
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
import { sitesListLoadingSelector } from 'store/Sites/sitesListSlice';
import {
  searchResultSelector,
  siteOnMapSelector,
} from 'store/Homepage/homepageSlice';
import { CollectionDetails } from 'store/Collection/types';
import { MapLayerName } from 'store/Homepage/types';
import { mapConstants } from 'constants/maps';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import InfoIcon from '@mui/icons-material/Info';
import { mapIconSize } from 'layout/App/theme';
import { SiteMarkers } from './Markers';
import { SofarLayers } from './sofarLayers';
import { InfoDialog } from './InfoDialog';
import Legend from './Legend';
import AlertLevelLegend from './alertLevelLegend';

const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const tileURL = accessToken
  ? `https://api.mapbox.com/styles/v1/eric-ovio/ckesyzu658klw19s6zc0adlgp/tiles/{z}/{x}/{y}@2x?access_token=${accessToken}`
  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x';

const attribution = accessToken
  ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
  : '';

const currentLocationMarker = L.divIcon({
  className: 'current-position-marker',
  iconSize: L.point(16, 16, true),
});

function MapEventsHandler({
  onBaseLayerChange,
  onMapReady,
}: {
  onBaseLayerChange: (e: LayersControlEvent) => void;
  onMapReady: () => void;
}) {
  const map = useMapEvents({
    baselayerchange: (e) => onBaseLayerChange(e),
  });

  useEffect(() => {
    if (map) {
      onMapReady();
    }
  }, [map, onMapReady]);

  return null;
}

function HomepageMap({
  initialCenter,
  initialZoom,
  showSiteTable = true,
  setShowSiteTable,
  initialBounds,
  collection,
  showAlertLevelLegend = true,
  showWaterMark = true,
  geolocationEnabled = true,
  defaultLayerName,
  legendBottom,
  legendLeft,
  classes,
  onMapLoad,
}: HomepageMapProps) {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [legendName, setLegendName] = useState<string>(defaultLayerName || '');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationAccuracy, setCurrentLocationAccuracy] =
    useState<number>();
  const [currentLocationErrorMessage, setCurrentLocationErrorMessage] =
    useState<string>();
  const [mapReady, setMapReady] = useState(false);
  const loading = useSelector(sitesListLoadingSelector);
  const searchResult = useSelector(searchResultSelector);
  const siteOnMap = useSelector(siteOnMapSelector);
  const ref = useRef<L.Map>(null);

  useEffect(() => {
    if (ref.current && onMapLoad) {
      onMapLoad(ref.current);
    }
    // We only want this effect to run once when the ref is set, or when onMapLoad changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, onMapLoad]);

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

          // zoom to user location
          const { current: map } = ref;
          if (map) {
            const newZoom = Math.max(map.getZoom() || 6, 8);
            map.flyTo(latLng, newZoom, { duration: 2 });
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
    const { current: map } = ref;
    if (map) {
      if (searchResult) {
        map.fitBounds([
          searchResult.bbox.southWest,
          searchResult.bbox.northEast,
        ]);
      }
    }
  }, [searchResult]);

  useEffect(() => {
    const { current: map } = ref;
    if (map && mapReady && siteOnMap?.polygon.type === 'Point') {
      const [lng, lat] = siteOnMap.polygon.coordinates;

      // Use the pre-calculated displayLng if available, otherwise use original lng
      const finalLng = siteOnMap.displayLng ?? lng;

      const latLng = [lat, finalLng] as [number, number];
      const pointBounds = L.latLngBounds(latLng, latLng);
      const maxZoom = Math.max(map.getZoom() || 6);
      map.flyToBounds(pointBounds, {
        duration: 3,
        maxZoom,
        paddingTopLeft: L.point(0, 200),
        noMoveStart: true,
      });
    }
  }, [siteOnMap, mapReady]);

  const onBaseLayerChange = ({ name }: LayersControlEvent) => {
    setLegendName(name);
  };

  const onMapReady = () => {
    setMapReady(true);
  };

  const ExpandIcon = showSiteTable ? FullscreenIcon : FullscreenExitIcon;

  // Memoize the layers to prevent unnecessary re-renders
  const sofarLayers = useMemo(
    () => <SofarLayers defaultLayerName={defaultLayerName} />,
    [defaultLayerName],
  );

  const siteMarkers = useMemo(
    () => <SiteMarkers collection={collection} />,
    [collection],
  );

  // Memoize the TileLayer to prevent unnecessary redraws
  const tileLayer = useMemo(
    () => (
      <TileLayer
        attribution={attribution}
        url={tileURL}
        keepBuffer={6}
        updateWhenIdle
        updateInterval={400}
        // Prevent tile fading animation which can cause flicker
        className="no-tile-fade"
      />
    ),
    [],
  );

  const handleInfoClick = () => {
    setInfoDialogOpen(true);
  };

  const handleInfoClose = () => {
    setInfoDialogOpen(false);
  };

  return loading ? (
    <div className={classes.loading}>
      <CircularProgress size="4rem" thickness={1} />
    </div>
  ) : (
    <MapContainer
      id="sites-map"
      ref={ref}
      preferCanvas
      renderer={L.canvas({ tolerance: 15 })}
      maxBoundsViscosity={1.0}
      className={classes.map}
      center={initialCenter}
      zoom={initialZoom}
      minZoom={collection ? 1 : 2} // If we're on dashboard page, the map's wrapping div is smaller, so we need to allow higher zoom
      worldCopyJump
      bounds={initialBounds}
      maxBounds={mapConstants.MAX_BOUNDS}
    >
      <Snackbar
        open={Boolean(currentLocationErrorMessage)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={onLocationErrorAlertClose}
      >
        <Alert severity="error" onClose={onLocationErrorAlertClose}>
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
              setTimeout(() => {
                if (ref.current) {
                  ref.current.invalidateSize();
                }
              });
            }}
            size="large"
          >
            <ExpandIcon color="primary" className={classes.expandIcon} />
          </IconButton>
        </div>
      </Hidden>
      <div className={classes.infoIconButton}>
        <IconButton onClick={handleInfoClick} size="large">
          <InfoIcon color="primary" />
        </IconButton>
      </div>
      <InfoDialog
        infoDialogOpen={infoDialogOpen}
        handleInfoClose={handleInfoClose}
      />
      {tileLayer}
      {sofarLayers}
      {siteMarkers}
      {currentLocation && (
        <Marker icon={currentLocationMarker} position={currentLocation} />
      )}
      {currentLocation && currentLocationAccuracy && (
        <Circle
          center={{ lat: currentLocation[0], lng: currentLocation[1] }}
          radius={currentLocationAccuracy}
        />
      )}
      <Legend legendName={legendName} bottom={legendBottom} left={legendLeft} />
      {showAlertLevelLegend && <AlertLevelLegend />}
      {showWaterMark && <div className="mapbox-wordmark" />}
      {geolocationEnabled && (
        <div className={classes.locationIconButton}>
          <IconButton onClick={onLocationSearch} size="large">
            <MyLocationIcon color="primary" />
          </IconButton>
        </div>
      )}
      <MapEventsHandler
        onBaseLayerChange={onBaseLayerChange}
        onMapReady={onMapReady}
      />
    </MapContainer>
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
};

const styles = (theme: Theme) =>
  createStyles({
    map: {
      flex: 1,
      width: '100%',
    },
    loading: {
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    locationIconButton: {
      ...mapButtonStyles,
      left: 0,
      top: 90,
      zIndex: 1000,
    },
    expandIconButton: {
      ...mapButtonStyles,
      right: 0,
      top: 50,
      zIndex: 400,
    },
    infoIconButton: {
      ...mapButtonStyles,
      right: 0,
      top: 100,
      zIndex: 400,
      [theme.breakpoints.down('lg')]: {
        top: 50,
      },
    },
    expandIcon: {
      fontSize: '34px',
    },
    '@global': {
      // Disable tile fade animation
      '.no-tile-fade': {
        '& .leaflet-tile-loaded': {
          opacity: '1 !important',
        },
      },
    },
  });

interface HomepageMapIncomingProps {
  initialCenter: LatLng;
  initialZoom?: number;
  showSiteTable?: boolean;
  setShowSiteTable?: React.Dispatch<React.SetStateAction<boolean>>;
  initialBounds?: LatLngBounds;
  collection?: CollectionDetails;
  showAlertLevelLegend?: boolean;
  showWaterMark?: boolean;
  geolocationEnabled?: boolean;
  defaultLayerName?: MapLayerName;
  legendBottom?: number;
  legendLeft?: number;
  onMapLoad?: (map: L.Map) => void;
}

type HomepageMapProps = WithStyles<typeof styles> & HomepageMapIncomingProps;

export default withStyles(styles)(HomepageMap);
