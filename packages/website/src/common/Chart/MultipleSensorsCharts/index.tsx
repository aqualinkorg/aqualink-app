import React, { useEffect, useState } from "react";
import isISODate from "validator/lib/isISO8601";
import { Box, Container, makeStyles, Theme } from "@material-ui/core";
import moment from "moment";
import { isNaN, snakeCase, sortBy } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { utcToZonedTime } from "date-fns-tz";

import {
  siteGranularDailyDataSelector,
  siteOceanSenseDataRequest,
  siteOceanSenseDataSelector,
  siteTimeSeriesDataRangeSelector,
  siteTimeSeriesDataRequest,
  siteTimeSeriesDataSelector,
} from "../../../store/Sites/selectedSiteSlice";
import { Metrics, MetricsKeys, Site } from "../../../store/Sites/types";
import {
  generateHistoricalMonthlyMeanTimestamps,
  isBefore,
  setTimeZone,
  subtractFromDate,
} from "../../../helpers/dates";
import {
  constructOceanSenseDatasets,
  findCardDataset,
  findDataLimits,
  localizedEndOfDay,
} from "./helpers";
import { RangeValue } from "./types";
import { oceanSenseConfig } from "../../../constants/oceanSenseConfig";
import { getSondeConfig } from "../../../constants/sondeConfig";
import { useQueryParams } from "../../../hooks/useQueryParams";
import { siteHasSondeData } from "../../../store/Sites/helpers";
import ChartWithCard from "./ChartWithCard";

const DEFAULT_METRICS: MetricsKeys[] = [
  "bottom_temperature",
  "top_temperature",
  "wind_speed",
  "significant_wave_height",
];

const spotterConfig = {
  windSpeed: {
    unit: "km/h",
    title: "Wind Speed",
  },
  significantWaveHeight: {
    unit: "m",
    title: "Significant Wave Height",
  },
};

