/* eslint-disable no-nested-ternary */
import React from "react";
import { isNumber } from "lodash";
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
  Hidden,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { sortByDate } from "../../../../helpers/sortDailyData";
import { formatNumber } from "../../../../helpers/numberUtils";

import { degreeHeatingWeeksCalculator } from "../../../../helpers/degreeHeatingWeeks";
import {
  siteDetailsSelector,
  siteLoadingSelector,
} from "../../../../store/Sites/selectedSiteSlice";
import { getSiteNameAndRegion } from "../../../../store/Sites/helpers";
import { Site } from "../../../../store/Sites/types";
import Chart from "../../../../common/Chart";
import { surveyListSelector } from "../../../../store/Survey/surveyListSlice";
import Chip from "../../../../common/Chip";
import {
  GaAction,
  GaCategory,
  trackButtonClick,
} from "../../../../utils/google-analytics";
import { standardDailyDataDataset } from "../../../../common/Chart/MultipleSensorsCharts/helpers";

const useStyles = makeStyles((theme) => ({
  cardWrapper: {
    minHeight: "18rem",
    [theme.breakpoints.down("md")]: {
      minHeight: "22rem",
    },
  },
  mobileCardWrapperWithImage: {
    [theme.breakpoints.down("sm")]: {
      height: "42rem",
    },
  },
  mobileCardWrapperWithNoImage: {
    [theme.breakpoints.down("sm")]: {
      height: "27rem",
    },
  },
  card: {
    [theme.breakpoints.down("sm")]: {
      padding: 10,
    },
    padding: 20,
  },
  cardImage: {
    borderRadius: "4px 0 0 4px",
    height: "100%",

    [theme.breakpoints.down("sm")]: {
      height: 300,
    },
  },
  metricsContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(3),
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
  siteRegionName: {
    marginBottom: "0.6rem",
  },
  cardTitleWrapper: {
    maxWidth: "calc(100% - 88px)",
    marginRight: theme.spacing(1),
  },
  cardTitle: {
    width: "100%",
    display: "block",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  cardImageTextWrapper: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    overflowWrap: "break-word",
  },
}));

type SelectedSiteContentProps = {
  site: Site;
  imageUrl?: string | null;
};

