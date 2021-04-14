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
import { LatLng } from "leaflet";

import Map from "../../HomeMap/Map";
import { Collection } from "../collection";

const DashboardMap = ({ collection, classes }: DashboardMapProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(320));
  return (
    <Box className={classes.root} borderRadius="5px" height="480px" mt="46px">
      <Map
        classes={{ map: classes.map }}
        initialCenter={new LatLng(0, 0)}
        initialZoom={3}
        collection={collection}
        showAlertLevelLegend={false}
        showWaterMark={false}
        geolocationEnabled={false}
        defaultLayerName="Heat Stress"
        layerControlsEnabled={false}
        legendBottom={isMobile ? 35 : 20}
        legendLeft={isMobile ? 2 : 4}
      />
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
        height: 450,
      },
    },
    map: {
      height: "100%",
      width: "100%",
      borderRadius: 5,
    },
  });

interface DashboardMapIncomingProps {
  collection: Collection;
}

type DashboardMapProps = DashboardMapIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DashboardMap);
