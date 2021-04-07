import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Map, TileLayer, Marker, Circle } from "react-leaflet";
import L, { LatLng, LayersControlEvent } from "leaflet";
import {
  createStyles,
  withStyles,
  WithStyles,
  CircularProgress,
  IconButton,
  Snackbar,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import MyLocationIcon from "@material-ui/icons/MyLocation";

import {
  reefsListLoadingSelector,
  reefsListSelector,
} from "../../../store/Reefs/reefsListSlice";
import { ReefMarkers } from "./Markers";
import { SofarLayers } from "./sofarLayers";
import Legend from "./Legend";
import AlertLevelLegend from "./alertLevelLegend";
import { searchResultSelector } from "../../../store/Homepage/homepageSlice";
import { findInitialReefPosition } from "../../../helpers/reefUtils";

const INITIAL_CENTER = new LatLng(0, 121.3);
const INITIAL_ZOOM = 5;
const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const tileURL = accessToken
  ? `https://api.mapbox.com/styles/v1/eric-ovio/ckesyzu658klw19s6zc0adlgp/tiles/{z}/{x}/{y}@2x?access_token=${accessToken}`
  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x";

const attribution = accessToken
  ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
  : "";

const currentLocationMarker = L.divIcon({
  className: "current-position-marker",
  iconSize: L.point(16, 16, true),
});

const HomepageMap = ({
  initialZoom,
  initialReefId,
  classes,
}: HomepageMapProps) => {
  const [legendName, setLegendName] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationAccuracy, setCurrentLocationAccuracy] = useState<
    number
  >();
  const [
    currentLocationErrorMessage,
    setCurrentLocationErrorMessage,
  ] = useState<string>();
  const loading = useSelector(reefsListLoadingSelector);
  const reefs = useSelector(reefsListSelector) || [];
  const searchResult = useSelector(searchResultSelector);
  const ref = useRef<Map>(null);
  const zoom = initialZoom > 0 ? initialZoom : INITIAL_ZOOM;

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
          setCurrentLocationErrorMessage("Unable to find your location");
        }
      );
    } else {
      setCurrentLocationErrorMessage(
        "Geolocation is not supported by your browser"
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

  return loading ? (
    <div className={classes.loading}>
      <CircularProgress size="4rem" thickness={1} />
    </div>
  ) : (
    <Map
      ref={ref}
      preferCanvas
      maxBoundsViscosity={1.0}
      className={classes.map}
      center={findInitialReefPosition(reefs, initialReefId) || INITIAL_CENTER}
      zoom={zoom}
      minZoom={2}
      worldCopyJump
      onbaselayerchange={onBaseLayerChange}
    >
      <Snackbar
        open={Boolean(currentLocationErrorMessage)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={onLocationErrorAlertClose}
      >
        <Alert severity="error" onClose={onLocationErrorAlertClose}>
          {currentLocationErrorMessage}
        </Alert>
      </Snackbar>
      <TileLayer attribution={attribution} url={tileURL} />
      <SofarLayers />
      <ReefMarkers />
      {currentLocation && (
        <Marker icon={currentLocationMarker} position={currentLocation} />
      )}
      {currentLocation && currentLocationAccuracy && (
        <Circle
          center={{ lat: currentLocation[0], lng: currentLocation[1] }}
          radius={currentLocationAccuracy}
        />
      )}
      <Legend legendName={legendName} />
      <AlertLevelLegend />
      <div className="mapbox-wordmark" />
      <div className={classes.locationIconButton}>
        <IconButton onClick={onLocationSearch}>
          <MyLocationIcon color="primary" />
        </IconButton>
      </div>
    </Map>
  );
};

const styles = () =>
  createStyles({
    map: {
      flex: 1,
    },
    loading: {
      height: "100%",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    locationIconButton: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      left: 0,
      top: 80,
      zIndex: 1000,
      height: 34,
      width: 34,
      border: "2px solid rgba(0,0,0,0.2)",
      borderRadius: 5,
      margin: "10px 0 0 10px",
      backgroundColor: "white",
      backgroundClip: "padding-box",
    },
  });

interface HomepageMapIncomingProps {
  initialZoom: number;
  initialReefId: string;
}

type HomepageMapProps = WithStyles<typeof styles> & HomepageMapIncomingProps;

export default withStyles(styles)(HomepageMap);
