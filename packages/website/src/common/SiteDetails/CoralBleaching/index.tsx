import React from 'react';
import { Card, CardContent, Typography, CardHeader, Grid } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import type { LatestDataASSofarValue } from 'store/Sites/types';
import { findIntervalByLevel } from 'helpers/bleachingAlertIntervals';
import { toRelativeTime } from 'helpers/dates';
import UpdateInfo from '../../UpdateInfo';

import { styles as incomingStyles } from '../styles';

function Bleaching({ data, classes }: BleachingProps) {
  const { timestamp, value: tempWeeklyAlertValue } = data.tempWeeklyAlert || {
    value: 0,
  };
  const relativeTime = timestamp && toRelativeTime(timestamp);

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item xs={12}>
              <Typography
                className={classes.cardTitle}
                color="textSecondary"
                variant="h6"
              >
                HEAT STRESS ALERT LEVEL
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.contentWrapper}>
        <Grid
          className={classes.content}
          container
          alignItems="center"
          alignContent="space-between"
          justifyContent="center"
          item
          xs={12}
        >
          <img
            className={classes.alertImage}
            src={findIntervalByLevel(tempWeeklyAlertValue).image}
            alt="alert-level"
          />
          <UpdateInfo
            relativeTime={relativeTime}
            timeText="Last data received"
            imageText="NOAA CRW"
            live={false}
            frequency="daily"
            href="https://coralreefwatch.noaa.gov/product/5km/index_5km_baa-max-7d.php"
            withMargin
          />
        </Grid>
      </CardContent>
    </Card>
  );
}

const styles = () =>
  createStyles({
    ...incomingStyles,
    root: {
      height: '100%',
      width: '100%',
      backgroundColor: '#eff0f0',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      flex: '0 1 auto',
      padding: '0.5rem 1rem 1.5rem 1rem',
    },
    contentWrapper: {
      padding: 0,
      height: '100%',
    },
    content: {
      height: '100%',
    },
    alertImage: {
      height: 160,
      marginBottom: 5,
    },
  });

interface BleachingIncomingProps {
  data: LatestDataASSofarValue;
}

type BleachingProps = WithStyles<typeof styles> & BleachingIncomingProps;

export default withStyles(styles)(Bleaching);
