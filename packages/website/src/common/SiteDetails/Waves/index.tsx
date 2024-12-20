import React from 'react';
import { Theme, Card, CardContent, Typography, Grid } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import classNames from 'classnames';
import { isNil } from 'lodash';

import type { LatestDataASSofarValue } from 'store/Sites/types';
import { formatNumber } from 'helpers/numberUtils';
import { toRelativeTime } from 'helpers/dates';
import UpdateInfo from '../../UpdateInfo';
import waves from '../../../assets/waves.svg';
import arrow from '../../../assets/directioncircle.svg';
import wind from '../../../assets/wind.svg';
import { styles as incomingStyles } from '../styles';

const Waves = ({ data, hasSpotter }: WavesProps) => {
  const {
    significantWaveHeight,
    waveMeanDirection,
    waveMeanPeriod,
    windSpeed,
    windDirection,
  } = data;

  const waveHeight = significantWaveHeight;

  // Make sure to get the direction the wind is COMING FROM.
  // use `numberUtils.invertDirection` if needed.
  const windDirectionFrom = windDirection?.value;
  const waveDirectionFrom = waveMeanDirection?.value;
  const classes = useStyles({
    windDirection: windDirectionFrom,
    wavesDirection: waveDirectionFrom,
  });

  const windRelativeTime =
    windSpeed?.timestamp && toRelativeTime(windSpeed.timestamp);

  return (
    <Card className={classes.root}>
      <CardContent className={classes.contentWrapper}>
        <Grid
          className={classes.content}
          container
          justifyContent="center"
          alignContent="space-between"
          item
          xs={12}
        >
          <Grid className={classes.paddingContainer} container item xs={12}>
            <Typography
              className={`${classes.cardTitle} ${classes.coloredText}`}
              variant="h6"
            >
              WIND
            </Typography>
            <img className={classes.titleImages} alt="wind" src={wind} />
          </Grid>
          <Grid className={classes.paddingContainer} container item xs={12}>
            <Grid item xs={6}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                SPEED
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {/* Transform wind speed from m/s to km/h */}
                  {formatNumber(windSpeed?.value && windSpeed.value * 3.6, 1)}
                </Typography>
                {windSpeed?.value?.toString() && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    km/h
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                DIRECTION
              </Typography>
              <Grid container alignItems="baseline">
                {!isNil(windDirectionFrom) && (
                  <img
                    className={classNames(
                      classes.arrow,
                      classes.windDirectionArrow,
                    )}
                    alt="arrow"
                    src={arrow}
                  />
                )}
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {!isNil(windDirectionFrom)
                    ? `${formatNumber(windDirectionFrom)}\u00B0`
                    : '- -'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid className={classes.paddingContainer} container item xs={12}>
            <Typography
              className={`${classes.cardTitle} ${classes.coloredText}`}
              variant="h6"
            >
              WAVES
            </Typography>
            <img className={classes.titleImages} alt="waves" src={waves} />
          </Grid>
          <Grid
            className={classes.paddingContainer}
            item
            xs={12}
            container
            justifyContent="space-between"
          >
            <Grid item lg={4}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                HEIGHT
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {formatNumber(waveHeight?.value, 1)}
                </Typography>
                {!isNil(waveHeight?.value) && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    m
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item lg={3}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                PERIOD
              </Typography>
              <Grid container alignItems="baseline">
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {formatNumber(waveMeanPeriod?.value)}
                </Typography>
                {!isNil(waveMeanPeriod?.value) && (
                  <Typography
                    className={classes.contentUnits}
                    color="textSecondary"
                    variant="h6"
                  >
                    s
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid item lg={5}>
              <Typography
                className={classes.contentTextTitles}
                color="textSecondary"
                variant="subtitle2"
              >
                DIRECTION
              </Typography>
              <Grid container alignItems="baseline">
                {!isNil(waveDirectionFrom) && (
                  <img
                    className={classNames(
                      classes.arrow,
                      classes.wavesDirectionArrow,
                    )}
                    alt="arrow"
                    src={arrow}
                  />
                )}
                <Typography
                  className={classes.contentTextValues}
                  color="textSecondary"
                  variant="h3"
                >
                  {!isNil(waveDirectionFrom)
                    ? `${formatNumber(waveDirectionFrom)}\u00B0`
                    : '- -'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <UpdateInfo
            relativeTime={windRelativeTime}
            timeText={hasSpotter ? 'Last data received' : 'Valid'}
            live={hasSpotter}
            frequency={hasSpotter ? 'hourly' : 'every 6 hours'}
            href="https://www.ncdc.noaa.gov/data-access/model-data/model-datasets/global-forcast-system-gfs"
            imageText={hasSpotter ? undefined : 'SOFAR MODEL'}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    ...incomingStyles,
    root: {
      height: '100%',
      width: '100%',
      backgroundColor: '#eff0f0',
      display: 'flex',
      flexDirection: 'column',
    },
    coloredText: {
      color: theme.palette.primary.main,
    },
    titleImages: {
      height: 24,
      marginLeft: '0.5rem',
    },
    paddingContainer: {
      padding: '0.5rem 1rem',
    },
    contentWrapper: {
      height: '100%',
      flex: '1 1 auto',
      padding: 0,
    },
    content: {
      height: '100%',
    },
    arrow: {
      width: 20,
      height: 20,
      marginRight: '1rem',
      marginBottom: 10,
      [theme.breakpoints.between('md', 1350)]: {
        width: 15,
        height: 15,
      },
    },
    windDirectionArrow: ({ windDirection }: StyleProps) => ({
      transform: `rotate(${(windDirection || 0) + 180}deg)`,
    }),
    wavesDirectionArrow: ({ wavesDirection }: StyleProps) => ({
      transform: `rotate(${(wavesDirection || 0) + 180}deg)`,
    }),
  }),
);

interface WavesProps {
  data: LatestDataASSofarValue;
  hasSpotter: boolean;
}

interface StyleProps {
  windDirection?: number;
  wavesDirection?: number;
}

export default Waves;
