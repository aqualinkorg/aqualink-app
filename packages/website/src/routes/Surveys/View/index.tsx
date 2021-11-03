import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";
import {
  Box,
  Button,
  Container,
  createStyles,
  Grid,
  LinearProgress,
  Paper,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import {
  surveyDetailsSelector,
  surveyGetRequest,
  clearSurvey,
  surveyLoadingSelector,
} from "../../../store/Survey/surveySlice";
import SurveyDetails from "./SurveyDetails";
import SurveyMediaDetails from "./MediaDetails";
import ChartWithTooltip from "../../../common/Chart/ChartWithTooltip";
import type { Site } from "../../../store/Sites/types";
import {
  surveyListLoadingSelector,
  surveyListSelector,
  surveysRequest,
} from "../../../store/Survey/surveyListSlice";
import { siteTimeSeriesDataRequest } from "../../../store/Sites/selectedSiteSlice";
import {
  displayTimeInLocalTimezone,
  convertDailyDataToLocalTime,
  convertSurveyDataToLocalTime,
  isBetween,
} from "../../../helpers/dates";

const SurveyViewPage = ({ site, surveyId, classes }: SurveyViewPageProps) => {
  const dispatch = useDispatch();
  const surveyList = useSelector(surveyListSelector);
  const surveyDetails = useSelector(surveyDetailsSelector);
  const surveyLoading = useSelector(surveyLoadingSelector);
  const surveyListLoading = useSelector(surveyListLoadingSelector);
  const loading = surveyLoading || surveyListLoading;

  const pointId = surveyDetails?.surveyMedia?.find((item) => item.featured)
    ?.surveyPoint?.id;

  const dailyDataLen = site.dailyData.length;
  const showChart =
    dailyDataLen > 0 && surveyList.length > 0 && surveyDetails?.diveDate
      ? isBetween(
          surveyDetails.diveDate,
          site.dailyData[dailyDataLen - 1].date,
          site.dailyData[0].date
        )
      : false;

  useEffect(() => {
    dispatch(surveysRequest(`${site.id}`));
    window.scrollTo({ top: 0 });
  }, [dispatch, site.id]);

  useEffect(() => {
    dispatch(
      surveyGetRequest({
        siteId: `${site.id}`,
        surveyId,
      })
    );
    return () => {
      dispatch(clearSurvey());
    };
  }, [dispatch, site.id, surveyId]);

  // Fetch HOBO and Spotter data near the dive date
  useEffect(() => {
    if (surveyDetails?.diveDate && pointId) {
      const start = moment(surveyDetails.diveDate).startOf("day").toISOString();
      const end = moment(surveyDetails.diveDate).endOf("day").toISOString();
      dispatch(
        siteTimeSeriesDataRequest({
          siteId: `${site.id}`,
          pointId: `${pointId}`,
          start,
          end,
          metrics: ["bottom_temperature", "top_temperature"],
          hourly: false,
        })
      );
    }
  }, [dispatch, pointId, site.id, surveyDetails]);

  if (loading) {
    return <LinearProgress className={classes.loading} />;
  }

  return (
    <>
      <Box bgcolor="#f5f6f6">
        <Container className={classes.infoWrapper}>
          <Button
            className={classes.backButton}
            color="primary"
            startIcon={<ArrowBack />}
            component={Link}
            to={`/sites/${site.id}`}
          >
            <Typography style={{ textTransform: "none" }}>
              Back to site
            </Typography>
          </Button>
          <Paper elevation={3} className={classes.surveyDetailsCard}>
            <Grid container justify="space-between" item xs={12}>
              <Grid container justify="center" item md={12}>
                <Grid container item xs={12}>
                  <SurveyDetails site={site} survey={surveyDetails} />
                </Grid>
                {showChart && (
                  <Grid
                    className={classes.chartWrapper}
                    container
                    justify="center"
                    item
                    xs={12}
                  >
                    <Grid item xs={12}>
                      <Box position="relative" mb="8px" left="3%">
                        <Typography
                          className={classes.chartTitle}
                          variant="h6"
                          color="textSecondary"
                        >
                          DAILY WATER TEMPERATURE (°C)
                        </Typography>
                      </Box>
                      <ChartWithTooltip
                        className={classes.chart}
                        siteId={site.id}
                        dailyData={convertDailyDataToLocalTime(
                          site.dailyData,
                          site.timezone
                        )}
                        depth={site.depth}
                        maxMonthlyMean={site.maxMonthlyMean || null}
                        temperatureThreshold={
                          site.maxMonthlyMean ? site.maxMonthlyMean + 1 : null
                        }
                        surveys={convertSurveyDataToLocalTime(
                          surveyList,
                          site.timezone
                        )}
                        background
                        timeZone={site.timezone}
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
      <Box>
        <Container className={classes.mediaWrapper}>
          <Grid container justify="center" item xs={12}>
            <Grid container item xs={11}>
              <Grid item>
                <Typography className={classes.mediaTitle}>
                  {`${displayTimeInLocalTimezone({
                    isoDate: surveyDetails?.diveDate,
                    format: "MM/DD/YYYY",
                    displayTimezone: false,
                    timeZone: site.timezone,
                  })} Survey Media`}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <SurveyMediaDetails
                  siteId={site.id}
                  surveyMedia={surveyDetails?.surveyMedia}
                />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    loading: {
      marginBottom: "100vh",
    },
    infoWrapper: {
      marginTop: 64,
      marginBottom: 96,
    },
    mediaWrapper: {
      marginTop: 80,
    },
    backButton: {
      marginBottom: 16,
    },
    surveyDetailsCard: {
      padding: 32,
      color: theme.palette.text.secondary,
    },
    chartWrapper: {
      marginTop: 32,
    },
    chartTitle: {
      [theme.breakpoints.down("xs")]: {
        fontSize: 14,
      },
    },
    chart: {
      height: 250,
    },
    mediaTitle: {
      fontSize: 18,
      marginBottom: 80,
    },
  });

interface SurveyViewPageIncomingProps {
  site: Site;
  surveyId: string;
}

type SurveyViewPageProps = SurveyViewPageIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyViewPage);
