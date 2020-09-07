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
  Tooltip,
} from "@material-ui/core";

import { dhwColorCode } from "../../../../assets/colorCode";
import type { Data } from "../../../../store/Reefs/types";
import { sortDailyData } from "../../../../helpers/sortDailyData";
import { formatNumber } from "../../../../helpers/numberUtils";
import satellite from "../../../../assets/satellite.svg";
import {
  dhwColorFinder,
  degreeHeatingWeeksCalculator,
} from "../../../../helpers/degreeHeatingWeeks";
import { styles as incomingStyles } from "../styles";

const Satellite = ({ maxMonthlyMean, dailyData, classes }: SatelliteProps) => {
  const sortByDate = sortDailyData(dailyData, "desc");
  const { degreeHeatingDays, satelliteTemperature } = sortByDate[0];

  const degreeHeatingWeeks = degreeHeatingWeeksCalculator(degreeHeatingDays);

  return (
    <Card
      className={classes.card}
      style={{ backgroundColor: dhwColorFinder(degreeHeatingWeeks) }}
    >
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="space-between">
            <Grid container item xs={8}>
              <Typography className={classes.cardTitle} variant="h6">
                SATELLITE OBSERVATION
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <img
                className={classes.titleImage}
                alt="satellite"
                src={satellite}
              />
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Grid container justify="space-between" style={{ height: "100%" }}>
          <Grid
            className={classes.contentTextWrapper}
            alignContent="flex-start"
            container
            item
            xs={12}
          >
            <Grid
              className={classes.contentMeasure}
              item
              xs={6}
              md={12}
              lg={12}
              xl={6}
            >
              <Typography
                className={classes.contentTextTitles}
                color="textPrimary"
                variant="subtitle2"
              >
                SURFACE TEMP
              </Typography>
              <Typography
                className={classes.contentTextValues}
                color="textPrimary"
              >
                {`${formatNumber(satelliteTemperature, 1)} °C`}
              </Typography>
            </Grid>
            <Grid
              className={classes.contentMeasure}
              item
              xs={6}
              md={12}
              lg={12}
              xl={6}
            >
              <Typography
                className={classes.contentTextTitles}
                color="textPrimary"
                variant="subtitle2"
              >
                HISTORICAL MAX TEMP
              </Typography>
              <Typography
                className={classes.contentTextValues}
                color="textPrimary"
              >
                {`${formatNumber((maxMonthlyMean || 20) + 1, 1)} °C`}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                className={classes.contentTextTitles}
                color="textPrimary"
                variant="subtitle2"
              >
                DEGREE HEATING WEEKS
              </Typography>
              <Tooltip title="Degree Heating Weeks - a measure of the amount of time above the 20 year historical maximum temperatures">
                <Typography
                  className={classes.contentTextValues}
                  color="textPrimary"
                >
                  {`${formatNumber(degreeHeatingWeeks, 1)} DHW`}
                </Typography>
              </Tooltip>
            </Grid>
          </Grid>
          <Grid item container alignItems="flex-end">
            {dhwColorCode.map((elem) => (
              <Grid
                container
                justify="center"
                alignItems="center"
                key={elem.value}
                item
                xs={1}
              >
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                  item
                  style={{ backgroundColor: `${elem.color}`, height: "2rem" }}
                >
                  <Typography variant="caption">{elem.value}</Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    ...incomingStyles,
    card: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
    cardTitle: {
      lineHeight: 1.5,
    },
    titleImage: {
      height: 35,
      width: 35,
    },
    header: {
      flex: "0 1 auto",
      padding: "1rem 1rem 0 1rem",
    },
    content: {
      flex: "1 1 auto",
      padding: "1rem 0 0 0",
    },
    contentTextWrapper: {
      padding: "0 1rem 0 1rem",
    },
    contentText: {
      marginTop: "1rem",
      padding: "0 1rem 0 1rem",
    },
  });

interface SatelliteIncomingProps {
  maxMonthlyMean: number | null;
  dailyData: Data[];
}

type SatelliteProps = WithStyles<typeof styles> & SatelliteIncomingProps;

export default withStyles(styles)(Satellite);
