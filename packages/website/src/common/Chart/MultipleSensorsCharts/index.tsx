import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  createStyles,
  Grid,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import classnames from "classnames";
import moment from "moment";
import { isNaN } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { utcToZonedTime } from "date-fns-tz";

import Chart from "./Chart";
import AnalysisCard from "./AnalysisCard";
import {
  siteGranularDailyDataSelector,
  siteOceanSenseDataRequest,
  siteOceanSenseDataSelector,
  siteTimeSeriesDataRangeSelector,
  siteTimeSeriesDataRequest,
  siteTimeSeriesDataSelector,
} from "../../../store/Sites/selectedSiteSlice";
import { Site } from "../../../store/Sites/types";
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
import Header from "./Header";
import DownloadCSVButton from "./DownloadCSVButton";
import { oceanSenseConfig } from "../../../constants/oceanSenseConfig";

const ChartWithCard = ({
  site,
  pointId,
  surveysFiltered,
  disableGutters,
  displayOceanSenseCharts,
  classes,
}: ChartWithCardProps) => {
  const dispatch = useDispatch();
  const granularDailyData = useSelector(siteGranularDailyDataSelector);
  const timeSeriesData = useSelector(siteTimeSeriesDataSelector);
  const oceanSenseData = useSelector(siteOceanSenseDataSelector);
  const { hobo: hoboData, spotter: spotterData } = timeSeriesData || {};
  const { bottomTemperature: hoboBottomTemperature } = hoboData || {};
  const timeSeriesDataRanges = useSelector(siteTimeSeriesDataRangeSelector);
  const { bottomTemperature: hoboBottomTemperatureRange } =
    timeSeriesDataRanges?.hobo || {};
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pickerErrored, setPickerErrored] = useState(false);
  const [range, setRange] = useState<RangeValue>("three_months");

  const today = localizedEndOfDay(undefined, site.timezone);

  const dailyDataSst = granularDailyData?.map((item) => ({
    timestamp: item.date,
    value: item.satelliteTemperature,
  }));

  const hasSpotterData = Boolean(
    spotterData?.bottomTemperature?.[1] || spotterData?.topTemperature?.[1]
  );

  const hasHoboData = Boolean(hoboBottomTemperature?.[1]);

  const cardDataset = findCardDataset(hasSpotterData, hasHoboData);

  const chartWidthClass =
    cardDataset === "spotter" ? classes.smallChart : classes.mediumChart;

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
      setPickerEndDate(
        utcToZonedTime(
          localizedMaxDate || today,
          site.timezone || "UTC"
        ).toISOString()
      );
      setPickerStartDate(
        utcToZonedTime(pastThreeMonths, site.timezone || "UTC").toISOString()
      );
    }
  }, [hoboBottomTemperatureRange, site.timezone, today]);

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
          metrics: ["bottom_temperature", "top_temperature"],
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
      <Header
        range={range}
        onRangeChange={onRangeChange}
        disableMaxRange={!hoboBottomTemperatureRange?.[0]}
        title="TEMPERATURE ANALYSIS"
        timeSeriesDataRanges={timeSeriesDataRanges}
        timeZone={site.timezone}
      />
      <Grid
        className={classes.chartWrapper}
        container
        justify="space-between"
        item
        spacing={1}
      >
        <Grid className={classnames(classes.chart, chartWidthClass)} item>
          <Chart
            site={site}
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
            <AnalysisCard
              dataset={cardDataset}
              pickerStartDate={
                pickerStartDate || subtractFromDate(today, "week")
              }
              pickerEndDate={pickerEndDate || today}
              chartStartDate={chartStartDate}
              chartEndDate={chartEndDate}
              depth={site.depth}
              dailyDataSst={dailyDataSst || []}
              spotterData={spotterData}
              hoboBottomTemperature={hoboBottomTemperature || []}
              historicalMonthlyMean={generateHistoricalMonthlyMeanTimestamps(
                site.historicalMonthlyMean,
                startDate,
                endDate,
                site.timezone
              )}
            >
              <DownloadCSVButton
                startDate={pickerStartDate}
                endDate={pickerEndDate}
                siteId={site.id}
                pointId={pointId}
                className={classes.button}
              />
            </AnalysisCard>
          </Grid>
        )}
      </Grid>
      {displayOceanSenseCharts &&
        hasOceanSenseId &&
        Object.values(constructOceanSenseDatasets(oceanSenseData)).map(
          (item) => (
            <Box mt={4} key={item.title}>
              <Header
                range={range}
                onRangeChange={onRangeChange}
                disableMaxRange={!hoboBottomTemperatureRange?.[0]}
                title={item.title}
                timeSeriesDataRanges={timeSeriesDataRanges}
                timeZone={site.timezone}
                showRangeButtons={false}
                showAvailableRanges={false}
              />
              <Grid
                className={classes.chartWrapper}
                container
                justify="space-between"
                item
                spacing={1}
              >
                <Grid
                  className={classnames(classes.chart, classes.largeChart)}
                  item
                >
                  <Chart
                    site={site}
                    pickerStartDate={
                      pickerStartDate || subtractFromDate(today, "week")
                    }
                    pickerEndDate={pickerEndDate || today}
                    startDate={chartStartDate}
                    endDate={chartEndDate}
                    onStartDateChange={onPickerDateChange("start")}
                    onEndDateChange={onPickerDateChange("end")}
                    pickerErrored={pickerErrored}
                    showDatePickers={false}
                    oceanSenseData={item.data}
                    oceanSenseDataUnit={item.unit}
                    hideYAxisUnits
                    displayHistoricalMonthlyMean={false}
                  />
                </Grid>
                {!pickerErrored && (
                  <Grid className={classes.card} item>
                    <AnalysisCard
                      dataset="oceanSense"
                      pickerStartDate={
                        pickerStartDate || subtractFromDate(today, "week")
                      }
                      pickerEndDate={pickerEndDate || today}
                      chartStartDate={chartStartDate}
                      chartEndDate={chartEndDate}
                      depth={site.depth}
                      oceanSenseData={item.data}
                      oceanSenseUnit={item.unit}
                      columnJustification="flex-start"
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )
        )}
    </Container>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    chartWithRange: {
      marginTop: theme.spacing(4),
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
        width: "calc(100% - 230px)", // width of 100% minus the card with one column
      },
    },
    mediumChart: {
      [theme.breakpoints.up("md")]: {
        width: "calc(100% - 240px)", // width of 100% minus the card with two columns
      },
    },
    smallChart: {
      [theme.breakpoints.up("md")]: {
        width: "calc(100% - 320px)", // width of 100% minus the card with three columns
      },
    },
    card: {
      width: "fit-content",
      minWidth: 219,
      [theme.breakpoints.down("sm")]: {
        width: "inherit",
        maxWidth: "fit-content",
        margin: "0 auto",
      },
    },
  });

interface ChartWithCardIncomingProps {
  site: Site;
  pointId: string | undefined;
  surveysFiltered: boolean;
  disableGutters: boolean;
  displayOceanSenseCharts?: boolean;
}

ChartWithCard.defaultProps = {
  displayOceanSenseCharts: true,
};

type ChartWithCardProps = ChartWithCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ChartWithCard);
