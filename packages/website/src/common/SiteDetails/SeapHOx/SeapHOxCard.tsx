// FILE: packages/website/src/common/SiteDetails/SeapHOx/SeapHOxCard.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { LatestDataASSofarValue } from '../../../store/Sites/types';
import { toRelativeTime } from '../../../helpers/dates';
import UpdateInfo from '../../UpdateInfo';
import { styles as incomingStyles } from '../styles';

const SEAPHOX_DARK_BLUE = '#23225b';

interface SeapHOxCardProps {
  depth: number | null;
  data: LatestDataASSofarValue;
}

const SeapHOxCard = ({ depth, data, classes }: SeapHOxCardPropsWithStyles) => {
  // Define which metrics to display
  const metrics = [
    { key: 'seaphoxTemperature', label: 'Temperature', unit: '°C' },
    { key: 'ph', label: 'Acidity', unit: 'pH' },
    { key: 'pressure', label: 'Pressure', unit: 'dbar' },
    { key: 'salinity', label: 'Salinity', unit: 'psu' },
    { key: 'conductivity', label: 'Conductivity', unit: 'S/m' },
    { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', unit: 'ml/L' },
  ];

  const formatValue = (value: number | undefined): string => {
    if (value === null || value === undefined) return '--';
    return value.toFixed(2);
  };

  // Get the most recent timestamp from available data
  const getRelativeTime = () => {
    const timestamp =
      data.seaphoxTemperature?.timestamp ||
      data.ph?.timestamp ||
      data.pressure?.timestamp ||
      data.salinity?.timestamp ||
      data.conductivity?.timestamp ||
      data.dissolvedOxygen?.timestamp;

    return timestamp ? toRelativeTime(timestamp) : null;
  };

  const relativeTime = getRelativeTime();

  // Check if we have any data
  const hasData = metrics.some((metric) => {
    const value = data[metric.key as keyof LatestDataASSofarValue]?.value;
    return value !== null && value !== undefined;
  });

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography className={classes.cardTitle} variant="h6">
                SeapHOx at {depth ? `${depth}m` : 'DEPTH'} depth
              </Typography>
            </Grid>
          </Grid>
        }
      />

      <CardContent className={classes.content}>
        <Box sx={{ padding: '1rem' }}>
          <Grid container spacing={2}>
            {/* Temperature */}
            <Grid item xs={6}>
              <Box>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  TEMPERATURE
                </Typography>
                <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {formatValue(data.seaphoxTemperature?.value)}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    °C
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* pH (External) */}
            <Grid item xs={6}>
              <Box>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  ACIDITY
                </Typography>
                <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {formatValue(data.ph?.value)}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    pH
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Pressure */}
            <Grid item xs={6}>
              <Box>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  PRESSURE
                </Typography>
                <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {formatValue(data.pressure?.value)}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    dbar
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Salinity */}
            <Grid item xs={6}>
              <Box>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  SALINITY
                </Typography>
                <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {formatValue(data.salinity?.value)}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    psu
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Conductivity */}
            <Grid item xs={6}>
              <Box>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  CONDUCTIVITY
                </Typography>
                <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {formatValue(data.conductivity?.value)}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    S/m
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Dissolved Oxygen */}
            <Grid item xs={6}>
              <Box>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  DISSOLVED OXYGEN
                </Typography>
                <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {formatValue(data.dissolvedOxygen?.value)}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    ml/L
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {hasData && relativeTime && (
          <UpdateInfo
            relativeTime={relativeTime}
            timeText="Last data received"
            live
            frequency="hourly"
          />
        )}
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    ...incomingStyles,
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: SEAPHOX_DARK_BLUE,
      color: 'white',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      flexGrow: 1,
      padding: 0,
    },
  });

type SeapHOxCardPropsWithStyles = WithStyles<typeof styles> & SeapHOxCardProps;

export default withStyles(styles)(SeapHOxCard);
