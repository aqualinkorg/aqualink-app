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
import SurveyMediaDetails from "./SurveyMediaDetails";
import ChartWithTooltip from "../../../common/Chart/ChartWithTooltip";
import type { Reef } from "../../../store/Reefs/types";
import {
  surveyListLoadingSelector,
  surveyListSelector,
  surveysRequest,
} from "../../../store/Survey/surveyListSlice";
import { reefTimeSeriesDataRequest } from "../../../store/Reefs/selectedReefSlice";
import {
  displayTimeInLocalTimezone,
  convertDailyDataToLocalTime,
  convertSurveyDataToLocalTime,
  isBetween,
} from "../../../helpers/dates";

const SurveyViewPage = ({ reef, surveyId, classes }: SurveyViewPageProps) => {
  const dispatch = useDispatch();
  const surveyList = useSelector(surveyListSelector);
  const surveyDetails = useSelector(surveyDetailsSelector);
  const surveyLoading = useSelector(surveyLoadingSelector);
  const surveyListLoading = useSelector(surveyListLoadingSelector);
  const loading = surveyLoading || surveyListLoading;

  const pointId = surveyDetails?.surveyMedia?.find((item) => item.featured)
    ?.poiId?.id;

  const dailyDataLen = reef.dailyData.length;
  const showChart =
    dailyDataLen > 0 && surveyList.length > 0 && surveyDetails?.diveDate
      ? isBetween(
          surveyDetails.diveDate,
          reef.dailyData[dailyDataLen - 1].date,
          reef.dailyData[0].date
        )
      : false;

  useEffect(() => {
    dispatch(surveysRequest(`${reef.id}`));
    window.scrollTo({ top: 0 });
  }, [dispatch, reef.id]);

  useEffect(() => {
    dispatch(
      surveyGetRequest({
        reefId: `${reef.id}`,
        surveyId,
      })
    );
    return () => {
      dispatch(clearSurvey());
    };
  }, [dispatch, reef.id, surveyId]);

  // Fetch HOBO and Spotter data near the dive date
  useEffect(() => {
    if (surveyDetails?.diveDate && pointId) {
      const start = moment(surveyDetails.diveDate).startOf("day").toISOString();
      const end = moment(surveyDetails.diveDate).endOf("day").toISOString();
      dispatch(
        reefTimeSeriesDataRequest({
          reefId: `${reef.id}`,
          pointId: `${pointId}`,
          start,
          end,
          metrics: ["bottom_temperature", "surface_temperature"],
          hourly: false,
        })
      );
    }
  }, [dispatch, pointId, reef.id, surveyDetails]);

  return loading ? (
    <LinearProgress className={classes.loading} />
  ) : (
    <>
      <Box bgcolor="#f5f6f6">
        <Container className={classes.infoWrapper}>
          <Button
            className={classes.backButton}
            color="primary"
            startIcon={<ArrowBack />}
            component={Link}
            to={`/reefs/${reef.id}`}
          >
            <Typography style={{ textTransform: "none" }}>
              Back to site
            </Typography>
          </Button>
          <Paper elevation={3} className={classes.surveyDetailsCard}>
            <Grid container justify="space-between" item xs={12}>
              <Grid container justify="center" item md={12}>
                <Grid container item xs={12}>
                  <SurveyDetails reef={reef} survey={surveyDetails} />
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
                        reefId={reef.id}
                        dailyData={convertDailyDataToLocalTime(
                          reef.dailyData,
                          reef.timezone
                        )}
                        depth={reef.depth}
                        maxMonthlyMean={reef.maxMonthlyMean || null}
                        temperatureThreshold={
                          reef.maxMonthlyMean ? reef.maxMonthlyMean + 1 : null
                        }
                        surveys={convertSurveyDataToLocalTime(
                          surveyList,
                          reef.timezone
                        )}
                        background
                        timeZone={reef.timezone}
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
                    timeZone: reef.timezone,
                  })} Survey Media`}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <SurveyMediaDetails
                  reefId={reef.id}
                  surveyId={surveyId}
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
  reef: Reef;
  surveyId: string;
}

type SurveyViewPageProps = SurveyViewPageIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyViewPage);
