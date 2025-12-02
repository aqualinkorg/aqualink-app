import React from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { useSelector } from 'react-redux';
import { some } from 'lodash';
import {
  siteTimeSeriesDataLoadingSelector,
  siteTimeSeriesDataSelector,
} from 'store/Sites/selectedSiteSlice';
import { formatNumber } from 'helpers/numberUtils';
import { getCardTemperatureValues } from './utils';

function ObservationBox({
  depth,
  date = null,
  classes,
  satelliteTemperature,
}: ObservationBoxProps) {
  const { bottomTemperature, topTemperature } =
    useSelector(siteTimeSeriesDataSelector) || {};
  const loading = useSelector(siteTimeSeriesDataLoadingSelector);

  const { hoboBottom, hoboSurface, spotterBottom, spotterTop } =
    getCardTemperatureValues(bottomTemperature, topTemperature, date);

  const hasSensorData = some([
    hoboBottom,
    hoboSurface,
    spotterBottom,
    spotterTop,
  ]);

  if (!loading && !hasSensorData && !satelliteTemperature) {
    return null;
  }
  return (
    <div className={classes.outerDiv}>
      {loading ? (
        <Box
          height="204px"
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress
            className={classes.loading}
            thickness={1}
            size="102px"
          />
        </Box>
      ) : (
        <Grid container direction="column">
          <Grid container item direction="column" spacing={4}>
            <Grid container item direction="column" spacing={1}>
              <Grid item>
                <Typography color="textPrimary" variant="subtitle1">
                  SATELLITE OBSERVATION
                </Typography>
              </Grid>
              <Grid container item direction="column">
                <Typography color="textPrimary" variant="overline">
                  SURFACE TEMP
                </Typography>
                <Typography color="textPrimary" variant="h4">
                  {`${formatNumber(satelliteTemperature, 1)} °C`}
                </Typography>
              </Grid>
            </Grid>
            {some([hoboBottom, hoboSurface, spotterBottom, spotterTop]) && (
              <Grid container item direction="column" spacing={1}>
                <Grid item>
                  <Typography color="textPrimary" variant="subtitle1">
                    SENSOR OBSERVATION
                  </Typography>
                </Grid>
                <Grid container item spacing={2}>
                  <Grid container item direction="column" xs={6}>
                    <Typography color="textPrimary" variant="overline">
                      TEMP AT 1m
                    </Typography>
                    <Typography color="textPrimary" variant="h4">
                      {`${formatNumber(spotterTop || hoboSurface, 1)} °C`}
                    </Typography>
                  </Grid>
                  <Grid container item direction="column" xs={6}>
                    <Typography color="textPrimary" variant="overline">
                      TEMP AT {depth ? `${depth}m` : 'DEPTH'}
                    </Typography>
                    <Typography color="textPrimary" variant="h4">
                      {`${formatNumber(spotterBottom || hoboBottom, 1)} °C`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </div>
  );
}

const styles = () =>
  createStyles({
    outerDiv: {
      backgroundColor: '#128cc0',
      borderRadius: '0.4rem',
      display: 'flex',
      padding: '1rem',
      flexGrow: 1,
    },

    loading: {
      color: '#ffffff',
    },
  });

interface ObservationBoxIncomingProps {
  depth: number | null;
  satelliteTemperature?: number;
  date?: string | null;
}

type ObservationBoxProps = ObservationBoxIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ObservationBox);
