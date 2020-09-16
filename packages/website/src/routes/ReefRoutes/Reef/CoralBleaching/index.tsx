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

import type { Data } from "../../../../store/Reefs/types";
import { sortDailyData } from "../../../../helpers/sortDailyData";

import { alertFinder } from "../../../../helpers/bleachingAlertIntervals";
import { degreeHeatingWeeksCalculator } from "../../../../helpers/degreeHeatingWeeks";

const Bleaching = ({ dailyData, maxMonthlyMean, classes }: BleachingProps) => {
  const sortByDate = sortDailyData(dailyData, "desc");
  const { degreeHeatingDays, satelliteTemperature } = sortByDate[0];

  const degreeHeatingWeeks = degreeHeatingWeeksCalculator(degreeHeatingDays);

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="flex-start">
            <Grid item xs={12}>
              <Typography color="textSecondary" variant="h6">
                CORAL BLEACHING ALERT
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.contentWrapper}>
        <Grid
          style={{ height: "100%" }}
          container
          alignItems="center"
          justify="center"
          item
          xs={12}
        >
          <img
            src={alertFinder(
              maxMonthlyMean,
              satelliteTemperature,
              degreeHeatingWeeks
            )}
            alt="alert-level"
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    card: {
      height: "100%",
      width: "100%",
      backgroundColor: "#eff0f0",
      display: "flex",
      flexDirection: "column",
      paddingBottom: "1rem",
    },
    header: {
      flex: "0 1 auto",
      padding: "1rem",
    },
    contentWrapper: {
      padding: 0,
    },
  });

interface BleachingIncomingProps {
  dailyData: Data[];
  maxMonthlyMean: number | null;
}

type BleachingProps = WithStyles<typeof styles> & BleachingIncomingProps;

export default withStyles(styles)(Bleaching);
