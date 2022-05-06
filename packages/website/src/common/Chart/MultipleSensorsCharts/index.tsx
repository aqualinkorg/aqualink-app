import React, { useEffect, useState } from "react";
import isISODate from "validator/lib/isISO8601";
import { Box, Container, makeStyles, Theme } from "@material-ui/core";
import moment from "moment";
import { camelCase, isNaN, isNumber, sortBy } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { utcToZonedTime } from "date-fns-tz";
import { useHistory } from "react-router-dom";
import {
  latestDataSelector,
  siteGranularDailyDataSelector,
  siteOceanSenseDataRequest,
  siteOceanSenseDataSelector,
  siteTimeSeriesDataRangeLoadingSelector,
  siteTimeSeriesDataRangeSelector,
  siteTimeSeriesDataRequest,
  siteTimeSeriesDataSelector,
} from "../../../store/Sites/selectedSiteSlice";
import { Metrics, MetricsKeys, Site } from "../../../store/Sites/types";
import {
  isBefore,
  setTimeZone,
  subtractFromDate,
} from "../../../helpers/dates";
import {
  constructOceanSenseDatasets,
  findChartWidth,
  findDataLimits,
  generateMetricDataset,
  generateTempAnalysisDatasets,
  localizedEndOfDay,
} from "./helpers";
import { RangeValue } from "./types";
import { oceanSenseConfig } from "../../../constants/oceanSenseConfig";
import {
  getPublicSondeMetrics,
  getSondeConfig,
} from "../../../constants/sondeConfig";
import { useQueryParams } from "../../../hooks/useQueryParams";
import ChartWithCard from "./ChartWithCard";
import {
  METLOG_DATA_COLOR,
  OCEAN_SENSE_DATA_COLOR,
  SONDE_DATA_COLOR,
  SPOTTER_METRIC_DATA_COLOR,
} from "../../../constants/charts";
import {
  getMetlogConfig,
  getPublicMetlogMetrics,
} from "../../../constants/metlogConfig";

const DEFAULT_METRICS: MetricsKeys[] = [
  "bottom_temperature",
  "top_temperature",
  "wind_speed",
  "significant_wave_height",
];

interface SpotterConfig {
  unit: string;
  title: string;
  convert?: number;
}

