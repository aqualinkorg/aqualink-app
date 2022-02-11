import React from "react";
import classnames from "classnames";
import { Grid, GridProps, makeStyles, Theme } from "@material-ui/core";

import AnalysisCard from "./AnalysisCard";
import Chart from "./Chart";
import DownloadCSVButton from "./DownloadCSVButton";
import Header from "./Header";
import { Dataset, RangeValue } from "./types";
import {
  DailyData,
  HistoricalMonthlyMeanData,
  Site,
  SofarValue,
  TimeSeriesDataRange,
  TimeSeriesSurveyPoint,
} from "../../../store/Sites/types";

const ChartWithCard = ({
  areSurveysFiltered,
  cardColumnJustification,
  cardDataset,
  chartEndDate,
  chartStartDate,
  chartTitle,
  chartWidth,
  dailyData,
  dailyDataSst,
  disableMaxRange,
  displayDownloadButton,
  displayHistoricalMonthlyMean,
  hideYAxisUnits,
  historicalMonthlyMean,
  hoboBottomTemperature,
  id,
  isPickerErrored,
  oceanSenseData,
  oceanSenseDataUnit,
  pickerEndDate,
  pickerStartDate,
  pointId,
  range,
  showAvailableRanges,
  showDatePickers,
  showRangeButtons,
  site,
  spotterBottomTemperature,
  spotterTopTemperature,
  surveyPoint,
  timeSeriesDataRanges,
  timeZone,
  onEndDateChange,
  onStartDateChange,
  onRangeChange,
}: ChartWithCardProps) => {
  const classes = useStyles();
  const chartWidthClass = () => {
    switch (chartWidth) {
      case "large":
        return classes.largeChart;
      case "medium":
        return classes.mediumChart;
      default:
        return classes.smallChart;
    }
  };

  return (
    <>
      <Header
        id={id}
        range={range}
        onRangeChange={onRangeChange}
        disableMaxRange={disableMaxRange}
        title={chartTitle}
        timeSeriesDataRanges={timeSeriesDataRanges}
        timeZone={timeZone}
        showAvailableRanges={showAvailableRanges}
        showRangeButtons={showRangeButtons}
        surveyPoint={surveyPoint}
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
            site={site}
            dailyData={dailyData}
            pointId={pointId}
            spotterTopTemperature={spotterTopTemperature}
            spotterBottomTemperature={spotterBottomTemperature}
            hoboBottomTemperature={hoboBottomTemperature}
            pickerStartDate={pickerStartDate}
            pickerEndDate={pickerEndDate}
            startDate={chartStartDate}
            endDate={chartEndDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            pickerErrored={isPickerErrored}
            surveysFiltered={areSurveysFiltered}
            oceanSenseData={oceanSenseData}
            oceanSenseDataUnit={oceanSenseDataUnit}
            hideYAxisUnits={hideYAxisUnits}
            displayHistoricalMonthlyMean={displayHistoricalMonthlyMean}
            showDatePickers={showDatePickers}
          />
        </Grid>
        {!isPickerErrored && (
          <Grid className={classes.card} item>
            <AnalysisCard
              dataset={cardDataset}
              pickerStartDate={pickerStartDate}
              pickerEndDate={pickerEndDate}
              chartStartDate={chartStartDate}
              chartEndDate={chartEndDate}
              depth={site.depth}
              dailyDataSst={dailyDataSst}
              spotterTopTemperature={spotterTopTemperature}
              spotterBottomTemperature={spotterBottomTemperature}
              hoboBottomTemperature={hoboBottomTemperature}
              historicalMonthlyMean={historicalMonthlyMean}
              oceanSenseData={oceanSenseData}
              oceanSenseUnit={oceanSenseDataUnit}
              columnJustification={cardColumnJustification}
            >
              {displayDownloadButton && (
                <DownloadCSVButton
                  startDate={pickerStartDate}
                  endDate={pickerEndDate}
                  siteId={site.id}
                  pointId={pointId}
                  className={classes.button}
                />
              )}
            </AnalysisCard>
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  chartWrapper: {
    marginBottom: 20,
    [theme.breakpoints.down("xs")]: {
      marginBottom: 10,
    },
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
  button: {
    width: "fit-content",
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
}));

interface ChartWithCardProps {
  areSurveysFiltered?: boolean;
  cardColumnJustification?: GridProps["justify"];
  cardDataset: Dataset;
  chartEndDate: string;
  chartStartDate: string;
  chartTitle: string;
  chartWidth: "small" | "medium" | "large";
  dailyData?: DailyData[];
  dailyDataSst?: SofarValue[];
  disableMaxRange: boolean;
  displayDownloadButton?: boolean;
  displayHistoricalMonthlyMean?: boolean;
  hideYAxisUnits?: boolean;
  historicalMonthlyMean?: HistoricalMonthlyMeanData[];
  hoboBottomTemperature?: SofarValue[];
  id: string;
  isPickerErrored: boolean;
  oceanSenseData?: SofarValue[];
  oceanSenseDataUnit?: string;
  pickerEndDate: string;
  pickerStartDate: string;
  pointId?: number;
  range: RangeValue;
  showAvailableRanges?: boolean;
  showDatePickers?: boolean;
  showRangeButtons?: boolean;
  site: Site;
  spotterBottomTemperature?: SofarValue[];
  spotterTopTemperature?: SofarValue[];
  surveyPoint?: TimeSeriesSurveyPoint;
  timeSeriesDataRanges?: TimeSeriesDataRange;
  timeZone?: string | null;
  onEndDateChange: (date: Date | null) => void;
  onStartDateChange: (date: Date | null) => void;
  onRangeChange: (value: RangeValue) => void;
}

ChartWithCard.defaultProps = {
  areSurveysFiltered: undefined,
  cardColumnJustification: "space-between",
  dailyData: undefined,
  dailyDataSst: undefined,
  displayDownloadButton: true,
  displayHistoricalMonthlyMean: true,
  hideYAxisUnits: false,
  historicalMonthlyMean: undefined,
  hoboBottomTemperature: undefined,
  oceanSenseData: undefined,
  oceanSenseDataUnit: undefined,
  pointId: undefined,
  showAvailableRanges: true,
  showDatePickers: true,
  showRangeButtons: true,
  spotterBottomTemperature: undefined,
  spotterTopTemperature: undefined,
  surveyPoint: undefined,
  timeSeriesDataRanges: undefined,
  timeZone: undefined,
};

export default ChartWithCard;
