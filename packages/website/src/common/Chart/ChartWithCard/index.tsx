import React, { useEffect, useState } from "react";
import {
  Container,
  createStyles,
  Grid,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import moment from "moment";
import { isNaN } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import Chart from "./Chart";
import TempAnalysis from "./TempAnalysis";
import {
  reefGranularDailyDataSelector,
  reefTimeSeriesDataRangeSelector,
  reefTimeSeriesDataRequest,
  reefTimeSeriesDataSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { Reef } from "../../../store/Reefs/types";
import {
  findMarginalDate,
  generateMonthlyMaxTimestamps,
  isBefore,
  setTimeZone,
  subtractFromDate,
} from "../../../helpers/dates";
import {
  filterDailyData,
  filterMaxMonthlyData,
  filterSofarData,
  filterTimeSeriesData,
} from "../utils";
import { RangeValue } from "./types";
import ViewRange from "./ViewRange";
import DownloadCSVButton from "./DownloadCSVButton";

const ChartWithCard = ({
  reef,
  pointId,
  surveysFiltered,
  title,
  classes,
}: ChartWithCardProps) => {
  const dispatch = useDispatch();
  const granularDailyData = useSelector(reefGranularDailyDataSelector);
  const { hobo: hoboData, spotter: spotterData } =
    useSelector(reefTimeSeriesDataSelector) || {};
  const { bottomTemperature: hoboBottomTemperature } = hoboData || {};
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefTimeSeriesDataRangeSelector)?.hobo || {};
  const hasSpotterData = Boolean(reef.liveData.surfaceTemperature);
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pastLimit, setPastLimit] = useState<string>(moment().toISOString());
  const [futureLimit, setFutureLimit] = useState<string>(
    moment(0).toISOString()
  );
  const [pickerErrored, setPickerErrored] = useState(false);
  const [range, setRange] = useState<RangeValue>("three_months");

  const today = new Date(moment().format("MM/DD/YYYY")).toISOString();

  // Set pickers initial values once the range request is completed
  useEffect(() => {
    if (hoboBottomTemperatureRange) {
      const { maxDate } = hoboBottomTemperatureRange?.[0] || {};
      const localizedMaxDate = new Date(
        moment(maxDate)
          .tz(reef.timezone || "UTC")
          .format("MM/DD/YYYY")
      ).toISOString();
      const pastThreeMonths = subtractFromDate(localizedMaxDate, "month", 3);
      setPickerEndDate(localizedMaxDate);
      setPickerStartDate(pastThreeMonths);
    }
  }, [hoboBottomTemperatureRange, reef.timezone]);

  // Get time series data and set past/future limits.
  // Only make requests if any of pickerStartDate and pickerEndDate
  // is not inside the [pastLimit, futureLimit] interval.
  useEffect(() => {
    if (
      pastLimit &&
      futureLimit &&
      pickerStartDate &&
      pickerEndDate &&
      isBefore(pickerStartDate, pickerEndDate) &&
      (moment(pickerStartDate).isBefore(moment(pastLimit)) ||
        moment(pickerEndDate).isAfter(moment(futureLimit)))
    ) {
      const reefLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        reef.timezone
      );

      const reefLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        reef.timezone
      );

      setPastLimit(pickerStartDate);
      setFutureLimit(pickerEndDate);
      dispatch(
        reefTimeSeriesDataRequest({
          reefId: `${reef.id}`,
          pointId,
          start: reefLocalStartDate,
          end: reefLocalEndDate,
          metrics: ["bottom_temperature", "surface_temperature"],
          hourly: true,
        })
      );
    }
  }, [
    dispatch,
    futureLimit,
    pastLimit,
    pickerEndDate,
    pickerStartDate,
    pointId,
    reef.id,
    reef.timezone,
  ]);

  // Set chart start/end dates based on data received
  useEffect(() => {
    const maxMonthlyData = generateMonthlyMaxTimestamps(
      reef.monthlyMax,
      pickerStartDate,
      pickerEndDate
    );
    const filteredMaxMonthlyData = filterMaxMonthlyData(
      maxMonthlyData,
      pickerStartDate,
      pickerEndDate
    );
    const filteredDailyData = filterDailyData(
      granularDailyData || [],
      pickerStartDate,
      pickerEndDate
    );
    const filteredHoboData = filterSofarData(
      hoboBottomTemperature || [],
      pickerStartDate,
      pickerEndDate
    );
    const filteredSpotterData = filterTimeSeriesData(
      spotterData,
      pickerStartDate,
      pickerEndDate
    );
    if (
      filteredMaxMonthlyData?.[0] ||
      filteredDailyData?.[0] ||
      filteredSpotterData?.bottomTemperature?.[0] ||
      filteredSpotterData?.surfaceTemperature?.[0] ||
      filteredHoboData?.[0]
    ) {
      const maxDataDate = new Date(
        findMarginalDate(
          filteredMaxMonthlyData,
          filteredDailyData,
          filteredSpotterData,
          filteredHoboData
        )
      ).toISOString();
      const minDataDate = new Date(
        findMarginalDate(
          filteredMaxMonthlyData,
          filteredDailyData,
          filteredSpotterData,
          filteredHoboData,
          "min"
        )
      ).toISOString();
      const reefLocalEndDate = new Date(
        setTimeZone(
          new Date(moment(pickerEndDate).format("MM/DD/YYYY")),
          reef?.timezone
        )
      ).toISOString();
      const reefLocalStartDate = new Date(
        setTimeZone(
          new Date(moment(pickerStartDate).format("MM/DD/YYYY")),
          reef?.timezone
        )
      ).toISOString();

      if (moment(maxDataDate).isAfter(moment(reefLocalEndDate))) {
        setEndDate(reefLocalEndDate);
      } else {
        setEndDate(maxDataDate);
      }

      if (moment(minDataDate).isAfter(moment(reefLocalStartDate))) {
        setStartDate(minDataDate);
      } else {
        setStartDate(reefLocalStartDate);
      }
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [
    granularDailyData,
    hoboBottomTemperature,
    pickerEndDate,
    pickerStartDate,
    reef,
    spotterData,
  ]);

  // Set picker error
  useEffect(() => {
    if (pickerStartDate && pickerEndDate) {
      setPickerErrored(!isBefore(pickerStartDate, pickerEndDate));
    }
  }, [pickerEndDate, pickerStartDate]);

  const onRangeChange = (value: RangeValue) => {
    const { minDate, maxDate } = hoboBottomTemperatureRange?.[0] || {};
    const localizedMinDate = new Date(
      moment(minDate)
        .tz(reef.timezone || "UTC")
        .format("MM/DD/YYYY")
    ).toISOString();
    const localizedMaxDate = new Date(
      moment(maxDate)
        .tz(reef.timezone || "UTC")
        .format("MM/DD/YYYY")
    ).toISOString();
    setRange(value);
    switch (value) {
      case "three_months":
        setPickerEndDate(localizedMaxDate);
        setPickerStartDate(subtractFromDate(localizedMaxDate, "month", 3));
        break;
      case "one_year":
        setPickerEndDate(localizedMaxDate);
        setPickerStartDate(subtractFromDate(localizedMaxDate, "year"));
        break;
      case "max":
        setPickerEndDate(localizedMaxDate);
        setPickerStartDate(localizedMinDate);
        break;
      default:
        break;
    }
  };

  const onPickerDateChange = (type: "start" | "end") => (date: Date | null) => {
    const time = date?.getTime();
    if (date && time && !isNaN(time)) {
      const dateString = date.toISOString();
      setRange("custom");
      switch (type) {
        case "start":
          setPickerStartDate(moment(dateString).startOf("day").toISOString());
          break;
        case "end":
          // Set picker end date only if input date is before today
          if (
            moment(dateString)
              .startOf("day")
              .isSameOrBefore(moment().startOf("day"))
          ) {
            setPickerEndDate(moment(dateString).startOf("day").toISOString());
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <Container className={classes.chartWithRange}>
      <ViewRange
        range={range}
        onRangeChange={onRangeChange}
        disableMaxRange={!hoboBottomTemperatureRange?.[0]}
        title={title}
      />
      <Grid
        className={classes.chartWrapper}
        container
        justify="space-between"
        item
        spacing={1}
      >
        <Grid
          item
          xs={12}
          md={hasSpotterData ? 12 : 8}
          lg={hasSpotterData ? 8 : 9}
        >
          <Chart
            reef={reef}
            dailyData={granularDailyData || []}
            pointId={pointId ? parseInt(pointId, 10) : undefined}
            spotterData={filterTimeSeriesData(spotterData, startDate, endDate)}
            hoboBottomTemperature={filterSofarData(
              hoboBottomTemperature || [],
              startDate || pickerStartDate,
              endDate || pickerEndDate
            )}
            pickerStartDate={pickerStartDate || subtractFromDate(today, "week")}
            pickerEndDate={pickerEndDate || today}
            startDate={
              startDate || pickerStartDate || subtractFromDate(today, "week")
            }
            endDate={endDate || pickerEndDate || today}
            onStartDateChange={onPickerDateChange("start")}
            onEndDateChange={onPickerDateChange("end")}
            pickerErrored={pickerErrored}
            surveysFiltered={surveysFiltered}
          />
        </Grid>
        {!pickerErrored && (
          <Grid
            item
            xs={12}
            className={classes.tempAnalysisCell}
            md={hasSpotterData ? 12 : 4}
            lg={hasSpotterData ? 4 : 3}
          >
            <TempAnalysis
              pickerStartDate={
                pickerStartDate || subtractFromDate(today, "week")
              }
              pickerEndDate={pickerEndDate || today}
              chartStartDate={
                startDate || pickerStartDate || subtractFromDate(today, "week")
              }
              chartEndDate={endDate || pickerEndDate || today}
              depth={reef.depth}
              spotterData={filterTimeSeriesData(
                spotterData,
                startDate,
                endDate
              )}
              hoboBottomTemperature={filterSofarData(
                hoboBottomTemperature || [],
                startDate || pickerStartDate,
                endDate || pickerEndDate
              )}
              monthlyMax={generateMonthlyMaxTimestamps(
                reef.monthlyMax,
                startDate,
                endDate,
                reef.timezone
              )}
            >
              <DownloadCSVButton
                startDate={startDate}
                endDate={endDate}
                className={classes.button}
              />
            </TempAnalysis>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    chartWithRange: {
      marginTop: 80,
    },
    chartWrapper: {
      marginBottom: 20,
      [theme.breakpoints.down("xs")]: {
        marginBottom: 10,
      },
    },
    button: {
      width: "auto",
    },
    tempAnalysisCell: {
      maxWidth: "fit-content",
      width: "inherit",
      margin: "0 auto",
    },
  });

interface ChartWithCardIncomingProps {
  reef: Reef;
  pointId: string | undefined;
  surveysFiltered: boolean;
  title?: string;
}

ChartWithCard.defaultProps = {
  title: "",
};

type ChartWithCardProps = ChartWithCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ChartWithCard);
