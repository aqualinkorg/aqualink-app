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

const Bleaching = ({ dailyData, timeZone, classes }: BleachingProps) => {
  const timestamp =
    dailyData?.date && timeZone
      ? new Date(dailyData?.date)
          .toLocaleDateString("en-GB", {
            timeZone,
            timeZoneName: "short",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(",", "")
      : null;

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
            timestamp={timestamp}
            timestampText="Last data received"
            image={null}
            imageText="NOAA CRW"
            live={false}
            frequency="daily"
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
  timeZone?: string | null;
}

Bleaching.defaultProps = {
  timeZone: null,
};

type BleachingProps = WithStyles<typeof styles> & BleachingIncomingProps;

export default withStyles(styles)(Bleaching);
