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
import { getCollectionCenterAndBounds } from "../../../helpers/map";
import { CollectionDetails } from "../../../store/User/types";

const DashboardMap = ({ collection, classes }: DashboardMapProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(320));
  const [collectionCenter, collectionBounds] = getCollectionCenterAndBounds(
    collection
  );

  return (
    <Box className={classes.root} borderRadius="5px" height="480px" mt="46px">
      <Map
        classes={{ map: classes.map }}
        initialCenter={collectionCenter || new LatLng(0, 0)}
        initialBounds={collectionBounds}
        initialZoom={3}
        collection={collection}
        showAlertLevelLegend={false}
        showWaterMark={false}
        geolocationEnabled={false}
        defaultLayerName="Heat Stress"
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
  collection: CollectionDetails;
}

type DashboardMapProps = DashboardMapIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DashboardMap);
