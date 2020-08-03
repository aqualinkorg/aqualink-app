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

import { colorCode } from "../../../../assets/colorCode";
import type { Data } from "../../../../store/Reefs/types";
import { sortDailyData } from "../../../../helpers/sortDailyData";
import { formatNumber } from "../../../../helpers/numberUtils";
import satellite from "../../../../assets/satellite.svg";

const Satellite = ({ dailyData, classes }: SatelliteProps) => {
  const sortByDate = sortDailyData(dailyData, "desc");
  const { degreeHeatingDays } = sortByDate[0];

  const degreeHeatingWeeks = Math.round((degreeHeatingDays / 7) * 10) / 10;

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="flex-end">
            <Grid item xs={2}>
              <img alt="satellite" src={satellite} />
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Grid
          container
          direction="column"
          alignItems="stretch"
          justify="space-between"
          style={{ height: "100%" }}
        >
          <Grid className={classes.contentText} item>
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
                  variant="h2"
                >
                  {formatNumber(sortByDate[0].satelliteTemperature, 1)} &#176;C
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
                <Typography
                  className={classes.contentTextValues}
                  color="textPrimary"
                  variant="h2"
                >
                  {formatNumber(degreeHeatingWeeks, 1)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item container>
            {colorCode.map((elem) => (
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
    card: {
      height: "100%",
      width: "100%",
      backgroundColor: "#0c9da5",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      flex: "0 1 auto",
      padding: "0.5rem 0 0 0",
    },
    content: {
      flex: "1 1 auto",
      padding: 0,
    },
    contentText: {
      padding: "0 2rem 0 2rem",
    },
    contentTextTitles: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.33,
      letterSpacing: "normal",
    },
    contentTextValues: {
      fontWeight: 300,
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: "normal",
      letterSpacing: "normal",
    },
  });

interface SatelliteIncomingProps {
  dailyData: Data[];
}

type SatelliteProps = WithStyles<typeof styles> & SatelliteIncomingProps;

export default withStyles(styles)(Satellite);
