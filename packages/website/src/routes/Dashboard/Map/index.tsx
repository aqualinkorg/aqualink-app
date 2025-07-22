import React from 'react';
import { Box, Theme, useTheme, useMediaQuery } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { LatLng } from 'leaflet';

import { CollectionDetails } from 'store/Collection/types';
import { getCollectionCenterAndBounds } from 'helpers/map';
import Map from '../../HomeMap/Map';

const DashboardMap = ({ collection, classes }: DashboardMapProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collectionCenter, collectionBounds] =
    getCollectionCenterAndBounds(collection);

  const isHeatStress = collection.name.includes('Heat Stress');

  return (
    <Box className={classes.root}>
      <Map
        classes={{ map: classes.map }}
        initialCenter={collectionCenter || new LatLng(0, 0)}
        {...(collectionBounds
          ? {
              initialBounds: collectionBounds,
            }
          : {
              initialZoom: 3,
            })}
        collection={collection}
        showAlertLevelLegend={false}
        showWaterMark={false}
        geolocationEnabled={false}
        defaultLayerName={isHeatStress ? 'Heat Stress' : undefined}
        legendBottom={isMobile ? 35 : 20}
        legendLeft={isMobile ? 2 : 4}
      />
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 5,
      height: 480,
      marginTop: 46,
      [theme.breakpoints.only('md')]: {
        height: 420,
      },
      [theme.breakpoints.down('sm')]: {
        height: 450,
      },
    },
    map: {
      height: '100%',
      width: '100%',
      borderRadius: 5,
    },
  });

interface DashboardMapIncomingProps {
  collection: CollectionDetails;
}

type DashboardMapProps = DashboardMapIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DashboardMap);
