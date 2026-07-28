import React from 'react';
import classnames from 'classnames';
import { Grid, GridProps, Theme } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import { Site, Sources, TimeSeriesSurveyPoint } from 'store/Sites/types';
import AnalysisCard from './AnalysisCard';
import Chart from './Chart';
import Header from './Header';
import { AvailableRange, RangeValue } from './types';
import type { Dataset } from '../index';

const useStyles = makeStyles((theme: Theme) => ({
  chartWrapper: {
    marginBottom: 20,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 10,
    },
  },
  compactChartWrapper: {
    marginBottom: 4,
  },
  chart: {
    [theme.breakpoints.down('md')]: {
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
      width: 'calc(100% - 270px)', // width of 100% minus the card, widened for long unit labels (e.g. Enterococcus's "CFU/100 mL")
    },
  },
  extraSmallChart: {
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 320px)', // width of 100% minus the card with three columns
    },
  },
  hwoFixedChart: {
    [theme.breakpoints.up('lg')]: {
      width: 900,
    },
    [theme.breakpoints.between('md', 'lg')]: {
      width: 'calc(100% - 270px)', // same reserved space as the widest HWO card (Enterococcus), so nothing wraps between md and lg
    },
  },
  card: {
    width: 'fit-content',
    minWidth: 219,
    [theme.breakpoints.down('md')]: {
      width: 'inherit',
      maxWidth: 'fit-content',
      margin: '0 auto',
    },
  },
}));

function ChartWithCard({
  areSurveysFiltered,
  availableRanges = [],
  cardColumnJustification = 'space-between',
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
  showDatePickers = true,
  showRangeButtons = true,
  site,
  surveyPoint,
  timeZone,
  source,
  compact,
  crosshairSync,
  dohThresholdLabel,
  onEndDateChange,
  onStartDateChange,
  onRangeChange,
}: ChartWithCardProps) {
  const classes = useStyles();
  const chartWidthClass = () => {
    switch (chartWidth) {
      case 'large':
        return classes.largeChart;
      case 'medium':
        return classes.mediumChart;
      case 'small':
        return classes.smallChart;
      case 'hwoFixed':
        return classes.hwoFixedChart;
      default:
        return classes.extraSmallChart;
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
        compact={compact}
        dohThresholdLabel={dohThresholdLabel}
      />
      <Grid
        className={compact ? classes.compactChartWrapper : classes.chartWrapper}
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
            compact={compact}
            crosshairSync={crosshairSync}
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
              siteId={site.id}
              compact={compact}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
}

interface ChartWithCardProps {
  areSurveysFiltered?: boolean;
  availableRanges?: AvailableRange[];
  cardColumnJustification?: GridProps['justifyContent'];
  chartEndDate: string;
  chartStartDate: string;
  chartTitle: string;
  chartWidth: 'extraSmall' | 'small' | 'medium' | 'large' | 'hwoFixed';
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
  compact?: boolean;
  crosshairSync?: boolean;
  dohThresholdLabel?: string;
  onEndDateChange: (date: Date | null) => void;
  onStartDateChange: (date: Date | null) => void;
  onRangeChange: (value: RangeValue) => void;
}

export default ChartWithCard;
