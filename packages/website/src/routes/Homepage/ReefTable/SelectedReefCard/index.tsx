import React from "react";
import {
  Typography,
  Grid,
  Button,
  CardMedia,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  CircularProgress,
  Card,
  Hidden,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import CardChart from "./cardChart";
import { Reef } from "../../../../store/Reefs/types";
import { sortDailyData } from "../../../../helpers/sortDailyData";
import { formatNumber } from "../../../../helpers/numberUtils";

import reefImage from "../../../../assets/reef-image.jpg";
import { degreeHeatingWeeksCalculator } from "../../../../helpers/degreeHeatingWeeks";

const SelectedReefCard = ({ classes, reef }: SelectedReefCardProps) => {
  const sortByDate = sortDailyData(reef.dailyData);
  const dailyDataLen = sortByDate.length;
  const {
    maxBottomTemperature,
    surfaceTemperature,
    satelliteTemperature,
    degreeHeatingDays,
  } = sortByDate[dailyDataLen - 1];

  const surfTemp = surfaceTemperature || satelliteTemperature;

  const featuredReefId = process.env.REACT_APP_FEATURED_REEF_ID || "";

  if (!featuredReefId) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid container item xs={12}>
          <Typography variant="h5" color="textSecondary">
            {`Featured - ${reef.name}`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Card>
              {`${reef.id}` === featuredReefId ? (
                <Grid container item xs={12} spacing={1}>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    style={{ height: "8rem", position: "relative" }}
                  >
                    <CardMedia
                      className={classes.cardImage}
                      image={reefImage}
                    />
                    <Grid item className={classes.exploreButton}>
                      <Link
                        style={{ color: "inherit", textDecoration: "none" }}
                        to={`/reefs/${reef.id}`}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                        >
                          EXPLORE
                        </Button>
                      </Link>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} sm={8}>
                    <Grid item xs={12} style={{ height: "8rem" }}>
                      <Typography
                        style={{
                          padding: "0 0 0.5rem 0.5rem",
                          fontWeight: 400,
                        }}
                        color="textSecondary"
                        variant="subtitle1"
                      >
                        MEAN DAILY SURFACE TEMP. (C&deg;)
                      </Typography>
                      <CardChart
                        dailyData={reef.dailyData}
                        temperatureThreshold={(reef.maxMonthlyMean || 22) + 1}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    alignItems="center"
                    item
                    xs={12}
                    sm={8}
                  >
                    <Grid
                      item
                      xs={4}
                      sm={4}
                      className={classes.metricsContainer}
                    >
                      <Typography variant="caption" color="textSecondary">
                        {`TEMP AT ${reef.depth}M`}
                      </Typography>
                      <Typography
                        className={classes.cardMetrics}
                        variant="h4"
                        color="textSecondary"
                      >
                        {`${formatNumber(maxBottomTemperature, 1)} \u2103`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={4}
                      className={classes.metricsContainer}
                    >
                      <Typography variant="caption" color="textSecondary">
                        SURFACE TEMP
                      </Typography>
                      <Typography
                        className={classes.cardMetrics}
                        variant="h4"
                        color="textSecondary"
                      >
                        {`${formatNumber(surfTemp, 1)} \u2103`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={4}
                      className={classes.metricsContainer}
                    >
                      <Typography variant="caption" color="textSecondary">
                        D. H. WEEKS
                      </Typography>
                      <Typography
                        className={classes.cardMetrics}
                        variant="h4"
                        color="textSecondary"
                      >
                        {formatNumber(
                          degreeHeatingWeeksCalculator(degreeHeatingDays),
                          1
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <div className={classes.loading}>
                  <CircularProgress size="6rem" thickness={1} />
                </div>
              )}
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: "8px",
    },
    loading: {
      height: "100%",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    cardImage: {
      borderRadius: "4px 0 0 4px",
      minHeight: "200px",
    },
    exploreButton: {
      position: "absolute",
      bottom: "16px",
      right: "16px",
    },
    mobileTitle: {
      position: "absolute",
      top: "8px",
      left: "8px",
    },
    cardMetrics: {
      color: theme.palette.primary.main,
      [theme.breakpoints.down("xs")]: {
        textAlign: "center",
      },
    },
    metricsContainer: {
      [theme.breakpoints.down("xs")]: {
        textAlign: "center",
      },
    },
  });

interface selectedReefCardIncomingProps {
  reef: Reef;
}

type SelectedReefCardProps = selectedReefCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SelectedReefCard);
