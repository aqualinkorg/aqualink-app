import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
} from "@material-ui/core";

import type { DailyData } from "../../../../store/Reefs/types";
import UpdateInfo from "../../../../common/UpdateInfo";

import { findIntervalByLevel } from "../../../../helpers/bleachingAlertIntervals";
import { styles as incomingStyles } from "../styles";
import { toRelativeTime } from "../../../../helpers/dates";

const Bleaching = ({ dailyData, classes }: BleachingProps) => {
  const relativeTime = toRelativeTime(dailyData?.date);

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item xs={12}>
              <Typography color="textSecondary" variant="h6">
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
          justify="center"
          item
          xs={12}
        >
          <img
            className={classes.alertImage}
            src={findIntervalByLevel(dailyData.weeklyAlertLevel).image}
            alt="alert-level"
          />
          <UpdateInfo
            relativeTime={relativeTime}
            timeText="Last data received"
            image={null}
            imageText="NOAA CRW"
            live={false}
            frequency="daily"
            href="https://coralreefwatch.noaa.gov/product/5km/index_5km_baa_max_r07d.php"
            withMargin
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    ...incomingStyles,
    card: {
      ...incomingStyles.card,
      height: "100%",
      width: "100%",
      backgroundColor: "#eff0f0",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      flex: "0 1 auto",
      padding: "0.5rem 1rem 1.5rem 1rem",
    },
    contentWrapper: {
      padding: 0,
      height: "100%",
    },
    content: {
      height: "100%",
    },
    alertImage: {
      height: 160,
      marginBottom: 5,
    },
  });

interface BleachingIncomingProps {
  dailyData: DailyData;
}

type BleachingProps = WithStyles<typeof styles> & BleachingIncomingProps;

export default withStyles(styles)(Bleaching);
