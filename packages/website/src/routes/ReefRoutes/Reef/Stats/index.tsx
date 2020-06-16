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
} from "@material-ui/core";

import { colorCode } from "../../../../assets/colorCode";

const Stats = ({ classes }: StatsProps) => (
  <Grid
    className={classes.root}
    container
    direction="row"
    justify="center"
    spacing={9}
  >
    <Grid className={classes.item} item xs={6}>
      <Card className={classes.card1}>
        <CardHeader
          style={{ flex: "0 1 auto" }}
          title={
            <Typography color="textSecondary" variant="subtitle2">
              MAX PAST 7 DAYS
            </Typography>
          }
        />
        <CardContent style={{ flex: "1 1 auto" }}>
          <Grid
            container
            direction="column"
            alignItems="flex-start"
            justify="space-around"
            style={{ height: "100%" }}
          >
            <Grid item>
              <Typography style={{ color: "#686868" }} variant="caption">
                SURFACE TEMP
              </Typography>
              <Typography
                style={{ color: "#0d8bc3", fontWeight: 300 }}
                variant="h3"
              >
                33.2 &#8451;
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="textSecondary" variant="caption">
                TEMP AT 25M
              </Typography>
              <Typography
                style={{ color: "#74b66e", fontWeight: 300 }}
                variant="h3"
              >
                31.7 &#8451;
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
    <Grid className={classes.item} item xs={6}>
      <Card className={classes.card2}>
        <CardHeader
          style={{ flex: "0 1 auto" }}
          title={
            <Typography color="textPrimary" variant="subtitle2">
              DEGREE HEATING DAYS
            </Typography>
          }
        />
        <CardContent style={{ flex: "1 1 auto", padding: 0 }}>
          <Grid
            container
            direction="column"
            alignItems="flex-start"
            justify="space-between"
            style={{ height: "100%" }}
          >
            <Grid item>
              <Typography
                style={{ fontWeight: 300, paddingLeft: "1rem" }}
                variant="h1"
              >
                16
              </Typography>
            </Grid>
            <Grid item>
              <Grid style={{ width: "100%", margin: 0 }} container spacing={2}>
                {colorCode.map((elem) => (
                  <Grid
                    container
                    justify="center"
                    alignItems="center"
                    key={elem.value}
                    style={{ backgroundColor: `${elem.color}` }}
                    item
                    xs={1}
                  >
                    <Typography variant="caption">{elem.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

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
      backgroundColor: "#059da6",
      display: "flex",
      flexFlow: "column",
    },
  });

interface StatsProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(Stats);
