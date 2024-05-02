import React from 'react';
import classnames from 'classnames';
import { Grid, GridProps, makeStyles, Theme } from '@material-ui/core';

import { Site, Sources, TimeSeriesSurveyPoint } from 'store/Sites/types';
import AnalysisCard from './AnalysisCard';
import Chart from './Chart';
import Header from './Header';
import { AvailableRange, RangeValue } from './types';
import type { Dataset } from '../index';

const ChartWithCard = ({
  areSurveysFiltered,
  availableRanges,
  cardColumnJustification,
  chartEndDate,
  chartStartDate,
  chartTitle,
  chartWidth,
  datasets,
  disableMaxRange,
  hideYAxisUnits,
  id,
  isPickerErrored,
  pickerEndDate,
  pickerStartDate,
  pointId,
  range,
  showDatePickers,
  showRangeButtons,
  site,
  surveyPoint,
  timeZone,
  source,
  onEndDateChange,
  onStartDateChange,
  onRangeChange,
}: ChartWithCardProps) => {
  const classes = useStyles();
  const chartWidthClass = () => {
    switch (chartWidth) {
      case 'large':
        return classes.largeChart;
      case 'medium':
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
        availableRanges={availableRanges}
        timeZone={timeZone}
        showRangeButtons={showRangeButtons}
        surveyPoint={surveyPoint}
      />
      <Grid
        className={classes.chartWrapper}
        container
        justifyContent="space-between"
        item
        spacing={1}
      >
        <Grid className={classnames(classes.chart, chartWidthClass())} item>
          <Chart
            site={site}
            pointId={pointId}
            datasets={datasets}
            pickerStartDate={pickerStartDate}
            pickerEndDate={pickerEndDate}
            startDate={chartStartDate}
            endDate={chartEndDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            pickerErrored={isPickerErrored}
            surveysFiltered={areSurveysFiltered}
            hideYAxisUnits={hideYAxisUnits}
            showDatePickers={showDatePickers}
            source={source}
          />
        </Grid>
        {!isPickerErrored && (
          <Grid className={classes.card} item>
            <AnalysisCard
              datasets={datasets}
              pickerStartDate={pickerStartDate}
              pickerEndDate={pickerEndDate}
              chartStartDate={chartStartDate}
              chartEndDate={chartEndDate}
              columnJustification={cardColumnJustification}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  chartWrapper: {
    marginBottom: 20,
    [theme.breakpoints.down('xs')]: {
      marginBottom: 10,
    },
  },
  chart: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  largeChart: {
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 230px)', // width of 100% minus the card with one column
    },
  },
  mediumChart: {
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 240px)', // width of 100% minus the card with two columns
    },
  },
  smallChart: {
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 320px)', // width of 100% minus the card with three columns
    },
  },
  card: {
    width: 'fit-content',
    minWidth: 219,
    [theme.breakpoints.down('sm')]: {
      width: 'inherit',
      maxWidth: 'fit-content',
      margin: '0 auto',
    },
  },
}));

interface ChartWithCardProps {
  areSurveysFiltered?: boolean;
  availableRanges?: AvailableRange[];
  cardColumnJustification?: GridProps['justify'];
  chartEndDate: string;
  chartStartDate: string;
  chartTitle: string;
  chartWidth: 'small' | 'medium' | 'large';
  datasets: Dataset[];
  disableMaxRange: boolean;
  hideYAxisUnits?: boolean;
  id: string;
  isPickerErrored: boolean;
  pickerEndDate: string;
  pickerStartDate: string;
  pointId?: number;
  range: RangeValue | undefined;
  showDatePickers?: boolean;
  showRangeButtons?: boolean;
  site: Site;
  surveyPoint?: TimeSeriesSurveyPoint;
  timeZone?: string | null;
  source?: Sources;
  onEndDateChange: (date: Date | null) => void;
  onStartDateChange: (date: Date | null) => void;
  onRangeChange: (value: RangeValue) => void;
}

ChartWithCard.defaultProps = {
  areSurveysFiltered: undefined,
  cardColumnJustification: 'space-between',
  hideYAxisUnits: false,
  pointId: undefined,
  showDatePickers: true,
  showRangeButtons: true,
  surveyPoint: undefined,
  availableRanges: [],
  timeZone: undefined,
};

export default ChartWithCard;
