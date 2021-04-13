import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Theme,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import { Map as LeafletMap, TileLayer, Marker } from "react-leaflet";

import Legend from "../../HomeMap/Map/Legend";
import { Collection } from "../collection";
import { sensorIcon } from "../../../helpers/map";
import { alertColorFinder } from "../../../helpers/bleachingAlertIntervals";

const {
  REACT_APP_SOFAR_API_TOKEN: SOFAR_API_TOKEN,
  REACT_APP_MAPBOX_ACCESS_TOKEN: MAPBOX_TOKEN,
} = process.env;

const sofarUrl = `https://api.sofarocean.com/marine-weather/v1/models/NOAACoralReefWatch/tile/{z}/{x}/{y}.png?colormap=noaacoral&token=${SOFAR_API_TOKEN}&variableID=degreeHeatingWeek`;

const tileURL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/eric-ovio/ckesyzu658klw19s6zc0adlgp/tiles/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x";

const Map = ({ collection, classes }: MapProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <Box className={classes.root} borderRadius="5px" height="480px" mt="46px">
      <LeafletMap
        className={classes.map}
        center={[-28.499205171945704, 119.79148725885719]}
        zoom={4}
      >
        <TileLayer url={tileURL} />
        <TileLayer
          // Sofar tiles have a max native zoom of 9
          maxNativeZoom={9}
          url={sofarUrl}
          key="degreeHeatingWeek"
          opacity={0.5}
        />
        <Legend legendName="Heat Stress" bottom={20} left={isMobile ? 3 : 20} />
        {collection.reefs.map((reef) => (
          <Marker
            key={reef.name}
            position={reef.coords}
            icon={sensorIcon(
              "spotter",
              false,
              alertColorFinder(reef.weeklyAlertLevel)
            )}
          />
        ))}
      </LeafletMap>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.between("md", "md")]: {
        height: 420,
      },
      [theme.breakpoints.down("xs")]: {
        height: 320,
      },
    },
    map: {
      height: "100%",
      width: "100%",
      borderRadius: 5,
    },
  });

interface MapIncomingProps {
  collection: Collection;
}

type MapProps = MapIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Map);
