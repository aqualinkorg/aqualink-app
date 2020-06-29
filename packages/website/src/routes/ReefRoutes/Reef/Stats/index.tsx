import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Card,
  CardHeader,
  Typography,
  CardContent,
  CardMedia,
} from "@material-ui/core";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

import { colorCode } from "../../../../assets/colorCode";
import bottom from "../../../../assets/bottom.svg";
import { ReefState } from "../../../../store/Reefs/types";

const colorFinder = (value: number) => {
  const len = colorCode.length;
  const index = colorCode.findIndex((elem) => value < elem.value);
  if (index > 0) {
    return colorCode[index - 1];
  }
  if (index === 0) {
    return colorCode[index];
  }
  return colorCode[len - 1];
};

const Stats = ({ dailyData, classes }: StatsProps) => {
  const degreeHeatingDays =
    dailyData && dailyData[0] && dailyData[0].degreeHeatingDays;

  const colorItem = degreeHeatingDays && colorFinder(degreeHeatingDays);

  const weekSurfaceTemperatures = dailyData
    .slice(0, 7)
    .map((item) => item.surfaceTemperature);
  const weekMaxSurfaceTemperature = Math.max(...weekSurfaceTemperatures);

  const weekBottomTemperatures = dailyData
    .slice(0, 7)
    .map((item) => item.bottomTemperature.max);
  const weekMaxBottomTemperature = Math.max(...weekBottomTemperatures);

  return (
    <Grid
      className={classes.root}
      container
      direction="row"
      justify="center"
      spacing={9}
    >
      <Grid className={classes.item} item xs={6}>
        <Card style={{ height: "inherit" }}>
          <CardMedia className={classes.card1} image={bottom}>
            <CardHeader
              style={{ flex: "0 1 auto" }}
              title={
                <Typography color="textSecondary" variant="subtitle2">
                  MAX PAST 7 DAYS
                </Typography>
              }
            />
            <CardContent
              style={{ flex: "1 1 auto", padding: "0 1rem 1rem 1rem" }}
            >
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                justify="space-between"
                style={{ height: "100%" }}
              >
                <Grid item>
                  <Typography style={{ color: "#686868" }} variant="caption">
                    SURFACE TEMP
                  </Typography>
                  {weekMaxSurfaceTemperature > -Infinity && (
                    <Typography
                      style={{ fontWeight: 300 }}
                      variant="h3"
                      color="textSecondary"
                    >
                      {weekMaxSurfaceTemperature} &#8451;
                    </Typography>
                  )}
                </Grid>
                <Grid item>
                  <Typography style={{ color: "#128cc0" }} variant="caption">
                    TEMP AT 25M
                  </Typography>
                  {weekMaxBottomTemperature > -Infinity && (
                    <Typography
                      style={{ color: "#128cc0", fontWeight: 300 }}
                      variant="h3"
                    >
                      {weekMaxBottomTemperature} &#8451;
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </CardMedia>
        </Card>
      </Grid>
      <Grid className={classes.item} item xs={6}>
        <Card className={classes.card2}>
          <CardHeader
            style={{ flex: "0 1 auto" }}
            title={
              <Typography color="textSecondary" variant="subtitle2">
                DEGREE HEATING WEEKS
              </Typography>
            }
          />
          <CardContent style={{ flex: "1 1 auto", padding: 0 }}>
            <Grid
              container
              direction="column"
              alignItems="stretch"
              justify="space-between"
              style={{ height: "100%" }}
            >
              <Grid item>
                {colorItem && (
                  <Typography
                    style={{
                      color: colorItem.color,
                      fontWeight: 300,
                      paddingLeft: "1rem",
                    }}
                    variant="h1"
                  >
                    {degreeHeatingDays}
                  </Typography>
                )}
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
                    {colorItem && (
                      <FiberManualRecordIcon
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color:
                            elem.value === colorItem.value
                              ? colorItem.color
                              : "transparent",
                        }}
                      />
                    )}
                    <Grid
                      container
                      justify="center"
                      alignItems="center"
                      item
                      xs={12}
                      style={{ backgroundColor: `${elem.color}` }}
                    >
                      <Typography variant="caption">{elem.value}</Typography>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    root: {
      height: "inherit",
    },
    item: {
      height: "inherit",
    },
    card1: {
      height: "inherit",
      backgroundColor: "#eff0f0",
      display: "flex",
      flexFlow: "column",
    },
    card2: {
      height: "inherit",
      backgroundColor: "#eff0f0",
      display: "flex",
      flexFlow: "column",
    },
  });

interface StatsIncomingProps {
  dailyData: ReefState["details"]["dailyData"];
}

type StatsProps = WithStyles<typeof styles> & StatsIncomingProps;

export default withStyles(styles)(Stats);
