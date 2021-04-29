import React, { useEffect, useState } from "react";
import {
  Container,
  createStyles,
  Grid,
  Theme,
  useMediaQuery,
  useTheme,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import classnames from "classnames";
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
  generateHistoricalMonthlyMeanTimestamps,
  isBefore,
  setTimeZone,
  subtractFromDate,
} from "../../../helpers/dates";
import { findDataLimits } from "./helpers";
import { RangeValue } from "./types";
import ViewRange from "./ViewRange";
import DownloadCSVButton from "./DownloadCSVButton";

const ChartWithCard = ({
  reef,
  pointId,
  surveysFiltered,
  title,
  disableGutters,
  classes,
}: ChartWithCardProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.up("md"));

  const dispatch = useDispatch();
  const granularDailyData = useSelector(reefGranularDailyDataSelector);
  const timeSeriesData = useSelector(reefTimeSeriesDataSelector);
  const { hobo: hoboData, spotter: spotterData } = timeSeriesData || {};
  const { bottomTemperature: hoboBottomTemperature } = hoboData || {};
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefTimeSeriesDataRangeSelector)?.hobo || {};
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pickerErrored, setPickerErrored] = useState(false);
  const [range, setRange] = useState<RangeValue>("three_months");

  const today = new Date(moment().format("MM/DD/YYYY")).toISOString();

  const hasSpotterData = Boolean(
    spotterData?.bottomTemperature?.[1] || spotterData?.topTemperature?.[1]
  );

  const hasHoboData = Boolean(hoboBottomTemperature?.[1]);

  const chartWidthClass = () => {
    switch (true) {
      case hasSpotterData && hasHoboData:
        return classes.smallChart;
      case hasSpotterData && !hasHoboData:
        return classes.mediumChart;
      case !hasSpotterData && hasHoboData:
        return classes.largeChart;
      default:
        return "";
    }
  };

  const chartStartDate = startDate || subtractFromDate(today, "week");
  const chartEndDate = moment
    .min(
      moment(),
      moment(endDate)
        .tz(reef.timezone || "UTC")
        .endOf("day")
    )
    .toISOString();

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
      setPickerEndDate(moment(localizedMaxDate).endOf("day").toISOString());
      setPickerStartDate(pastThreeMonths);
    }
  }, [hoboBottomTemperatureRange, reef.timezone]);

  // Get time series data
  useEffect(() => {
    if (
      pickerStartDate &&
      pickerEndDate &&
      isBefore(pickerStartDate, pickerEndDate)
    ) {
      const reefLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        reef.timezone
      );

      const reefLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        reef.timezone
      );

      dispatch(
        reefTimeSeriesDataRequest({
          reefId: `${reef.id}`,
          pointId,
          start: reefLocalStartDate,
          end: reefLocalEndDate,
          metrics: ["bottom_temperature", "top_temperature"],
          hourly:
            moment(reefLocalEndDate).diff(moment(reefLocalStartDate), "days") >
            2,
        })
      );
    }
  }, [
    dispatch,
    pickerEndDate,
    pickerStartDate,
    pointId,
    reef.id,
    reef.timezone,
  ]);

  // Set chart start/end dates based on data received
  useEffect(() => {
    const pickerLocalEndDate = new Date(
      setTimeZone(
        new Date(moment(pickerEndDate).format("MM/DD/YYYY")),
        reef?.timezone
      )
    ).toISOString();
    const pickerLocalStartDate = new Date(
      setTimeZone(
        new Date(moment(pickerStartDate).format("MM/DD/YYYY")),
        reef?.timezone
      )
    ).toISOString();

    const [minDataDate, maxDataDate] = findDataLimits(
      reef.historicalMonthlyMean,
      granularDailyData,
      timeSeriesData,
      pickerLocalStartDate,
      moment(pickerLocalEndDate)
        .tz(reef.timezone || "UTC")
        .endOf("day")
        .toISOString()
    );

    setStartDate(
      minDataDate
        ? moment
            .max(moment(minDataDate), moment(pickerLocalStartDate))
            .toISOString()
        : pickerLocalStartDate
    );

    setEndDate(
      maxDataDate
        ? moment
            .min(moment(maxDataDate), moment(pickerLocalEndDate).endOf("day"))
            .toISOString()
        : moment(pickerLocalEndDate).endOf("day").toISOString()
    );
  }, [granularDailyData, pickerEndDate, pickerStartDate, reef, timeSeriesData]);

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
        setPickerEndDate(moment(localizedMaxDate).endOf("day").toISOString());
        setPickerStartDate(subtractFromDate(localizedMaxDate, "month", 3));
        break;
      case "one_year":
        setPickerEndDate(moment(localizedMaxDate).endOf("day").toISOString());
        setPickerStartDate(subtractFromDate(localizedMaxDate, "year"));
        break;
      case "max":
        setPickerEndDate(moment(localizedMaxDate).endOf("day").toISOString());
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
          // Set picker start date only if input date is after zero time
          if (
            moment(dateString)
              .startOf("day")
              .isSameOrAfter(moment(0).startOf("day"))
          ) {
            setPickerStartDate(moment(dateString).startOf("day").toISOString());
          }
          break;
        case "end":
          // Set picker end date only if input date is before today
          if (
            moment(dateString)
              .endOf("day")
              .isSameOrBefore(moment().endOf("day"))
          ) {
            setPickerEndDate(moment(dateString).endOf("day").toISOString());
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <Container
      disableGutters={disableGutters}
      className={classnames(classes.chartWithRange, {
        [classes.extraPadding]:
          (hasSpotterData && isDesktop) || (!hasSpotterData && isTablet),
      })}
    >
      <ViewRange
        range={range}
        onRangeChange={onRangeChange}
        disableMaxRange={!hoboBottomTemperatureRange?.[0]}
        title={title}
        hasSpotterData={hasSpotterData}
      />
      <Grid
        className={classes.chartWrapper}
        container
        justify="space-between"
        item
        spacing={1}
      >
        <Grid className={classnames(classes.chart, chartWidthClass())} item>
          <Chart
            reef={reef}
            dailyData={granularDailyData || []}
            pointId={pointId ? parseInt(pointId, 10) : undefined}
            spotterData={spotterData}
            hoboBottomTemperature={hoboBottomTemperature || []}
            pickerStartDate={pickerStartDate || subtractFromDate(today, "week")}
            pickerEndDate={pickerEndDate || today}
            startDate={chartStartDate}
            endDate={chartEndDate}
            onStartDateChange={onPickerDateChange("start")}
            onEndDateChange={onPickerDateChange("end")}
            pickerErrored={pickerErrored}
            surveysFiltered={surveysFiltered}
          />
        </Grid>
        {!pickerErrored && (
          <Grid className={classes.card} item>
            <TempAnalysis
              pickerStartDate={
                pickerStartDate || subtractFromDate(today, "week")
              }
              pickerEndDate={pickerEndDate || today}
              chartStartDate={chartStartDate}
              chartEndDate={chartEndDate}
              depth={reef.depth}
              spotterData={spotterData}
              hoboBottomTemperature={hoboBottomTemperature || []}
              historicalMonthlyMean={generateHistoricalMonthlyMeanTimestamps(
                reef.historicalMonthlyMean,
                startDate,
                endDate,
                reef.timezone
              )}
            >
              <DownloadCSVButton
                startDate={pickerStartDate}
                endDate={pickerEndDate}
                reefId={reef.id}
                pointId={pointId}
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
    extraPadding: {
      paddingRight: 12,
    },
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
      width: "fit-content",
    },
    chart: {
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    largeChart: {
      [theme.breakpoints.up("md")]: {
        width: "calc(100% - 235px)",
      },
    },
    mediumChart: {
      [theme.breakpoints.up("md")]: {
        width: "calc(100% - 315px)",
      },
    },
    smallChart: {
      [theme.breakpoints.up("md")]: {
        width: "calc(100% - 400px)",
      },
    },
    card: {
      width: "fit-content",
      [theme.breakpoints.down("sm")]: {
        margin: "0 auto",
      },
    },
  });

interface ChartWithCardIncomingProps {
  reef: Reef;
  pointId: string | undefined;
  surveysFiltered: boolean;
  disableGutters: boolean;
  title?: string;
}

ChartWithCard.defaultProps = {
  title: "",
};

type ChartWithCardProps = ChartWithCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ChartWithCard);
