import React, { ElementType } from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Typography,
  Theme,
  Box,
} from "@material-ui/core";

import Map from "./Map";
import FeaturedMedia from "./FeaturedMedia";
import Satellite from "./Satellite";
import Sensor from "./Sensor";
import CoralBleaching from "./CoralBleaching";
import Waves from "./Waves";
import Charts from "./Charts";
import Surveys from "./Surveys";
import type { Reef } from "../../../store/Reefs/types";
import { locationCalculator } from "../../../helpers/locationCalculator";
import { formatNumber } from "../../../helpers/numberUtils";

const ReefDetails = ({ classes, reef }: ReefDetailProps) => {
  const [lng, lat] = locationCalculator(reef.polygon);

  const { dailyData, maxMonthlyMean } = reef;
  const cards = [
    {
      Component: Satellite as ElementType,
      props: { dailyData, maxMonthlyMean },
    },
    {
      Component: Sensor as ElementType,
      props: { reef },
    },
    {
      Component: CoralBleaching as ElementType,
      props: { dailyData, maxMonthlyMean },
    },
    {
      Component: Waves as ElementType,
      props: { dailyData },
    },
  ];

  return (
    <Box mt="1rem">
      <Box>
        <Grid container alignItems="baseline" spacing={2}>
          <Grid item>
            <Typography variant="h6">LOCATION:</Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle2">
              LAT: {formatNumber(lat, 3)}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle2">
              LONG: {formatNumber(lng, 3)}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Grid container justify="space-between" spacing={4}>
        <Grid item xs={12} md={6}>
          <div className={classes.container}>
            <Map polygon={reef.polygon} />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div className={classes.container}>
            <FeaturedMedia
              url={reef.videoStream}
              featuredImage={reef.featuredImage}
            />
          </div>
        </Grid>
      </Grid>

      <Grid container justify="space-between" spacing={4}>
        {cards.map(({ Component, props }, index) => (
          <Grid key={index.toString()} item xs={12} sm={6} md={3}>
            <Component {...props} />
          </Grid>
        ))}
      </Grid>

      <Box mt="2rem">
        <Charts
          dailyData={reef.dailyData}
          depth={reef.depth}
          maxMonthlyMean={reef.maxMonthlyMean || null}
          temperatureThreshold={
            reef.maxMonthlyMean ? reef.maxMonthlyMean + 1 : null
          }
        />
        <Surveys reefId={reef.id} />
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
    container: {
      height: "30rem",
      marginBottom: "2rem",
      [theme.breakpoints.between("md", 1440)]: {
        height: "25rem",
      },
      [theme.breakpoints.down("xs")]: {
        height: "20rem",
      },
    },
  });

type ReefDetailProps = WithStyles<typeof styles> & { reef: Reef };

export default withStyles(styles)(ReefDetails);
