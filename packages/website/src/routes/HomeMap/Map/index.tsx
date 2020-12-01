import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Map, TileLayer } from "react-leaflet";
import { LatLng } from "leaflet";
import {
  createStyles,
  withStyles,
  WithStyles,
  CircularProgress,
} from "@material-ui/core";

import { reefsListLoadingSelector } from "../../../store/Reefs/reefsListSlice";
import { ReefMarkers } from "./Markers";
import { SofarLayers } from "./sofarLayers";
import Legend from "./Legend";
import AlertLevelLegend from "./alertLevelLegend";
import { searchResultSelector } from "../../../store/Homepage/homepageSlice";
import { getTileURL } from "../../../helpers/map";

const INITIAL_CENTER = new LatLng(19, -76.3);
const INITIAL_ZOOM = 5;
const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const attribution = accessToken
  ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
  : "";

const HomepageMap = ({ classes }: HomepageMapProps) => {
  const [legendName, setLegendName] = useState<string>("");
  const loading = useSelector(reefsListLoadingSelector);
  const searchResult = useSelector(searchResultSelector);
  const ref = useRef<Map>(null);

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
      <TileLayer attribution={attribution} url={getTileURL()} />
      <SofarLayers />
      <ReefMarkers />
      <Legend legendName={legendName} />
      <AlertLevelLegend />
      <div className="mapbox-wordmark" />
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
  });

type HomepageMapProps = WithStyles<typeof styles>;

export default withStyles(styles)(HomepageMap);
