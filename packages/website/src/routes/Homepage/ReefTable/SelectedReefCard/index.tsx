/* eslint-disable no-nested-ternary */
import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  Hidden,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { sortByDate } from "../../../../helpers/sortDailyData";
import { formatNumber } from "../../../../helpers/numberUtils";

import { degreeHeatingWeeksCalculator } from "../../../../helpers/degreeHeatingWeeks";
import {
  reefDetailsSelector,
  reefLoadingSelector,
  reefRequest,
} from "../../../../store/Reefs/selectedReefSlice";
import { Reef } from "../../../../store/Reefs/types";
import Chart from "../../../../common/Chart";
import { reefOnMapSelector } from "../../../../store/Homepage/homepageSlice";
import {
  surveyListSelector,
  surveysRequest,
} from "../../../../store/Survey/surveyListSlice";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: 40,
    [theme.breakpoints.down("xs")]: {
      padding: 10,
    },
  },
  cardImage: {
    borderRadius: "4px 0 0 4px",
    height: "100%",

    [theme.breakpoints.down("xs")]: {
      height: 300,
    },
  },
  metricsContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    margin: theme.spacing(2),
    width: "100%",

    [theme.breakpoints.up("lg")]: {
      flexDirection: "column",
      alignItems: "start",
    },
  },
}));

type SelectedReefContentProps = { reef: Reef };

const SelectedReefContent = ({ reef }: SelectedReefContentProps) => {
  const classes = useStyles();
  const surveyList = useSelector(surveyListSelector);

  const sortedDailyData = sortByDate(reef.dailyData, "date");
  const dailyDataLen = sortedDailyData.length;
  const {
    maxBottomTemperature,
    surfaceTemperature,
    satelliteTemperature,
    degreeHeatingDays,
  } = sortedDailyData[dailyDataLen - 1];

  const surfTemp = surfaceTemperature || satelliteTemperature;

  const metrics = [
    {
      label: "SURFACE TEMP",
      value: formatNumber(surfTemp, 1),
      unit: " °C",
    },
    {
      label: `TEMP AT ${reef.depth}m`,
      value: formatNumber(maxBottomTemperature, 1),
      unit: " °C",
    },
    {
      label: "HEAT STRESS",
      value: formatNumber(degreeHeatingWeeksCalculator(degreeHeatingDays), 1),
      unit: " DHW",
    },
  ];

  const featuredMedia = sortByDate(surveyList, "diveDate", "desc").find(
    (survey) =>
      survey.featuredSurveyMedia && survey.featuredSurveyMedia.type === "image"
  )?.featuredSurveyMedia;

  return (
    <Grid container spacing={1}>
      {featuredMedia?.url && (
        <Grid item xs={12} sm={4} lg={3}>
          <Box position="relative" height="100%">
            <CardMedia
              className={classes.cardImage}
              image={featuredMedia?.url}
            />
            <Hidden smUp>
              <Box position="absolute" top={16} left={16}>
                <Typography variant="h5">{reef.name}</Typography>

                {reef.region?.name && (
                  <Typography variant="h6" style={{ fontWeight: 400 }}>
                    {reef.region.name}
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
      )}

      <Grid
        item
        xs={12}
        sm={featuredMedia?.url ? 8 : 12}
        lg={featuredMedia?.url ? 6 : 9}
        style={{ marginBottom: "2rem", maxHeight: "14rem" }}
      >
        <Box pb="0.5rem" pl="0.5rem" fontWeight={400}>
          <Typography color="textSecondary" variant="subtitle1">
            MEAN DAILY SURFACE TEMP. (°C)
          </Typography>
        </Box>
        <Chart
          dailyData={reef.dailyData}
          temperatureThreshold={
            reef.maxMonthlyMean ? reef.maxMonthlyMean + 1 : null
          }
          maxMonthlyMean={reef.maxMonthlyMean || null}
        />
      </Grid>

      <Grid
        item
        xs={12}
        lg={3}
        style={{
          display: "flex",
        }}
      >
        <div className={classes.metricsContainer}>
          {metrics.map(({ label, value, unit }) => (
            <div key={label}>
              <Typography variant="caption" color="textSecondary">
                {label}
              </Typography>
              <Typography variant="h4" color="primary">
                {value}
                &nbsp;
                <Typography variant="h6" component="span">
                  {unit}
                </Typography>
              </Typography>
            </div>
          ))}
        </div>
      </Grid>
    </Grid>
  );
};

const SelectedReefCard = () => {
  const classes = useStyles();
  const reef = useSelector(reefDetailsSelector);
  const loading = useSelector(reefLoadingSelector);
  const reefOnMap = useSelector(reefOnMapSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (reefOnMap) {
      dispatch(reefRequest(`${reefOnMap.id}`));
      dispatch(surveysRequest(`${reefOnMap.id}`));
    }
  }, [dispatch, reefOnMap]);

  const featuredReefId = process.env.REACT_APP_FEATURED_REEF_ID || "";

  const isFeatured = `${reef?.id}` === featuredReefId;

  return featuredReefId || reef?.id ? (
    <Box className={classes.card}>
      {!loading && (
        <Box mb={3}>
          <Typography variant="h5" color="textSecondary">
            <Hidden xsDown>
              {isFeatured
                ? reef?.name
                  ? `Featured - ${reef?.name}`
                  : "Featured Reef"
                : reef?.name}
            </Hidden>
            <Hidden smUp>{isFeatured && "Featured Reef"}</Hidden>
          </Typography>
        </Box>
      )}

      <Card>
        {loading ? (
          <Box textAlign="center" p={4}>
            <CircularProgress size="6rem" thickness={1} />
          </Box>
        ) : reef ? (
          <SelectedReefContent reef={reef} />
        ) : null}
      </Card>
    </Box>
  ) : null;
};

export default SelectedReefCard;
