import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L, { LatLngBounds, Map as LeafletMap } from 'leaflet';
import {
  CircularProgress,
  IconButton,
  Snackbar,
  Hidden,
  Alert,
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
import { mapIconSize } from 'layout/App/theme';
import { SiteMarkers } from './Markers';
import { SofarLayers } from './sofarLayers';
import Legend from './Legend';
import AlertLevelLegend from './alertLevelLegend';

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

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
}: HomepageMapProps) => {
  const [legendName] = useState<string>(defaultLayerName || '');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationAccuracy, setCurrentLocationAccuracy] =
    useState<number>();
  const [currentLocationErrorMessage, setCurrentLocationErrorMessage] =
    useState<string>();
  const loading = useSelector(sitesListLoadingSelector);
  const searchResult = useSelector(searchResultSelector);
  const ref = useRef<LeafletMap>(null);
  const siteOnMap = useSelector(siteOnMapSelector);

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
          if (current) {
            const map = current;
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
    if (current) {
      if (searchResult) {
        current.fitBounds([
          searchResult.bbox.southWest,
          searchResult.bbox.northEast,
        ]);
      }
    }
  }, [searchResult]);

  // TODO: Add back
  // const onBaseLayerChange = ({ name }: LayersControlEvent) => {
  //   setLegendName(name);
  // };
  useEffect(() => {
    const map = ref.current?.leafletElement;
    if (map && siteOnMap?.polygon.type === 'Point') {
      const [lng, lat] = siteOnMap.polygon.coordinates;
      const latLng = [lat, lng] as [number, number];
      const pointBounds = L.latLngBounds(latLng, latLng);
      const maxZoom = Math.max(map.getZoom() || 6);
      map.flyToBounds(pointBounds, {
        duration: 2,
        maxZoom,
        paddingTopLeft: L.point(0, 200),
      });
    }
  }, [siteOnMap]);

  const ExpandIcon = showSiteTable ? FullscreenIcon : FullscreenExitIcon;

  return loading ? (
    <div className={classes.loading}>
      <CircularProgress size="4rem" thickness={1} />
    </div>
  ) : (
    <MapContainer
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
      // onbaselayerchange={onBaseLayerChange}
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
          <IconButton onClick={onLocationSearch} size="large">
            <MyLocationIcon color="primary" />
          </IconButton>
        </div>
      )}
    </MapContainer>
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
  initialCenter: [number, number];
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

type HomepageMapProps = WithStyles<typeof styles> & HomepageMapIncomingProps;

export default withStyles(styles)(HomepageMap);