const MultipleSensorsCharts = ({
  site,
  pointId,
  surveysFiltered,
  disableGutters,
  displayOceanSenseCharts,
}: MultipleSensorsChartsProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const getQueryParam = useQueryParams();
  const [startDateParam, endDateParam, initialChart] = [
    "start",
    "end",
    "chart",
  ].map(getQueryParam);
  const initialStart =
    startDateParam && isISODate(startDateParam) ? startDateParam : undefined;
  const initialEnd =
    endDateParam && isISODate(endDateParam) ? endDateParam : undefined;
  const granularDailyData = useSelector(siteGranularDailyDataSelector);
  const timeSeriesData = useSelector(siteTimeSeriesDataSelector);
  const oceanSenseData = useSelector(siteOceanSenseDataSelector);
  const {
    hobo: hoboData,
    spotter: spotterData,
    sonde: sondeData,
  } = timeSeriesData || {};
  const { bottomTemperature: hoboBottomTemperature } = hoboData || {};
  const timeSeriesDataRanges = useSelector(siteTimeSeriesDataRangeSelector);
  const { bottomTemperature: hoboBottomTemperatureRange } =
    timeSeriesDataRanges?.hobo || {};
  const [pickerEndDate, setPickerEndDate] = useState(initialEnd);
  const [pickerStartDate, setPickerStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pickerErrored, setPickerErrored] = useState(false);
  const [range, setRange] = useState<RangeValue>(
    initialStart || initialEnd ? "custom" : "three_months"
  );

  const today = localizedEndOfDay(undefined, site.timezone);

  const dailyDataSst = granularDailyData?.map((item) => ({
    timestamp: item.date,
    value: item.satelliteTemperature,
  }));

  const hasSpotterData = Boolean(
    spotterData?.bottomTemperature?.[1] || spotterData?.topTemperature?.[1]
  );

  const hasSondeData = siteHasSondeData(timeSeriesDataRanges?.sonde);

  const hasHoboData = Boolean(hoboBottomTemperature?.[1]);

  const cardDataset = findCardDataset(hasSpotterData, hasHoboData);

  const chartStartDate = startDate || subtractFromDate(today, "week");
  const chartEndDate = moment
    .min(
      moment(),
      moment(endDate)
        .tz(site.timezone || "UTC")
        .endOf("day")
    )
    .toISOString();

  const hasOceanSenseId = Boolean(oceanSenseConfig?.[site.id]);

  // Scroll to the chart defined by the initialChart query param.
  useEffect(() => {
    if (initialChart) {
      const chartElement = document.getElementById(initialChart);
      chartElement?.scrollIntoView();
    }
  }, [initialChart]);

  // Set pickers initial values once the range request is completed
  useEffect(() => {
    if (hoboBottomTemperatureRange) {
      const { maxDate } = hoboBottomTemperatureRange?.[0] || {};
      const localizedMaxDate = localizedEndOfDay(maxDate, site.timezone);
      const pastThreeMonths = moment(
        subtractFromDate(localizedMaxDate || today, "month", 3)
      )
        .tz(site.timezone || "UTC")
        .startOf("day")
        .toISOString();
      if (!initialEnd) {
        setPickerEndDate(
          utcToZonedTime(
            localizedMaxDate || today,
            site.timezone || "UTC"
          ).toISOString()
        );
      }
      if (!initialStart) {
        setPickerStartDate(
          utcToZonedTime(pastThreeMonths, site.timezone || "UTC").toISOString()
        );
      }
    }
  }, [
    hoboBottomTemperatureRange,
    initialEnd,
    initialStart,
    site.timezone,
    today,
  ]);

  // Get time series data
  useEffect(() => {
    if (
      pickerStartDate &&
      pickerEndDate &&
      isBefore(pickerStartDate, pickerEndDate)
    ) {
      const siteLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        site.timezone
      );

      const siteLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        site.timezone
      );

      dispatch(
        siteTimeSeriesDataRequest({
          siteId: `${site.id}`,
          pointId,
          start: siteLocalStartDate,
          end: siteLocalEndDate,
          metrics: hasSondeData ? undefined : DEFAULT_METRICS,
          hourly:
            moment(siteLocalEndDate).diff(moment(siteLocalStartDate), "days") >
            2,
        })
      );

      if (hasOceanSenseId) {
        dispatch(
          siteOceanSenseDataRequest({
            sensorID: oceanSenseConfig[site.id],
            startDate: siteLocalStartDate,
            endDate: siteLocalEndDate,
            latest: false,
          })
        );
      }
    }
  }, [
    dispatch,
    hasOceanSenseId,
    hasSondeData,
    pickerEndDate,
    pickerStartDate,
    pointId,
    site.id,
    site.timezone,
  ]);

  // Set chart start/end dates based on data received
  useEffect(() => {
    const pickerLocalEndDate = new Date(
      setTimeZone(
        new Date(moment(pickerEndDate).format("MM/DD/YYYY")),
        site?.timezone
      )
    ).toISOString();
    const pickerLocalStartDate = new Date(
      setTimeZone(
        new Date(moment(pickerStartDate).format("MM/DD/YYYY")),
        site?.timezone
      )
    ).toISOString();

    const [minDataDate, maxDataDate] = findDataLimits(
      site.historicalMonthlyMean,
      granularDailyData,
      timeSeriesData,
      pickerLocalStartDate,
      localizedEndOfDay(pickerLocalEndDate, site.timezone)
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
  }, [granularDailyData, pickerEndDate, pickerStartDate, site, timeSeriesData]);

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
        .tz(site.timezone || "UTC")
        .format("MM/DD/YYYY")
    ).toISOString();
    const localizedMaxDate = new Date(
      moment(maxDate)
        .tz(site.timezone || "UTC")
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
      className={classes.chartWithRange}
    >
      <ChartWithCard
        id="temperature"
        range={range}
        onRangeChange={onRangeChange}
        disableMaxRange={!hoboBottomTemperatureRange?.[0]}
        chartTitle="TEMPERATURE ANALYSIS"
        timeSeriesDataRanges={timeSeriesDataRanges}
        timeZone={site.timezone}
        chartWidth={cardDataset === "spotter" ? "small" : "medium"}
        site={site}
        dailyData={granularDailyData || []}
        pointId={pointId ? parseInt(pointId, 10) : undefined}
        spotterData={spotterData}
        hoboBottomTemperature={hoboBottomTemperature || []}
        pickerStartDate={pickerStartDate || subtractFromDate(today, "week")}
        pickerEndDate={pickerEndDate || today}
        chartStartDate={chartStartDate}
        chartEndDate={chartEndDate}
        onStartDateChange={onPickerDateChange("start")}
        onEndDateChange={onPickerDateChange("end")}
        isPickerErrored={pickerErrored}
        areSurveysFiltered={surveysFiltered}
        cardDataset={cardDataset}
        dailyDataSst={dailyDataSst || []}
        historicalMonthlyMean={generateHistoricalMonthlyMeanTimestamps(
          site.historicalMonthlyMean,
          startDate,
          endDate,
          site.timezone
        )}
      />
      {Object.entries(spotterConfig).map(([key, config]) => (
        <Box mt={4}>
          <ChartWithCard
            id={key}
            range={range}
            onRangeChange={onRangeChange}
            disableMaxRange={!hoboBottomTemperatureRange?.[0]}
            chartTitle={config.title}
            timeSeriesDataRanges={timeSeriesDataRanges}
            timeZone={site.timezone}
            showRangeButtons={false}
            showAvailableRanges={false}
            chartWidth="large"
            site={site}
            pickerStartDate={pickerStartDate || subtractFromDate(today, "week")}
            pickerEndDate={pickerEndDate || today}
            chartStartDate={chartStartDate}
            chartEndDate={chartEndDate}
            onStartDateChange={onPickerDateChange("start")}
            onEndDateChange={onPickerDateChange("end")}
            isPickerErrored={pickerErrored}
            showDatePickers={false}
            oceanSenseData={spotterData?.[key as Metrics]}
            oceanSenseDataUnit={config.unit}
            hideYAxisUnits
            displayHistoricalMonthlyMean={false}
            cardDataset="oceanSense"
            cardColumnJustification="flex-start"
            displayDownloadButton={false}
          />
        </Box>
      ))}
      {displayOceanSenseCharts &&
        hasOceanSenseId &&
        Object.values(constructOceanSenseDatasets(oceanSenseData)).map(
          (item) => (
            <Box mt={4} key={item.title}>
              <ChartWithCard
                id={item.id}
                range={range}
                onRangeChange={onRangeChange}
                disableMaxRange={!hoboBottomTemperatureRange?.[0]}
                chartTitle={item.title}
                timeSeriesDataRanges={timeSeriesDataRanges}
                timeZone={site.timezone}
                showRangeButtons={false}
                showAvailableRanges={false}
                chartWidth="large"
                site={site}
                pickerStartDate={
                  pickerStartDate || subtractFromDate(today, "week")
                }
                pickerEndDate={pickerEndDate || today}
                chartStartDate={chartStartDate}
                chartEndDate={chartEndDate}
                onStartDateChange={onPickerDateChange("start")}
                onEndDateChange={onPickerDateChange("end")}
                isPickerErrored={pickerErrored}
                showDatePickers={false}
                oceanSenseData={item.data}
                oceanSenseDataUnit={item.unit}
                hideYAxisUnits
                displayHistoricalMonthlyMean={false}
                cardDataset="oceanSense"
                cardColumnJustification="flex-start"
                displayDownloadButton={false}
              />
            </Box>
          )
        )}
      {hasSondeData &&
        sortBy(
          Object.entries(sondeData || {}),
          ([key]) => getSondeConfig(snakeCase(key)).order
        )
          .filter(([, itemData]) => itemData?.length)
          .map(([key, itemData]) => {
            const { title, units, visibility } = getSondeConfig(snakeCase(key));

            if (visibility === "admin") {
              return null;
            }

            return (
              <Box mt={4} key={key}>
                <ChartWithCard
                  id={key}
                  range={range}
                  onRangeChange={onRangeChange}
                  disableMaxRange={!hoboBottomTemperatureRange?.[0]}
                  chartTitle={title}
                  timeSeriesDataRanges={timeSeriesDataRanges}
                  timeZone={site.timezone}
                  showRangeButtons={false}
                  showAvailableRanges={false}
                  chartWidth="large"
                  site={site}
                  pickerStartDate={
                    pickerStartDate || subtractFromDate(today, "week")
                  }
                  pickerEndDate={pickerEndDate || today}
                  chartStartDate={chartStartDate}
                  chartEndDate={chartEndDate}
                  onStartDateChange={onPickerDateChange("start")}
                  onEndDateChange={onPickerDateChange("end")}
                  isPickerErrored={pickerErrored}
                  showDatePickers={false}
                  oceanSenseData={itemData}
                  oceanSenseDataUnit={units}
                  hideYAxisUnits
                  displayHistoricalMonthlyMean={false}
                  cardDataset="oceanSense"
                  cardColumnJustification="flex-start"
                  displayDownloadButton={false}
                />
              </Box>
            );
          })}
    </Container>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  chartWithRange: {
    marginTop: theme.spacing(4),
  },
}));

interface MultipleSensorsChartsProps {
  site: Site;
  pointId?: string;
  surveysFiltered: boolean;
  disableGutters: boolean;
  displayOceanSenseCharts?: boolean;
}

MultipleSensorsCharts.defaultProps = {
  pointId: undefined,
  displayOceanSenseCharts: true,
};

export default MultipleSensorsCharts;
