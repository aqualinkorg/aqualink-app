import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

import ChartWithTooltip from "../../../../common/Chart/ChartWithTooltip";
import TempAnalysis from "./TempAnalysis";
import DatePicker from "../../../../common/Datepicker";
import {
  reefSpotterDataRequest,
  reefSpotterDataSelector,
  reefSpotterDataLoadingSelector,
} from "../../../../store/Reefs/selectedReefSlice";
import { Reef } from "../../../../store/Reefs/types";
import {
  setTimeZone,
  subtractFromDate,
  convertDailyDataToLocalTime,
  convertSpotterDataToLocalTime,
} from "../../../../helpers/dates";

const Chart = ({ reef, classes }: ChartProps) => {
  const dispatch = useDispatch();
  const spotterData = useSelector(reefSpotterDataSelector);
  const hasSpotterData = Boolean(reef.liveData.surfaceTemperature);
  const [pickerEndDate, setPickerEndDate] = useState<string>(
    new Date(moment().format("MM/DD/YYYY")).toISOString()
  );
  const [pickerStartDate, setPickerStartDate] = useState<string>(
    subtractFromDate(
      new Date(moment().format("MM/DD/YYYY")).toISOString(),
      "week"
    )
  );

  const isSpotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const hasSpotterDataSuccess =
    !isSpotterDataLoading &&
    spotterData &&
    spotterData.bottomTemperature.length > 1;
  const hasSpotterDataErrored = !isSpotterDataLoading && !hasSpotterDataSuccess;

  // Get spotter data
  useEffect(() => {
    const reefLocalStartDate = setTimeZone(
      new Date(pickerStartDate),
      reef.timezone
    ) as string;

    const reefLocalEndDate = setTimeZone(
      new Date(pickerEndDate),
      reef.timezone
    ) as string;

    if (hasSpotterData) {
      dispatch(
        reefSpotterDataRequest({
          id: `${reef.id}`,
          startDate: reefLocalStartDate,
          endDate: reefLocalEndDate,
        })
      );
    }
  }, [
    dispatch,
    hasSpotterData,
    pickerEndDate,
    pickerStartDate,
    reef.id,
    reef.timezone,
  ]);

  return (
    <Container>
      {hasSpotterData && (
        <Grid className={classes.chartWrapper} container item spacing={2}>
          <Grid item xs={12} md={9}>
            <Box ml="50px">
              <Typography variant="h6" color="textSecondary">
                TEMPERATURE
              </Typography>
            </Box>
            {isSpotterDataLoading && (
              <Box
                height="240px"
                mt="32px"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <CircularProgress size="120px" thickness={1} />
              </Box>
            )}
            {hasSpotterDataSuccess && (
              <Box>
                <ChartWithTooltip
                  className={classes.chart}
                  reefId={reef.id}
                  depth={reef.depth}
                  dailyData={convertDailyDataToLocalTime(
                    reef.dailyData,
                    reef.timezone
                  )}
                  spotterData={convertSpotterDataToLocalTime(
                    spotterData || {
                      bottomTemperature: [],
                      surfaceTemperature: [],
                    },
                    reef.timezone
                  )}
                  surveys={[]}
                  temperatureThreshold={null}
                  maxMonthlyMean={null}
                  background
                  chartPeriod={
                    spotterData && spotterData.bottomTemperature.length > 0
                      ? "day"
                      : "week"
                  }
                  timeZone={reef.timezone}
                />
              </Box>
            )}
            {hasSpotterDataErrored && (
              <Box height="240px" mt="32px">
                <Typography>
                  No Smart Buoy data available in this time range.
                </Typography>
              </Box>
            )}
            <Grid container justify="center">
              <Grid item xs={11} container justify="space-between" spacing={1}>
                <Grid item>
                  <DatePicker
                    value={pickerStartDate}
                    dateName="START DATE"
                    nameVariant="subtitle1"
                    pickerSize="small"
                    maxDate={new Date(pickerEndDate)}
                    onChange={(date) =>
                      setPickerStartDate(
                        new Date(
                          moment(date).format("MM/DD/YYYY")
                        ).toISOString()
                      )
                    }
                  />
                </Grid>
                <Grid item>
                  <DatePicker
                    value={pickerEndDate}
                    dateName="END DATE"
                    nameVariant="subtitle1"
                    pickerSize="small"
                    onChange={(date) =>
                      setPickerEndDate(
                        new Date(
                          moment(date).format("MM/DD/YYYY")
                        ).toISOString()
                      )
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={3}>
            <Grid container justify="center">
              <Grid item xs={12} sm={5} md={12}>
                <TempAnalysis />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

const styles = () =>
  createStyles({
    chartWrapper: {
      marginBottom: 50,
    },
    chart: {
      height: 300,
      marginBottom: "3rem",
      marginTop: "1rem",
    },
  });

interface ChartIncomingProps {
  reef: Reef;
}

type ChartProps = ChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Chart);