const SelectedSiteContent = ({ site, imageUrl }: SelectedSiteContentProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("sm"));
  const sortedDailyData = sortByDate(site.dailyData, "date");
  const dailyDataLen = sortedDailyData.length;
  const { maxBottomTemperature, satelliteTemperature, degreeHeatingDays } =
    (dailyDataLen && sortedDailyData[dailyDataLen - 1]) || {};

  const metrics = [
    {
      label: "SURFACE TEMP",
      value: formatNumber(satelliteTemperature, 1),
      unit: " °C",
      display: isNumber(satelliteTemperature),
    },
    {
      label: "HEAT STRESS",
      value: formatNumber(degreeHeatingWeeksCalculator(degreeHeatingDays), 1),
      unit: " DHW",
      display: isNumber(degreeHeatingDays),
    },
    {
      label: `TEMP AT ${site.depth}m`,
      value: formatNumber(maxBottomTemperature, 1),
      unit: " °C",
      display: isNumber(maxBottomTemperature),
    },
  ];

  const { name, region: regionName } = getSiteNameAndRegion(site);
  const chartDataset = standardDailyDataDataset(
    site.dailyData,
    site.maxMonthlyMean,
    false,
    site.timezone
  );

  const ChartComponent = (
    <Chart
      siteId={site.id}
      datasets={[chartDataset]}
      surveys={[]}
      temperatureThreshold={
        site.maxMonthlyMean ? site.maxMonthlyMean + 1 : null
      }
      maxMonthlyMean={site.maxMonthlyMean || null}
      background
    />
  );

  const onExploreButtonClick = () => {
    trackButtonClick(
      GaCategory.BUTTON_CLICK,
      GaAction.MAP_PAGE_BUTTON_CLICK,
      "Explore"
    );
  };

  return (
    <Grid
      className={
        imageUrl
          ? `${classes.cardWrapper} ${classes.mobileCardWrapperWithImage}`
          : `${classes.cardWrapper} ${classes.mobileCardWrapperWithNoImage}`
      }
      container
      justify="space-between"
      spacing={1}
    >
      {imageUrl && (
        <Grid item xs={12} md={6} lg={4}>
          <Box position="relative" height="100%">
            <Link to={`/sites/${site.id}`}>
              <CardMedia className={classes.cardImage} image={imageUrl} />
            </Link>

            <Hidden mdUp>
              <Box
                bgcolor="rgba(3, 48, 66, 0.75)"
                height="55%"
                width="100%"
                position="absolute"
                top={0}
                left={0}
              >
                <Box className={classes.cardImageTextWrapper}>
                  <Typography variant="h5">{name}</Typography>

                  {regionName && (
                    <Typography variant="h6" style={{ fontWeight: 400 }}>
                      {regionName}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Hidden>

            <Box position="absolute" bottom={16} px={2} width="100%">
              <Grid
                container
                alignItems="center"
                justify={
                  site.videoStream && isTablet ? "space-between" : "flex-end"
                }
              >
                {site.videoStream && isTablet && (
                  <Chip
                    live
                    liveText="LIVE VIDEO"
                    to={`/sites/${site.id}`}
                    width={80}
                  />
                )}
                <Grid item>
                  <Link
                    style={{ color: "inherit", textDecoration: "none" }}
                    to={`/sites/${site.id}`}
                  >
                    <Button
                      onClick={onExploreButtonClick}
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      EXPLORE
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      )}

      <Grid
        item
        xs={12}
        md={imageUrl ? 6 : 12}
        lg={imageUrl ? 6 : 10}
        style={{ marginBottom: "2rem", maxHeight: "14rem" }}
      >
        <Box pb="0.5rem" pl="0.5rem" pt="1.5rem" fontWeight={400}>
          <Hidden smDown={Boolean(imageUrl)}>
            <Grid container alignItems="center">
              <Grid item className={classes.cardTitleWrapper}>
                <Typography
                  className={classes.cardTitle}
                  color="textSecondary"
                  variant="h5"
                >
                  <span title={name || ""}>{name}</span>
                </Typography>
              </Grid>
              {site.videoStream && (
                <Chip
                  live
                  liveText="LIVE VIDEO"
                  to={`/sites/${site.id}`}
                  width={80}
                />
              )}
            </Grid>
            <Typography
              color="textSecondary"
              variant="h6"
              className={`${classes.cardTitle} ${classes.siteRegionName}`}
            >
              <span title={regionName || ""}>{regionName}</span>
            </Typography>
          </Hidden>
          <Typography color="textSecondary" variant="caption">
            DAILY SURFACE TEMP. (°C)
          </Typography>
        </Box>
        <Hidden smDown>
          <div>{ChartComponent}</div>
        </Hidden>
        <Hidden mdUp>{ChartComponent}</Hidden>
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
          {metrics.map(({ label, value, unit, display }) => (
            <div key={label}>
              {display && (
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      </Grid>
    </Grid>
  );
};

SelectedSiteContent.defaultProps = {
  imageUrl: null,
};

const featuredSiteId = process.env.REACT_APP_FEATURED_SITE_ID || "";

const SelectedSiteCard = () => {
  const classes = useStyles();
  const site = useSelector(siteDetailsSelector);
  const loading = useSelector(siteLoadingSelector);
  const surveyList = useSelector(surveyListSelector);

  const isFeatured = `${site?.id}` === featuredSiteId;

  const { featuredSurveyMedia } =
    sortByDate(surveyList, "diveDate", "desc").find(
      (survey) =>
        survey.featuredSurveyMedia &&
        survey.featuredSurveyMedia.type === "image"
    ) || {};

  const hasMedia = Boolean(featuredSurveyMedia?.url);

  return (
    <Box className={classes.card}>
      {!loading && (
        <Box mb={2}>
          <Typography variant="h5" color="textSecondary">
            {isFeatured ? "Featured Site" : "Selected Site"}
            {!hasMedia && (
              <Link to={`sites/${site?.id}`}>
                <LaunchIcon className={classes.launchIcon} />
              </Link>
            )}
          </Typography>
        </Box>
      )}

      <Card>
        {loading ? (
          <Box
            height="20rem"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p={4}
          >
            <CircularProgress size="3rem" thickness={1} />
          </Box>
        ) : site ? (
          <SelectedSiteContent
            site={site}
            imageUrl={featuredSurveyMedia?.url}
          />
        ) : null}
      </Card>
    </Box>
  );
};

export default SelectedSiteCard;