const spotterConfig: Partial<Record<Metrics, SpotterConfig>> = {
  windSpeed: {
    unit: "km/h",
    title: "Wind Speed",
    // convert from m/s to to km/h
    convert: 3.6,
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
  const latestData = useSelector(latestDataSelector);
  const { bottomTemperature, topTemperature } = timeSeriesData || {};
  const { hobo: hoboBottomTemperature } = bottomTemperature || {};
  const timeSeriesDataRanges = useSelector(siteTimeSeriesDataRangeSelector);
  const { hobo: hoboBottomTemperatureRange } =
    timeSeriesDataRanges?.bottomTemperature || {};
  const rangesLoading = useSelector(siteTimeSeriesDataRangeLoadingSelector);
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pickerErrored, setPickerErrored] = useState(false);
  const [range, setRange] = useState<RangeValue>(
    initialStart || initialEnd ? "custom" : "one_month"
  );
  const history = useHistory();

  const today = localizedEndOfDay(undefined, site.timezone);

  const hasSpotterData = Boolean(
    bottomTemperature?.spotter?.data?.[1] || topTemperature?.spotter?.data?.[1]
  );

  const hasSondeData = Boolean(
    latestData?.some((data) => data.source === "sonde")
  );

  const hasMetlogData = Boolean(
    latestData?.some((data) => data.source === "metlog")
  );

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

  const tempAnalysisDatasets = generateTempAnalysisDatasets(
    granularDailyData,
    timeSeriesData?.bottomTemperature?.spotter?.data,
    timeSeriesData?.topTemperature?.spotter?.data,
    hoboBottomTemperature?.data,
    site.historicalMonthlyMean,
    startDate,
    endDate,
    chartStartDate,
    chartEndDate,
    site.timezone,
    site.depth
  );

  const spotterMetricDataset = (metric: Metrics) => {
    const { unit, convert } = spotterConfig[metric] || {};

    return generateMetricDataset(
      "SENSOR",
      timeSeriesData?.[metric]?.spotter?.data?.map((item) => ({
        ...item,
        value: convert ? convert * item.value : item.value,
      })) || [],
      unit || "",
      SPOTTER_METRIC_DATA_COLOR,
      chartStartDate,
      chartEndDate,
      site.timezone
    );
  };

  const sondeDatasets = () =>
    hasSondeData
      ? sortBy(getPublicSondeMetrics(), (key) => getSondeConfig(key).order)
          .filter(
            (key) =>
              timeSeriesData?.[camelCase(key) as Metrics]?.sonde?.data?.length
          )
          .map((key) => {
            const { data, surveyPoint } =
              timeSeriesData?.[camelCase(key) as Metrics]?.sonde || {};
            const { title, units } = getSondeConfig(key);

            return {
              key,
              title,
              surveyPoint,
              dataset: generateMetricDataset(
                "SENSOR",
                data || [],
                units,
                SONDE_DATA_COLOR,
                chartStartDate,
                chartEndDate,
                site.timezone
              ),
            };
          })
      : [];

  const metlogDatasets = () =>
    hasMetlogData
      ? sortBy(getPublicMetlogMetrics(), (key) => getMetlogConfig(key).order)
          .filter(
            (key) =>
              timeSeriesData?.[camelCase(key) as Metrics]?.metlog?.data?.length
          )
          .map((key) => {
            const { data, surveyPoint } =
              timeSeriesData?.[camelCase(key) as Metrics]?.metlog || {};
            const { title, units, convert } = getMetlogConfig(key);

            return {
              key,
              title,
              surveyPoint,
              dataset: generateMetricDataset(
                "SENSOR",
                (data || []).map((item) => ({
                  ...item,
                  value: isNumber(convert) ? item.value * convert : item.value,
                })),
                units,
                METLOG_DATA_COLOR,
                chartStartDate,
                chartEndDate,
                site.timezone
              ),
            };
          })
      : [];

  // Scroll to the chart defined by the initialChart query param.
  useEffect(() => {
    if (initialChart) {
      const chartElement = document.getElementById(initialChart);
      chartElement?.scrollIntoView();
    }
  }, [initialChart]);

  // Set pickers initial values once the range request is completed
  useEffect(() => {
    if (!rangesLoading && !pickerStartDate && !pickerEndDate) {
      const { maxDate } = hoboBottomTemperatureRange?.data?.[0] || {};
      const localizedMaxDate = localizedEndOfDay(maxDate, site.timezone);
      const pastThreeMonths = moment(
        subtractFromDate(localizedMaxDate || today, "month", 1)
      )
        .tz(site.timezone || "UTC")
        .startOf("day")
        .toISOString();

      setPickerEndDate(
        utcToZonedTime(
          initialEnd || localizedMaxDate || today,
          site.timezone || "UTC"
        ).toISOString()
      );

      setPickerStartDate(
        utcToZonedTime(
          initialStart || pastThreeMonths,
          site.timezone || "UTC"
        ).toISOString()
      );
    }
  }, [
    hoboBottomTemperatureRange,
    initialEnd,
    initialStart,
    pickerEndDate,
    pickerStartDate,
    rangesLoading,
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
          metrics: hasSondeData || hasMetlogData ? undefined : DEFAULT_METRICS,
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
    hasMetlogData,
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

  useEffect(() => {
    if (pickerStartDate && pickerEndDate) {
      const newStart =
        pickerStartDate !== initialStart
          ? moment(pickerStartDate).format("YYYY-MM-DD")
          : pickerStartDate;

      const newEnd =
        pickerEndDate !== initialEnd
          ? moment(pickerEndDate).format("YYYY-MM-DD")
          : pickerEndDate;

      // eslint-disable-next-line fp/no-mutating-methods
      history.push({
        search: `?start=${newStart}&end=${newEnd}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, pickerEndDate, pickerStartDate, site.timezone]);

  const onRangeChange = (value: RangeValue) => {
    const { minDate, maxDate } = hoboBottomTemperatureRange?.data?.[0] || {};
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
      case "one_month":
        setPickerEndDate(moment(localizedMaxDate).endOf("day").toISOString());
        setPickerStartDate(subtractFromDate(localizedMaxDate, "month", 1));
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
        disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
        chartTitle="TEMPERATURE ANALYSIS"
        availableRanges={[
          {
            name: "Spotter",
            data: timeSeriesDataRanges?.bottomTemperature?.spotter?.data,
          },
          {
            name: "HOBO",
            data: timeSeriesDataRanges?.bottomTemperature?.hobo?.data,
          },
        ]}
        timeZone={site.timezone}
        chartWidth={findChartWidth(tempAnalysisDatasets)}
        site={site}
        datasets={tempAnalysisDatasets}
        pointId={pointId ? parseInt(pointId, 10) : undefined}
        pickerStartDate={pickerStartDate || subtractFromDate(today, "week")}
        pickerEndDate={pickerEndDate || today}
        chartStartDate={chartStartDate}
        chartEndDate={chartEndDate}
        onStartDateChange={onPickerDateChange("start")}
        onEndDateChange={onPickerDateChange("end")}
        isPickerErrored={pickerErrored}
        areSurveysFiltered={surveysFiltered}
      />
      {hasSpotterData &&
        Object.entries(spotterConfig).map(([key, { title }]) => (
          <Box mt={4} key={title}>
            <ChartWithCard
              datasets={[spotterMetricDataset(key as Metrics)]}
              id={key}
              range={range}
              onRangeChange={onRangeChange}
              disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
              chartTitle={title}
              availableRanges={[
                {
                  name: "Spotter",
                  data: timeSeriesDataRanges?.[key as Metrics]?.spotter?.data,
                },
              ]}
              timeZone={site.timezone}
              showRangeButtons={false}
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
              hideYAxisUnits
              cardColumnJustification="flex-start"
              displayDownloadButton={false}
            />
          </Box>
        ))}
      {displayOceanSenseCharts &&
        hasOceanSenseId &&
        Object.entries(constructOceanSenseDatasets(oceanSenseData)).map(
          ([key, item]) => (
            <Box mt={4} key={item.title}>
              <ChartWithCard
                datasets={[
                  generateMetricDataset(
                    key,
                    item.data,
                    item.unit,
                    OCEAN_SENSE_DATA_COLOR,
                    chartStartDate,
                    chartEndDate,
                    site.timezone
                  ),
                ]}
                id={item.id}
                range={range}
                onRangeChange={onRangeChange}
                disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
                chartTitle={item.title}
                timeZone={site.timezone}
                showRangeButtons={false}
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
                hideYAxisUnits
                cardColumnJustification="flex-start"
                displayDownloadButton={false}
              />
            </Box>
          )
        )}
      {sondeDatasets().map(({ key, title, surveyPoint, dataset }) => (
        <Box mt={4} key={key}>
          <ChartWithCard
            datasets={[dataset]}
            id={key}
            range={range}
            onRangeChange={onRangeChange}
            disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
            chartTitle={title}
            availableRanges={[
              {
                name: "Sonde",
                data: timeSeriesDataRanges?.[camelCase(key) as Metrics]?.sonde
                  ?.data,
              },
            ]}
            timeZone={site.timezone}
            showRangeButtons={false}
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
            surveyPoint={surveyPoint}
            hideYAxisUnits
            cardColumnJustification="flex-start"
            displayDownloadButton={false}
          />
        </Box>
      ))}
      {metlogDatasets().map(({ key, title, surveyPoint, dataset }) => (
        <Box mt={4} key={key}>
          <ChartWithCard
            datasets={[dataset]}
            id={key}
            range={range}
            onRangeChange={onRangeChange}
            disableMaxRange={!hoboBottomTemperatureRange?.data?.[0]}
            chartTitle={title}
            availableRanges={[
              {
                name: "Meteorological",
                data: timeSeriesDataRanges?.[camelCase(key) as Metrics]?.metlog
                  ?.data,
              },
            ]}
            timeZone={site.timezone}
            showRangeButtons={false}
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
            surveyPoint={surveyPoint}
            hideYAxisUnits
            cardColumnJustification="flex-start"
            displayDownloadButton={false}
          />
        </Box>
      ))}
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
