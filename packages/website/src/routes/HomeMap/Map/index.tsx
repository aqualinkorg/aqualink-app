import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Map, TileLayer, Marker, Circle } from 'react-leaflet';
import L, { LatLng, LatLngBounds, LayersControlEvent } from 'leaflet';
import {
  createStyles,
  withStyles,
  WithStyles,
  CircularProgress,
  IconButton,
  Snackbar,
  Hidden,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import { sitesListLoadingSelector } from 'store/Sites/sitesListSlice';
import { searchResultSelector } from 'store/Homepage/homepageSlice';
import { CollectionDetails } from 'store/Collection/types';
import { MapLayerName } from 'store/Homepage/types';
import { mapConstants } from 'constants/maps';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import {
  CreateCSSProperties,
  CSSProperties,
} from '@material-ui/core/styles/withStyles';
import { mapIconSize } from 'layout/App/theme';
import { SiteMarkers } from './Markers';
import { SofarLayers } from './sofarLayers';
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

const HomepageMap = ({
  initialCenter,
  initialZoom,
  showSiteTable,
  setShowSiteTable,
  initialBounds,
  collection,
  showAlertLevelLegend,
  showWaterMark,
  geolocationEnabled,
  defaultLayerName,
  legendBottom,
  legendLeft,
  classes,
}: HomepageMapProps) => {
  const [legendName, setLegendName] = useState<string>(defaultLayerName || '');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationAccuracy, setCurrentLocationAccuracy] =
    useState<number>();
  const [currentLocationErrorMessage, setCurrentLocationErrorMessage] =
    useState<string>();
  const loading = useSelector(sitesListLoadingSelector);
  const searchResult = useSelector(searchResultSelector);
  const ref = useRef<Map>(null);

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
          const { current } = ref;
          if (current && current.leafletElement) {
            const map = current.leafletElement;
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
    const { current } = ref;
    if (current && current.leafletElement) {
      const map = current.leafletElement;
      if (searchResult) {
        map.fitBounds([
          searchResult.bbox.southWest,
          searchResult.bbox.northEast,
        ]);
      }
    }
  }, [searchResult]);

  const onBaseLayerChange = ({ name }: LayersControlEvent) => {
    setLegendName(name);
  };

  const ExpandIcon = showSiteTable ? FullscreenIcon : FullscreenExitIcon;

  return loading ? (
    <div className={classes.loading}>
      <CircularProgress size="4rem" thickness={1} />
    </div>
  ) : (
    <Map
      id="sites-map"
      ref={ref}
      preferCanvas
      renderer={L.canvas()}
      maxBoundsViscosity={1.0}
      className={classes.map}
      center={initialCenter}
      zoom={initialZoom}
      minZoom={collection ? 1 : 2} // If we're on dashboard page, the map's wrapping div is smaller, so we need to allow higher zoom
      worldCopyJump
      onbaselayerchange={onBaseLayerChange}
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
      <Hidden smDown>
        <div className={classes.expandIconButton}>
          <IconButton
            onClick={() => {
              if (setShowSiteTable) {
                setShowSiteTable((prev) => !prev);
              }
              setTimeout(() => {
                if (ref.current && ref.current.leafletElement) {
                  ref.current.leafletElement.invalidateSize();
                }
              });
            }}
          >
            <ExpandIcon color="primary" className={classes.expandIcon} />
          </IconButton>
        </div>
      </Hidden>
      <TileLayer attribution={attribution} url={tileURL} />
      <SofarLayers defaultLayerName={defaultLayerName} />
      <SiteMarkers collection={collection} />
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
          <IconButton onClick={onLocationSearch}>
            <MyLocationIcon color="primary" />
          </IconButton>
        </div>
      )}
    </Map>
  );
};

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

const styles = () =>
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
    expandIcon: {
      fontSize: '34px',
    },
  });

interface HomepageMapIncomingProps {
  initialCenter: LatLng;
  initialZoom: number;
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
}

HomepageMap.defaultProps = {
  showSiteTable: true,
  setShowSiteTable: undefined,
  initialBounds: undefined,
  collection: undefined,
  showAlertLevelLegend: true,
  showWaterMark: true,
  geolocationEnabled: true,
  defaultLayerName: undefined,
  legendBottom: undefined,
  legendLeft: undefined,
};

type HomepageMapProps = WithStyles<typeof styles> & HomepageMapIncomingProps;

export default withStyles(styles)(HomepageMap);
