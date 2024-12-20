import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
  Box,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import { User } from 'store/User/types';
import { userInfoSelector } from 'store/User/userSlice';
import { LatestDataASSofarValue } from 'store/Sites/types';
import { findAdministeredSite } from 'helpers/findAdministeredSite';
import { formatNumber } from 'helpers/numberUtils';
import { toRelativeTime } from 'helpers/dates';
import { isAdmin } from 'helpers/user';
import sensor from '../../../assets/sensor.svg';
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';

/**
 * Get the sensor application tag message and clickability for a user/site combination.
 *
 * @param user
 * @param siteId
 */
const getApplicationTag = (
  user: User | null,
  siteId: number,
): [string, boolean] => {
  const userSite = findAdministeredSite(user, siteId);
  const { applied, status } = userSite || {};
  const isSiteAdmin = isAdmin(user, siteId);

  switch (true) {
    case !isSiteAdmin:
      return ['No Live Telemetry', false];

    case !applied:
      return ['No Live Telemetry', false];

    case status === 'in_review':
      return ['My Application', true];

    case status === 'approved':
      return ['Smart Buoy Approved', false];

    case status === 'rejected':
      return ['Smart Buoy Not Approved', false];

    case status === 'shipped':
      return ['Your Buoy Has Shipped!', false];

    default:
      return ['Not Installed Yet', false];
  }
};

const Sensor = ({ depth, id, data, classes }: SensorProps) => {
  const {
    topTemperature,
    bottomTemperature,
    barometricPressureTop,
    barometricPressureTopDiff,
    surfaceTemperature,
  } = data;

  const relativeTime =
    (topTemperature?.timestamp && toRelativeTime(topTemperature.timestamp)) ||
    (bottomTemperature?.timestamp &&
      toRelativeTime(bottomTemperature.timestamp)) ||
    (surfaceTemperature?.timestamp &&
      toRelativeTime(surfaceTemperature.timestamp));

  const hasSpotter = Boolean(
    topTemperature?.value ||
      bottomTemperature?.value ||
      surfaceTemperature?.value,
  );

  const user = useSelector(userInfoSelector);

  const metrics = [
    {
      label: 'TEMP AT 1m',
      value: `${formatNumber(topTemperature?.value, 1)}°C`,
    },
    {
      label: `TEMP AT ${depth ? `${depth}m` : 'DEPTH'}`,
      value: `${formatNumber(bottomTemperature?.value, 1)}°C`,
    },
  ];

  const [alertText, clickable] = getApplicationTag(user, id);

  const getGridTemplateAreas = () => {
    if (barometricPressureTop && surfaceTemperature)
      return "'value3 image' 'value0 image' 'value1 image' 'value2 value4'";
    if (surfaceTemperature)
      return "'value3 image' 'value0 image' 'value1 image'";
    if (barometricPressureTop)
      return "'value0 image' 'spacer1 image' 'value1 image' 'spacer2 image' 'value2 value4'";
    return "'value0 image' 'spacer1 image' 'value1 image'";
  };

  const getImageHeight = () => {
    if (barometricPressureTop && surfaceTemperature) return '150';
    if (surfaceTemperature) return '150';
    if (barometricPressureTop) return '135';
    return '150';
  };

  const getSpace1Height = () => {
    if (barometricPressureTop && surfaceTemperature) return 'inherit';
    if (surfaceTemperature) return 'inherit';
    if (barometricPressureTop) return 'inherit';
    return '2em';
  };

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography className={classes.cardTitle} variant="h6">
                BUOY OBSERVATION
              </Typography>
            </Grid>
          </Grid>
        }
      />

      <CardContent className={classes.content}>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateAreas: getGridTemplateAreas(),
            padding: '1rem',
          }}
        >
          {metrics.map(({ label, value }, index) => (
            <div style={{ gridArea: `value${index}` }} key={label}>
              <Typography
                className={classes.contentTextTitles}
                variant="subtitle2"
              >
                {label}
              </Typography>
              <Typography className={classes.contentTextValues} variant="h3">
                {value}
              </Typography>
            </div>
          ))}
          {barometricPressureTop && (
            <div style={{ gridArea: 'value2' }}>
              <Typography
                className={classes.contentTextTitles}
                variant="subtitle2"
              >
                BAROMETRIC PRESSURE
              </Typography>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <Typography className={classes.contentTextValues} variant="h3">
                  {formatNumber(barometricPressureTop?.value, 1)}
                </Typography>
                <Typography className={classes.contentUnits} variant="h6">
                  hPa
                </Typography>
              </Box>
            </div>
          )}
          <div
            style={{
              gridArea: 'spacer1',
              display: 'inherit',
              minHeight: getSpace1Height(),
            }}
          />
          <div
            style={{
              gridArea: 'spacer2',
              display: 'inherit',
            }}
          />
          {surfaceTemperature && (
            <div style={{ gridArea: 'value3' }}>
              <Typography
                className={classes.contentTextTitles}
                variant="subtitle2"
              >
                SURFACE TEMP
              </Typography>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <Typography className={classes.contentTextValues} variant="h3">
                  {`${formatNumber(surfaceTemperature.value, 1)}°C`}
                </Typography>
              </Box>
            </div>
          )}
          <div style={{ gridArea: 'image', position: 'relative' }}>
            <img
              style={{ position: 'absolute', bottom: '0' }}
              alt="sensor"
              src={sensor}
              height={getImageHeight()}
              width="auto"
            />
          </div>
          <div
            style={{
              gridArea: 'value4',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            {barometricPressureTopDiff && (
              <div>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  {(barometricPressureTopDiff.value || 0) === 0 && (
                    <RemoveIcon />
                  )}
                  {(barometricPressureTopDiff.value || 0) <= 0 && (
                    <ArrowDownwardIcon />
                  )}
                  {(barometricPressureTopDiff.value || 0) >= 0 && (
                    <ArrowUpwardIcon />
                  )}

                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {formatNumber(barometricPressureTopDiff.value, 1)}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    hPa
                  </Typography>
                </Box>
              </div>
            )}
          </div>
        </div>
        {hasSpotter ? (
          <UpdateInfo
            relativeTime={relativeTime}
            timeText="Last data received"
            live
            frequency="hourly"
          />
        ) : (
          <Grid
            className={classes.noSensorAlert}
            container
            alignItems="center"
            justifyContent="center"
          >
            {clickable ? (
              <Link
                className={classes.newSpotterLink}
                to={`/sites/${id}/apply`}
              >
                <Typography variant="h6">{alertText}</Typography>
              </Link>
            ) : (
              <Typography variant="h6">{alertText}</Typography>
            )}
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
      backgroundColor: '#128cc0',
    },
    titleImage: {
      height: 35,
      width: 35,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      flexGrow: 1,
      padding: 0,
    },
    noSensorAlert: {
      backgroundColor: '#edb86f',
      borderRadius: '0 0 4px 4px',
      color: 'white',
      width: '100%',
      minHeight: 40,
    },
    rejectedAlert: {
      fontSize: 11,
    },
    newSpotterLink: {
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
      textDecoration: 'none',
      '&:hover': {
        color: 'inherit',
        textDecoration: 'none',
      },
    },
  });

interface SensorIncomingProps {
  depth: number | null;
  id: number;
  data: LatestDataASSofarValue;
}

type SensorProps = WithStyles<typeof styles> & SensorIncomingProps;

export default withStyles(styles)(Sensor);
