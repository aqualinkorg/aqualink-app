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
import { focusMapOnSite } from 'helpers/map';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import InfoIcon from '@mui/icons-material/Info';
import { mapIconSize } from 'layout/App/theme';
import HistoricalDatePicker from 'common/HistoricalDatePicker';
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

function useMapGeolocation(mapRef: React.RefObject<L.Map | null>) {
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationAccuracy, setCurrentLocationAccuracy] =
    useState<number>();
  const [currentLocationErrorMessage, setCurrentLocationErrorMessage] =
    useState<string>();

  const onLocationSearch = () => {
    if (!navigator.geolocation) {
      setCurrentLocationErrorMessage(
        'Geolocation is not supported by your browser',
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setCurrentLocation(latLng);
        setCurrentLocationAccuracy(position.coords.accuracy);

        const map = mapRef.current;
        if (map) {
          const newZoom = Math.max(map.getZoom() || 6, 8);
          map.flyTo(latLng, newZoom, { duration: 2 });
        }
      },
      () => {
        setCurrentLocationErrorMessage('Unable to find your location');
      },
    );
  };

  const onLocationErrorAlertClose = () =>
    setCurrentLocationErrorMessage(undefined);

  return {
    currentLocation,
    currentLocationAccuracy,
    currentLocationErrorMessage,
    onLocationSearch,
    onLocationErrorAlertClose,
  };
}

function useMapViewportSync(
  mapRef: React.RefObject<L.Map | null>,
  options: { mapReady: boolean; onMapLoad?: (map: L.Map) => void },
) {
  const searchResult = useSelector(searchResultSelector);
  const siteOnMap = useSelector(siteOnMapSelector);

  useEffect(() => {
    if (mapRef.current && options.onMapLoad) {
      options.onMapLoad(mapRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef.current, options.onMapLoad]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && searchResult) {
      map.fitBounds([searchResult.bbox.southWest, searchResult.bbox.northEast]);
    }
  }, [mapRef, searchResult]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !options.mapReady) {
      return;
    }
    if (siteOnMap?.polygon.type !== 'Point') {
      return;
    }
    const [lng, lat] = siteOnMap.polygon.coordinates;
    const finalLng = siteOnMap.displayLng ?? lng;
    focusMapOnSite(map, [lat, finalLng]);
  }, [mapRef, options.mapReady, siteOnMap]);
}

function CurrentLocationOverlay({
  currentLocation,
  currentLocationAccuracy,
}: {
  currentLocation?: [number, number];
  currentLocationAccuracy?: number;
}) {
  if (!currentLocation) {
    return null;
  }
  return (
    <>
      <Marker icon={currentLocationMarker} position={currentLocation} />
      {currentLocationAccuracy && (
        <Circle
          center={{ lat: currentLocation[0], lng: currentLocation[1] }}
          radius={currentLocationAccuracy}
        />
      )}
    </>
  );
}

function MapToolbarButtons({
  classes,
  showSiteTable,
  geolocationEnabled,
  onToggleSiteTable,
  onOpenInfo,
  onLocationSearch,
}: {
  classes: HomepageMapProps['classes'];
  showSiteTable: boolean;
  geolocationEnabled: boolean;
  onToggleSiteTable: () => void;
  onOpenInfo: () => void;
  onLocationSearch: () => void;
}) {
  const ExpandIcon = showSiteTable ? FullscreenIcon : FullscreenExitIcon;

  return (
    <>
      <Hidden mdDown>
        <div className={classes.expandIconButton}>
          <IconButton onClick={onToggleSiteTable} size="large">
            <ExpandIcon color="primary" className={classes.expandIcon} />
          </IconButton>
        </div>
      </Hidden>
      <div className={classes.infoIconButton}>
        <IconButton onClick={onOpenInfo} size="large">
          <InfoIcon color="primary" />
        </IconButton>
      </div>
      {geolocationEnabled && (
        <div className={classes.locationIconButton}>
          <IconButton onClick={onLocationSearch} size="large">
            <MyLocationIcon color="primary" />
          </IconButton>
        </div>
      )}
    </>
  );
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
  const [mapReady, setMapReady] = useState(false);
  const loading = useSelector(sitesListLoadingSelector);
  const ref = useRef<L.Map>(null);
  const geolocation = useMapGeolocation(ref);

  useMapViewportSync(ref, { mapReady, onMapLoad });

  const sofarLayers = useMemo(
    () => <SofarLayers defaultLayerName={defaultLayerName} />,
    [defaultLayerName],
  );
  const siteMarkers = useMemo(
    () => <SiteMarkers collection={collection} />,
    [collection],
  );
  const tileLayer = useMemo(
    () => (
      <TileLayer
        attribution={attribution}
        url={tileURL}
        keepBuffer={6}
        updateWhenIdle
        updateInterval={400}
        className="no-tile-fade"
      />
    ),
    [],
  );

  const handleToggleSiteTable = () => {
    if (setShowSiteTable) {
      setShowSiteTable((prev) => !prev);
    }
    setTimeout(() => {
      ref.current?.invalidateSize();
    });
  };

  if (loading) {
    return (
      <div className={classes.loading}>
        <CircularProgress size="4rem" thickness={1} />
      </div>
    );
  }

  return (
    <MapContainer
      id="sites-map"
      ref={ref}
      preferCanvas
      renderer={L.canvas({ tolerance: 15 })}
      maxBoundsViscosity={1.0}
      className={classes.map}
      center={initialCenter}
      zoom={initialZoom}
      minZoom={collection ? 1 : 2}
      worldCopyJump
      bounds={initialBounds}
      maxBounds={mapConstants.MAX_BOUNDS}
    >
      <Snackbar
        open={Boolean(geolocation.currentLocationErrorMessage)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={geolocation.onLocationErrorAlertClose}
      >
        <Alert severity="error" onClose={geolocation.onLocationErrorAlertClose}>
          {geolocation.currentLocationErrorMessage}
        </Alert>
      </Snackbar>
      <MapToolbarButtons
        classes={classes}
        showSiteTable={showSiteTable}
        geolocationEnabled={geolocationEnabled}
        onToggleSiteTable={handleToggleSiteTable}
        onOpenInfo={() => setInfoDialogOpen(true)}
        onLocationSearch={geolocation.onLocationSearch}
      />
      {!collection && <HistoricalDatePicker variant="map" />}
      <InfoDialog
        infoDialogOpen={infoDialogOpen}
        handleInfoClose={() => setInfoDialogOpen(false)}
      />
      {tileLayer}
      {sofarLayers}
      {siteMarkers}
      <CurrentLocationOverlay
        currentLocation={geolocation.currentLocation}
        currentLocationAccuracy={geolocation.currentLocationAccuracy}
      />
      <Legend legendName={legendName} bottom={legendBottom} left={legendLeft} />
      {showAlertLevelLegend && <AlertLevelLegend />}
      {showWaterMark && <div className="mapbox-wordmark" />}
      <MapEventsHandler
        onBaseLayerChange={({ name }) => setLegendName(name)}
        onMapReady={() => setMapReady(true)}
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
      // Gaps between tiles during pan/zoom otherwise flash #ddd
      backgroundColor: '#0b1d2a',
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
