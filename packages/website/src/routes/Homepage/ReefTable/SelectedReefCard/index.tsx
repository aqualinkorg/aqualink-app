/* eslint-disable no-nested-ternary */
import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
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
import { getReefNameAndRegion } from "../../../../store/Reefs/helpers";
import { Reef } from "../../../../store/Reefs/types";
import Chart from "../../../../common/Chart";
import { reefOnMapSelector } from "../../../../store/Homepage/homepageSlice";
import {
  surveyListSelector,
  surveysRequest,
} from "../../../../store/Survey/surveyListSlice";

const useStyles = makeStyles((theme) => ({
  cardWrapper: {
    height: "20rem",
    [theme.breakpoints.down("md")]: {
      height: "24rem",
    },
  },
  mobileCardWrapperWithImage: {
    [theme.breakpoints.down("xs")]: {
      height: "44rem",
    },
  },
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
    width: "100%",
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(3),
    },

    [theme.breakpoints.up("lg")]: {
      flexDirection: "column",
      alignItems: "start",
    },
  },
  launchIcon: {
    fontSize: 20,
    marginLeft: "0.5rem",
    color: "#2f2f2f",
    "&:hover": {
      color: "#2f2f2f",
    },
  },
  reefName: {
    fontSize: 16,
  },
  reefRegionName: {
    fontSize: 14,
    marginBottom: "0.5rem",
  },
}));

type SelectedReefContentProps = {
  reef: Reef;
  url: string | null;
};

const SelectedReefContent = ({ reef, url }: SelectedReefContentProps) => {
  const classes = useStyles();

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

  const { name, region: regionName } = getReefNameAndRegion(reef);

  return (
    <Grid
      className={
        url
          ? `${classes.cardWrapper} ${classes.mobileCardWrapperWithImage}`
          : `${classes.cardWrapper}`
      }
      container
      justify="space-between"
      spacing={1}
    >
      {url && (
        <Grid item xs={12} sm={5} lg={4}>
          <Box position="relative" height="100%">
            <CardMedia className={classes.cardImage} image={url} />

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
        sm={url ? 7 : 12}
        lg={url ? 6 : 10}
        style={{ marginBottom: "2rem", maxHeight: "14rem" }}
      >
        <Box pb="0.5rem" pl="0.5rem" fontWeight={400}>
          <Typography color="textSecondary" className={classes.reefName}>
            {name}
          </Typography>
          <Typography color="textSecondary" className={classes.reefRegionName}>
            {regionName}
          </Typography>
          <Typography color="textSecondary" variant="caption">
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
        lg={2}
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
  const surveyList = useSelector(surveyListSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (reefOnMap) {
      dispatch(reefRequest(`${reefOnMap.id}`));
      dispatch(surveysRequest(`${reefOnMap.id}`));
    }
  }, [dispatch, reefOnMap]);

  const featuredReefId = process.env.REACT_APP_FEATURED_REEF_ID || "";

  const isFeatured = `${reef?.id}` === featuredReefId;

  const featuredMedia = sortByDate(surveyList, "diveDate", "desc").find(
    (survey) =>
      survey.featuredSurveyMedia && survey.featuredSurveyMedia.type === "image"
  )?.featuredSurveyMedia;

  const hasMedia = Boolean(featuredMedia?.url);

  return featuredReefId || reef?.id ? (
    <Box className={classes.card}>
      {!loading && (
        <Box mb={3}>
          <Typography variant="h5" color="textSecondary">
            {isFeatured ? "Featured Site" : "Selected Site"}
            {!hasMedia && (
              <Link to={`reefs/${reef?.id}`}>
                <LaunchIcon className={classes.launchIcon} />
              </Link>
            )}
          </Typography>
        </Box>
      )}

      <Card>
        {loading ? (
          <Box
            height="23rem"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p={4}
          >
            <CircularProgress size="6rem" thickness={1} />
          </Box>
        ) : reef ? (
          <SelectedReefContent reef={reef} url={featuredMedia?.url} />
        ) : null}
      </Card>
    </Box>
  ) : null;
};

export default SelectedReefCard;
