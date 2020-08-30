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
  Box,
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

  const metrics = [
    {
      label: `TEMP AT ${reef.depth}M`,
      value: `${formatNumber(maxBottomTemperature, 1)} \u2103`,
    },
    {
      label: "SURFACE TEMP",
      value: `${formatNumber(surfTemp, 1)} \u2103`,
    },
    {
      label: "HEAT STRESS",
      value: `${formatNumber(
        degreeHeatingWeeksCalculator(degreeHeatingDays),
        1
      )} DHW`,
    },
  ];

  return (
    <Box p={1}>
      <Box mb={2}>
        <Typography variant="h5" color="textSecondary">
          <Hidden xsDown>{`Featured - ${reef.name}`}</Hidden>
          <Hidden smUp>Featured Reef</Hidden>
        </Typography>
      </Box>

      <Card>
        {`${reef.id}` === featuredReefId ? (
          <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
              <Box position="relative" height="100%">
                <CardMedia className={classes.cardImage} image={reefImage} />

                <Hidden smUp>
                  <Box position="absolute" top={16} left={16}>
                    <Typography variant="h5">{reef.name}</Typography>

                    {reef.region && (
                      <Typography variant="h6" style={{ fontWeight: 400 }}>
                        {reef.region}
                      </Typography>
                    )}
                  </Box>
                </Hidden>

                <Box position="absolute" bottom={16} right={16}>
                  <Link
                    style={{ color: "inherit", textDecoration: "none" }}
                    to={`/reefs/${reef.id}`}
                  >
                    <Button size="small" variant="contained" color="primary">
                      EXPLORE
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={8} style={{ maxHeight: "14rem" }}>
              <Box pb="0.5rem" pl="0.5rem" fontWeight={400}>
                <Typography color="textSecondary" variant="subtitle1">
                  MEAN DAILY SURFACE TEMP. (C&deg;)
                </Typography>
              </Box>
              <CardChart
                dailyData={reef.dailyData}
                temperatureThreshold={(reef.maxMonthlyMean || 22) + 1}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-around" my={1}>
                {metrics.map(({ label, value }) => (
                  <div key={label}>
                    <Typography variant="caption" color="textSecondary">
                      {label}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {value}
                    </Typography>
                  </div>
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box textAlign="center" p={4}>
            <CircularProgress size="6rem" thickness={1} />
          </Box>
        )}
      </Card>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    cardImage: {
      borderRadius: "4px 0 0 4px",
      height: "100%",

      [theme.breakpoints.down("sm")]: {
        height: 300,
      },
    },
  });

interface selectedReefCardIncomingProps {
  reef: Reef;
}

type SelectedReefCardProps = selectedReefCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SelectedReefCard);
