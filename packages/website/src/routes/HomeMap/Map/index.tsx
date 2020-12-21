import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Map, TileLayer, Marker } from "react-leaflet";
import L, { LatLng } from "leaflet";
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

import { reefsListLoadingSelector } from "../../../store/Reefs/reefsListSlice";
import { ReefMarkers } from "./Markers";
import { SofarLayers } from "./sofarLayers";
import Legend from "./Legend";
import AlertLevelLegend from "./alertLevelLegend";
import { searchResultSelector } from "../../../store/Homepage/homepageSlice";

const INITIAL_CENTER = new LatLng(19, -76.3);
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

const HomepageMap = ({ classes }: HomepageMapProps) => {
  const [legendName, setLegendName] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<[number, number]>();
  const [currentLocationError, setCurrentLocationError] = useState(false);
  const loading = useSelector(reefsListLoadingSelector);
  const searchResult = useSelector(searchResultSelector);
  const ref = useRef<Map>(null);

  const onLocationSearch = () => {
    const { current } = ref;
    if (current && current.leafletElement) {
      const map = current.leafletElement;
      map
        .locate({ setView: true, enableHighAccuracy: true, maxZoom: 20 })
        .on("locationfound", ({ latlng }) => {
          setCurrentLocation([latlng.lat, latlng.lng]);
        })
        .on("locationerror", () => {
          setCurrentLocationError(true);
        });
    }
  };

  const onLocationErrorAlertClose = () => setCurrentLocationError(false);

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
      map.on("baselayerchange", (layer: any) => {
        setLegendName(layer.name);
      });
    }
  });

  return loading ? (
    <div className={classes.loading}>
      <CircularProgress size="10rem" thickness={1} />
    </div>
  ) : (
    <Map
      ref={ref}
      preferCanvas
      maxBoundsViscosity={1.0}
      className={classes.map}
      center={INITIAL_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={2}
      worldCopyJump
    >
      <Snackbar
        open={currentLocationError}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={onLocationErrorAlertClose}
      >
        <Alert severity="error" onClose={onLocationErrorAlertClose}>
          Unable to find your location
        </Alert>
      </Snackbar>
      <TileLayer attribution={attribution} url={tileURL} />
      <SofarLayers />
      <ReefMarkers />
      {currentLocation && (
        <Marker icon={currentLocationMarker} position={currentLocation} />
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

type HomepageMapProps = WithStyles<typeof styles>;

export default withStyles(styles)(HomepageMap);
