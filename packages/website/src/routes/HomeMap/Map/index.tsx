import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Map, TileLayer, Marker, Circle } from 'react-leaflet';
import L, { LatLng, LatLngBounds, LayersControlEvent } from 'leaflet';
import {
  CircularProgress,
  IconButton,
  Snackbar,
  Hidden,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
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
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import Tune from '@mui/icons-material/Tune';
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
}: HomepageMapProps) => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [legendName, setLegendName] = useState<string>(defaultLayerName || '');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationAccuracy, setCurrentLocationAccuracy] =
    useState<number>();
  const [currentLocationErrorMessage, setCurrentLocationErrorMessage] =
    useState<string>();
  const loading = useSelector(sitesListLoadingSelector);
  const searchResult = useSelector(searchResultSelector);
  const siteOnMap = useSelector(siteOnMapSelector);
  const ref = useRef<Map>(null);

  useEffect(() => {
    if (ref.current && onMapLoad) {
      onMapLoad(ref.current.leafletElement);
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

  useEffect(() => {
    const map = ref.current?.leafletElement;
    if (map && siteOnMap?.polygon.type === 'Point') {
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
  }, [siteOnMap]);

  const onBaseLayerChange = ({ name }: LayersControlEvent) => {
    setLegendName(name);
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
    <Map
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
      <Hidden mdDown>
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
            size="large"
          >
            <ExpandIcon color="primary" className={classes.expandIcon} />
          </IconButton>
        </div>
        <div className={classes.infoIconButton}>
          <IconButton onClick={handleInfoClick} size="large">
            <InfoIcon color="primary" />
          </IconButton>
        </div>
      </Hidden>
      <Dialog open={infoDialogOpen} onClose={handleInfoClose}>
        <DialogTitle
          color="primary"
          sx={{ fontSize: '20px', textAlign: 'center', fontWeight: 'bold' }}
        >
          How to Use the Map
        </DialogTitle>
        <IconButton
          onClick={handleInfoClose}
          color="primary"
          size="large"
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <DialogContentText component="div">
            <div className={classes.infoDialog}>
              <div className={classes.infoDialogSection}>
                <h3 className={classes.infoDialogSectionTitle}>Icons</h3>
                <div className={classes.infoDialogFlexContainer}>
                  <img
                    src="https://lh6.googleusercontent.com/I6YUWMwUrlekFL-RXGGRYvIMpTHp9P22-Wehlt_0WiMvezaO4txKmeDADbWnKEaQ7NConr2Fvbx3B5Nz_QEL3ecJBrAOM93r_9Csfw_b2d5R6rvcMwS9f83IMLVor0tF0tofq1181lgi59pboj6TsgNrjqYfZ30TFWG9qagB1Xf5NwpBI5HFkg=w1280"
                    alt="Layer icon"
                    className={classes.infoDialogImage}
                  />
                  <p>
                    Layer icon - Select the layer of the map. You can choose
                    from Satellite Imagery, Sea Surface Temperature, Heat
                    Stress, or SST Anomaly.
                  </p>
                </div>

                <div className={classes.infoDialogFlexContainer}>
                  <FullscreenIcon
                    className={classes.infoDialogIcon}
                    color="primary"
                  />
                  <p>
                    Fullscreen icon - Toggle between full screen and half
                    screen.
                  </p>
                </div>

                <div className={classes.infoDialogFlexContainer}>
                  <MyLocationIcon
                    className={classes.infoDialogIcon}
                    color="primary"
                  />
                  <p>
                    My location icon - Click on this icon to zoom in to where
                    you&apos;re currently located.
                  </p>
                </div>

                <div className={classes.infoDialogFlexContainer}>
                  <img
                    src="https://lh4.googleusercontent.com/6BeZbkdCTGAVOnm2rx_0SnIRQtYuX8YdrBENuXSxL4Nx23-2CcezjjY0_AfYr4L5qniFaqEzF2i3OON18lBv7XKp96dyUp8CST7cKeZ6TNDNES1n_L0wwpmhYo8Q0nIcIbFer8KFkwSZLpmPuLAfRKgurscywCtaCQBwIpP3W_3cleNYHOrj=w1280"
                    alt="Layer icon"
                    className={classes.infoDialogImage}
                  />
                  <p>Zoom in and out on the map.</p>
                </div>

                <div className={classes.infoDialogFlexContainer}>
                  <Button
                    sx={{
                      flex: '1 0 130px',
                    }}
                    variant="contained"
                    startIcon={<Tune />}
                  >
                    All sites
                  </Button>
                  <p>
                    Map filter - Select what type of data and heat stress you
                    want to explore. You can also select multiple species, reef
                    composition, and anthropogenic impact, and the map will
                    display all the selected items.
                  </p>
                </div>
              </div>

              <div className={classes.infoDialogSection}>
                <h3 className={classes.infoDialogSectionTitle}>Layers</h3>
                <p>
                  Click on the layer icon in the top right corner. Then select
                  Satellite Imagery, Sea Surface Temperature, Heat Stress, or
                  SST Anomaly.
                </p>
                <p>
                  Sea Surface Temperature - View the global ocean temperature in
                  Celsius (°C). The bar in the bottom left corner indicates what
                  temperature the colors are.
                </p>
                <p>
                  Heat Stress - Heat stress is a measure of the amount of time
                  above the 20 year historical maximum temperature. The unit of
                  measure for heat stress is Degree Heating Weeks (DHW). Many
                  marine environments, like coral sites, degrade after prolonged
                  heat exposure, which is why this is an important metric. The
                  DHW bar indicates how many weeks each area of the ocean has
                  been experiencing heat stress. For more in-depth information,
                  view{' '}
                  <a href="https://coralreefwatch.noaa.gov/product/5km/tutorial/crw10a_dhw_product.php">
                    NOAA CRW&apos;s Heat Stress page.
                  </a>
                </p>
                <p>
                  SST Anomaly - Sea Surface Temperature Anomaly is the
                  difference between the daily observed SST and the normal
                  (long-term) SST conditions for that specific day of the year.
                  For more in-depth information, view{' '}
                  <a href="https://coralreefwatch.noaa.gov/product/5km/tutorial/crw07a_ssta_product.php">
                    NOAA CRW&apos;s SST Anomaly page.
                  </a>
                </p>
              </div>

              <div className={classes.infoDialogSection}>
                <h3 className={classes.infoDialogSectionTitle}>
                  Site Icons and Colors
                </h3>
                <p>
                  Each site has its own icon on the map. The heat stress level
                  that each site is experiencing is indicated by its color. To
                  learn more about heat stress levels, view{' '}
                  <a href="https://coralreefwatch.noaa.gov/product/5km/tutorial/crw11a_baa.php">
                    NOAA CRW&apos;s bleaching alert page.
                  </a>
                </p>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '50px',
                    marginBottom: '-30px',
                  }}
                >
                  <AlertLevelLegend />
                </div>
                <p>
                  Each site has its own icon on the map, which varies depending
                  on the data it has.
                </p>
                <div className={classes.infoDialogFlexContainer}>
                  <img
                    src="https://lh3.googleusercontent.com/yms_84DLBk7m_lnFegJw6GlPeymlJgola0WSZZQpwH-S3BlPidT2rzaumox80z2mTsM548rGJgyk-ENsRKxTsJkP46FEQFhLnlNv0SISGuf9doDpgZ8DkS-w5s3qSNZkqENkDtZHQSyEprcyUMQELIrHzHMk5O5h7sr9OcFbHOalr1Z2U0Qxfw=w1280"
                    alt="Sofar Smart Mooring Spotter"
                    className={classes.infoDialogImage}
                  />
                  <p>
                    This icon indicates that this site has a Sofar Smart Mooring
                    Spotter with transmits real-time wind, wave, and temperature
                    data from the seafloor and sea surface.
                  </p>
                </div>
                <div className={classes.infoDialogFlexContainer}>
                  <img
                    src="https://lh4.googleusercontent.com/ij_JPoLZs3NpQc4wI7fpFbL50DaB1hmcl2YuWbUk4lQOPy_zWQHKa0pHmBHJorGztFErG2KGFsjV1ktZ568s9uDTprGLEH4KfskB-ZWj9xV4kctHk4EjIuf6RyTMPKMjkNa-4KB_wulY9BTL0yq5c5GD4SB96DPiO6zoSjWyWX2Y8w5SUSvGLw=w1280"
                    alt="Dashboard"
                    className={classes.infoDialogImage}
                  />
                  <p>
                    This icon indicate that this site has at least one
                    temperature logger connected to the dashboard.
                  </p>
                </div>
                <div className={classes.infoDialogFlexContainer}>
                  <img
                    src="https://lh6.googleusercontent.com/pP0rB206ny9NEATUcRR_I5Yv8t8HM9zcIG8aIjojWd6HghXzhUwhW5xkkuoMbSPdN8PH4ixZphVGs54D4D14gbBAdSvWFnUTa_4UblqpwOvS-1lM1qkx4ypsLizLSn-N-yXg4MtjUoAa_McTQAnQhrCuL1p8SoYYNjY4JHshyt_X6yuUv6M7wg=w1280"
                    alt="Other sites"
                    className={classes.infoDialogImage}
                  />
                  <p>
                    All the other sites have this icon. This includes sites with
                    water quality data, Reef Check data, 3D models, Live
                    streams, surveys, and all others. Every site is
                    automatically equipped with wind, wave, and temperature data
                    from NOAA satellites.
                  </p>
                </div>
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
      </Dialog>
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
    infoIconButton: {
      ...mapButtonStyles,
      right: 0,
      top: 100,
      zIndex: 400,
    },
    expandIcon: {
      fontSize: '34px',
    },
    infoDialog: {
      maxWidth: '100%',
      fontFamily: 'Roboto, sans-serif',
      fontSize: '14px',
    },
    infoDialogSection: {
      marginBottom: '10px',
    },
    infoDialogSectionTitle: {
      color: 'rgb(22, 141, 189)',
      marginBottom: '15px',
      fontSize: '18px',
    },
    infoDialogFlexContainer: {
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    },
    infoDialogIcon: {
      width: '40px',
      height: '40px',
      objectFit: 'contain',
      border: '2px solid #c6c4c5',
      borderRadius: '5px',
    },
    infoDialogImage: {
      width: '40px',
      objectFit: 'contain',
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
  onMapLoad?: (map: L.Map) => void;
}

type HomepageMapProps = WithStyles<typeof styles> & HomepageMapIncomingProps;

export default withStyles(styles)(HomepageMap);
