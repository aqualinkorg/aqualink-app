import React from 'react';
import {
  Box,
  Card,
  Grid,
  GridProps,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import { siteTimeSeriesDataLoadingSelector } from 'store/Sites/selectedSiteSlice';
import { formatNumber } from 'helpers/numberUtils';
import { DateTime } from 'luxon-extensions';
import { calculateCardMetrics } from './helpers';
import { CardColumn } from './types';
import type { Dataset } from '..';

const rows = ['MAX', 'MEAN', 'MIN'];

/* eslint-disable react/prop-types */
function AnalysisCard({
  classes,
  datasets,
  pickerStartDate,
  pickerEndDate,
  chartStartDate,
  chartEndDate,
  columnJustification,
  children,
}: AnalysisCardProps) {
  const loading = useSelector(siteTimeSeriesDataLoadingSelector);
  const hasData = datasets.some(({ displayData }) => displayData);
  const nColumns = datasets.filter(
    ({ displayCardColumn }) => displayCardColumn,
  ).length;
  const showCard = !loading && hasData;
  const isCardSmall = nColumns === 1;

  if (!showCard) {
    return null;
  }

  const cardColumns: CardColumn[] = datasets.map(
    ({
      label,
      curveColor,
      data,
      unit,
      displayCardColumn,
      cardColumnName,
      cardColumnTooltip,
      decimalPlaces,
    }) => ({
      title: cardColumnName || label,
      color: curveColor,
      display: !!displayCardColumn,
      key: label,
      rows: calculateCardMetrics(chartStartDate, chartEndDate, data, label),
      unit,
      tooltip: cardColumnTooltip,
      decimalPlaces,
    }),
  );

  const formattedpickerStartDate =
    DateTime.fromISO(pickerStartDate).toFormat('LL/dd/yyyy');
  const formattedpickerEndDate =
    DateTime.fromISO(pickerEndDate).toFormat('LL/dd/yyyy');

  return (
    <Box
      height="100%"
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
      minWidth={220}
    >
      <Card className={classes.AnalysisCardCard}>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {formattedpickerStartDate} -{formattedpickerEndDate}
        </Typography>
        <Grid
          className={classes.metricsWrapper}
          container
          justifyContent={columnJustification || 'space-between'}
          alignItems="flex-end"
          spacing={isCardSmall ? 2 : 1}
        >
          <Grid item xs={isCardSmall ? 2 : undefined}>
            <Grid
              className={classes.metricsTitle}
              container
              direction="column"
              item
              spacing={3}
            >
              {rows.map((row) => (
                <Grid key={row} className={classes.rotatedText} item>
                  <Typography variant="caption" color="textSecondary">
                    {row}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          {cardColumns.map(
            (item) =>
              item.display && (
                <Grid key={item.key} item xs={isCardSmall ? 10 : undefined}>
                  <Grid
                    className={classes.autoWidth}
                    container
                    direction="column"
                    item
                    spacing={3}
                    alignItems="flex-start"
                  >
                    <Grid item>
                      <Tooltip title={item.tooltip || ''}>
                        <Typography
                          className={classes.values}
                          style={{
                            color: item.color,
                          }}
                          variant="subtitle2"
                        >
                          {item.title}
                        </Typography>
                      </Tooltip>
                    </Grid>
                    {item.rows.map(({ key, value }) => (
                      <Grid key={key} item>
                        <Typography
                          className={classNames(
                            classes.values,
                            classes.lightFont,
                          )}
                          variant="h5"
                          color="textSecondary"
                        >
                          {formatNumber(value, item.decimalPlaces ?? 1)}{' '}
                          {item.unit}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ),
          )}
        </Grid>
      </Card>

      {children}
    </Box>
  );
}
const styles = (theme: Theme) =>
  createStyles({
    autoWidth: {
      width: 'auto',
    },
    AnalysisCardCard: {
      padding: theme.spacing(2),
      minHeight: 240,
      borderRadius: '0 4px 4px 0',
      backgroundColor: '#f8f9f9',
      margin: '14px 0',
      // add horizontal scroll on mobile
      overflowX: 'auto',
    },
    rotatedText: {
      transform: 'rotate(-90deg)',
    },
    // ensures wrapping never happens no matter the column amount.
    metricsWrapper: { minWidth: 'max-content' },
    metricsTitle: {
      position: 'relative',
      bottom: 7,
      left: -12,
      width: 'auto',
    },
    lightFont: {
      fontWeight: 200,
    },
    values: {
      // ensures metric numbers aren't too close together on mobile
      margin: theme.spacing(0, 0.3),
    },

    extraPadding: {
      paddingLeft: theme.spacing(1),
    },
  });

interface AnalysisCardProps
  extends AnalysisCardIncomingProps, WithStyles<typeof styles> {}

interface AnalysisCardIncomingProps {
  datasets: Dataset[];
  pickerStartDate: string;
  pickerEndDate: string;
  chartStartDate: string;
  chartEndDate: string;
  columnJustification?: GridProps['justifyContent'];
  children?: React.ReactNode;
}

export default withStyles(styles)(AnalysisCard);
