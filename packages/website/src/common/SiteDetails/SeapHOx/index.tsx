import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
  Box,
  Tooltip,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { LatestDataASSofarValue } from 'store/Sites/types';
import { formatNumber } from 'helpers/numberUtils';
import { toRelativeTime } from 'helpers/dates';
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';

const SeapHOx = ({ data, classes }: SeapHOxProps) => {
  const {
    seaphoxTemperature,
    seaphoxExternalPh,
    seaphoxInternalPh,
    seaphoxSalinity,
    seaphoxOxygen,
    seaphoxConductivity,
    seaphoxPressure,
    seaphoxPhTemperature,
    seaphoxRelativeHumidity,
  } = data;

  console.log('=== SEAPHOX COMPONENT DEBUG ===');
  console.log('Full data prop:', data);
  console.log('Data keys:', Object.keys(data || {}));
  console.log('Temperature:', seaphoxTemperature);
  console.log('pH:', seaphoxExternalPh);
  console.log('Salinity:', seaphoxSalinity);
  console.log('Oxygen:', seaphoxOxygen);
  console.log('Conductivity:', seaphoxConductivity);
  console.log('Pressure:', seaphoxPressure);

  const relativeTime =
    seaphoxTemperature?.timestamp &&
    toRelativeTime(seaphoxTemperature.timestamp);

  const hasSeapHOxData = Boolean(
    seaphoxTemperature?.value ||
      seaphoxExternalPh?.value ||
      seaphoxSalinity?.value,
  );

  // Display only these 6 metrics as requested
  const metrics = [
    {
      label: 'TEMPERATURE',
      value: `${formatNumber(seaphoxTemperature?.value, 2)}°C`,
      tooltipTitle: 'Water temperature measured by SeapHOx sensor',
      show: Boolean(seaphoxTemperature?.value),
    },
    {
      label: 'pH',
      value: formatNumber(seaphoxExternalPh?.value, 3),
      tooltipTitle: 'External pH measurement',
      show: Boolean(seaphoxExternalPh?.value),
    },
    {
      label: 'PRESSURE',
      value: `${formatNumber(seaphoxPressure?.value, 1)} dbar`,
      tooltipTitle: 'Water pressure in decibars',
      show: Boolean(seaphoxPressure?.value),
    },
    {
      label: 'SALINITY',
      value: `${formatNumber(seaphoxSalinity?.value, 2)} psu`,
      tooltipTitle: 'Practical Salinity Units',
      show: Boolean(seaphoxSalinity?.value),
    },
    {
      label: 'CONDUCTIVITY',
      value: `${formatNumber(seaphoxConductivity?.value, 2)} S/m`,
      tooltipTitle: 'Water conductivity',
      show: Boolean(seaphoxConductivity?.value),
    },
    {
      label: 'DISSOLVED OXYGEN',
      value: `${formatNumber(seaphoxOxygen?.value, 2)} ml/L`,
      tooltipTitle: 'Dissolved oxygen concentration',
      show: Boolean(seaphoxOxygen?.value),
    },
  ].filter((metric) => metric.show);

  const displayedMetrics = metrics;

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container alignItems="center">
            <Grid item>
              <Typography className={classes.cardTitle} variant="h6">
                SeapHOx sensor
              </Typography>
            </Grid>
          </Grid>
        }
      />

      <CardContent className={classes.content}>
        <Box p="1rem" display="flex" flexGrow={1}>
          <Grid container spacing={2}>
            {displayedMetrics.map(({ label, value, tooltipTitle }) => (
              <Grid key={label} item xs={6}>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  {label}
                </Typography>
                <Tooltip title={tooltipTitle || ''}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {value}
                  </Typography>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>

        {hasSeapHOxData ? (
          <UpdateInfo
            relativeTime={relativeTime}
            timeText="Last data received"
            live
            imageText="SeapHOx"
          />
        ) : (
          <Grid
            className={classes.noSensorAlert}
            container
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h6">No SeapHOx Data Available</Typography>
          </Grid>
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
      backgroundColor: '#23225b',
      color: 'white',
    },
    header: {
      backgroundColor: '#23225b',
    },
    cardTitle: {
      color: 'white',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexGrow: 1,
      padding: 0,
    },
    contentTextTitles: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    contentTextValues: {
      color: 'white',
      fontWeight: 500,
    },
    noSensorAlert: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '0 0 4px 4px',
      color: 'white',
      width: '100%',
      minHeight: 40,
    },
  });

interface SeapHOxIncomingProps {
  data: LatestDataASSofarValue;
}

type SeapHOxProps = WithStyles<typeof styles> & SeapHOxIncomingProps;

export default withStyles(styles)(SeapHOx);
