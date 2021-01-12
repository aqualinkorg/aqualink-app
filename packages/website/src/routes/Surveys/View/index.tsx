import React, { useEffect, useState, useCallback, ChangeEvent } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";
import {
  Box,
  Button,
  Container,
  createStyles,
  Grid,
  Paper,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { useDispatch, useSelector } from "react-redux";

import {
  surveyDetailsSelector,
  surveyGetRequest,
  clearSurvey,
} from "../../../store/Survey/surveySlice";
import SurveyDetails from "./SurveyDetails";
import SurveyMediaDetails from "./SurveyMediaDetails";
import CombinedCharts from "../../../common/Chart/CombinedCharts";
import type { Range, Reef } from "../../../store/Reefs/types";
import {
  surveyListSelector,
  surveysRequest,
} from "../../../store/Survey/surveyListSlice";
import { useBodyLength } from "../../../helpers/useBodyLength";
import {
  reefSpotterDataSelector,
  reefSpotterDataRequest,
  reefLiveDataSelector,
} from "../../../store/Reefs/selectedReefSlice";
import {
  subtractFromDate,
  findChartPeriod,
  findMaxDate,
  convertToLocalTime,
  convertDailyDataToLocalTime,
  convertSurveysToLocalTime,
} from "../../../helpers/dates";

const SurveyViewPage = ({ reef, surveyId, classes }: SurveyViewPageProps) => {
  const dispatch = useDispatch();
  const surveyList = useSelector(surveyListSelector);
  const surveyDetails = useSelector(surveyDetailsSelector);
  const spotterData = useSelector(reefSpotterDataSelector);
  const liveData = useSelector(reefLiveDataSelector);
  const hasSpotter = Boolean(liveData?.surfaceTemperature);

  const [range, setRange] = useState<Range>("week");
  const [endDate, setEndDate] = useState<string>();
  const [pickerDate, setPickerDate] = useState<string | null>(null);

  const bodyLength = useBodyLength();
  const startDate = endDate ? subtractFromDate(endDate, range) : undefined;

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

  useEffect(() => {
    if (surveyDetails?.diveDate && hasSpotter) {
      const toDate = new Date(surveyDetails.diveDate).toISOString();
      setPickerDate(toDate);
    }
  }, [hasSpotter, surveyDetails]);

  useEffect(() => {
    if (hasSpotter && pickerDate) {
      dispatch(
        reefSpotterDataRequest({
          id: `${reef.id}`,
          startDate: subtractFromDate(pickerDate, range),
          endDate: pickerDate,
        })
      );
    }
  }, [dispatch, hasSpotter, pickerDate, range, reef.id]);

  useEffect(() => {
    if (reef.dailyData && spotterData && pickerDate) {
      const maxDataDate = new Date(findMaxDate(reef.dailyData, spotterData));
      if (maxDataDate.getTime() > new Date(pickerDate).getTime()) {
        setEndDate(pickerDate);
      } else {
        setEndDate(maxDataDate.toISOString());
      }
    }
  }, [pickerDate, reef.dailyData, spotterData]);

  const onRangeChange = useCallback(
    (event: ChangeEvent<{ value: unknown }>) => {
      setRange(event.target.value as Range);
    },
    []
  );

  const onDateChange = useCallback(
    (date: MaterialUiPickersDate, value?: string | null) => {
      if (value) {
        setPickerDate(new Date(value).toISOString());
      }
    },
    []
  );

  return (
    <Container>
      <Grid
        style={{ position: "relative" }}
        container
        justify="center"
        item
        xs={12}
      >
        <Box
          bgcolor="#f5f6f6"
          position="absolute"
          height="100%"
          width={bodyLength}
          zIndex="-1"
        />
        <Grid
          style={{ margin: "4rem 0 1rem 0" }}
          container
          alignItems="center"
          item
          xs={11}
        >
          <Button
            color="primary"
            startIcon={<ArrowBack />}
            component={Link}
            to={`/reefs/${reef.id}`}
          >
            <Typography style={{ textTransform: "none" }}>
              Back to site
            </Typography>
          </Button>
        </Grid>
        <Grid style={{ marginBottom: "6rem" }} item xs={11}>
          <Paper
            elevation={3}
            className={
              hasSpotter
                ? `${classes.surveyDetailsCard} ${classes.withSpotter}`
                : `${classes.surveyDetailsCard} ${classes.noSpotter}`
            }
          >
            <Grid
              style={{ height: "100%" }}
              container
              justify="space-between"
              item
              xs={12}
            >
              <Grid container justify="center" item md={12}>
                <Grid container item xs={11}>
                  <SurveyDetails reef={reef} survey={surveyDetails} />
                </Grid>
                <Grid container justify="center" item xs={12}>
                  <Grid item xs={11}>
                    <CombinedCharts
                      reefId={reef.id}
                      dailyData={convertDailyDataToLocalTime(
                        reef.dailyData,
                        reef.timezone
                      )}
                      depth={reef.depth}
                      hasSpotterData={hasSpotter}
                      maxMonthlyMean={reef.maxMonthlyMean || null}
                      temperatureThreshold={
                        reef.maxMonthlyMean ? reef.maxMonthlyMean + 1 : null
                      }
                      onDateChange={onDateChange}
                      onRangeChange={onRangeChange}
                      pickerDate={pickerDate}
                      range={range}
                      surveys={convertSurveysToLocalTime(
                        surveyList,
                        reef.timezone
                      )}
                      chartPeriod={findChartPeriod(range)}
                      spotterData={spotterData}
                      startDate={
                        convertToLocalTime(startDate, reef.timezone) ||
                        startDate
                      }
                      endDate={
                        convertToLocalTime(endDate, reef.timezone) || endDate
                      }
                      timeZone={reef.timezone}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid container justify="center" item xs={12}>
        <Grid container item xs={11}>
          <Grid style={{ margin: "5rem 0 5rem 0" }} item>
            <Typography style={{ fontSize: 18 }}>
              {`${moment(surveyDetails?.diveDate).format(
                "MM/DD/YYYY"
              )} Survey Media`}
            </Typography>
          </Grid>
          <Grid style={{ width: "100%" }} item>
            <SurveyMediaDetails
              reefId={reef.id}
              surveyId={surveyId}
              surveyMedia={surveyDetails?.surveyMedia}
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    surveyDetailsCard: {
      width: "100%",
      color: theme.palette.text.secondary,
    },
    noSpotter: {
      height: "45rem",
      [theme.breakpoints.down("md")]: {
        height: "55rem",
      },
      [theme.breakpoints.down("sm")]: {
        height: "65rem",
      },
      [theme.breakpoints.down("xs")]: {
        height: "75rem",
      },
    },
    withSpotter: {
      height: "65rem",
      [theme.breakpoints.down("md")]: {
        height: "78rem",
      },
      [theme.breakpoints.down("sm")]: {
        height: "86rem",
      },
      [theme.breakpoints.down("xs")]: {
        height: "105rem",
      },
    },
  });

interface SurveyViewPageIncomingProps {
  reef: Reef;
  surveyId: string;
}

type SurveyViewPageProps = SurveyViewPageIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyViewPage);
