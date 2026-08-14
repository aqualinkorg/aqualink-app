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
import { snakeCase } from 'lodash';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { siteTimeSeriesDataLoadingSelector } from 'store/Sites/selectedSiteSlice';
import { formatNumber } from 'helpers/numberUtils';
import { DateTime } from 'luxon-extensions';
import {
  getHwoIconConfig,
  HwoMetricsKeys,
} from 'common/SiteDetails/WaterSampling/utils';
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
  siteId,
  compact,
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
      metric,
    }) => {
      const metricKey = metric
        ? (snakeCase(metric) as HwoMetricsKeys)
        : undefined;
      const hwoMetric =
        metricKey &&
        [
          'enterococcus',
          'nitrogen_total',
          'turbidity',
          'salinity',
          'phosphorus_total',
        ].includes(metricKey)
          ? metricKey
          : undefined;
      const computedRows = calculateCardMetrics(
        chartStartDate,
        chartEndDate,
        data,
        label,
      );

      return {
        title: cardColumnName || label,
        color: curveColor,
        display: !!displayCardColumn,
        key: label,
        rows: hwoMetric
          ? computedRows.map((row) => ({
              ...row,
              ...(row.value !== undefined
                ? getHwoIconConfig(siteId, hwoMetric, row.value)
                : {}),
            }))
          : computedRows,
        unit,
        tooltip: cardColumnTooltip,
        decimalPlaces,
      };
    },
  );

  const formattedpickerStartDate =
    DateTime.fromISO(pickerStartDate).toFormat('LL/dd/yyyy');
  const formattedpickerEndDate =
    DateTime.fromISO(pickerEndDate).toFormat('LL/dd/yyyy');
  const compactColumn = compact
    ? cardColumns.find((item) => item.display)
    : undefined;
  const hwoSourceTooltip = (
    <span>
      Data collected by{' '}
      <a
        href="https://www.hawaiiwaiola.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#4FC3F7' }}
      >
        Hawai&apos;i Wai Ola
      </a>
    </span>
  );

  return (
    <Box
      height="100%"
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
      minWidth={220}
    >
      <Card
        className={classNames(
          classes.AnalysisCardCard,
          compact && classes.compactCard,
        )}
      >
        <Grid
          className={classes.dateRow}
          container
          justifyContent="space-between"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item>
            <Typography variant="subtitle1" color="textSecondary">
              {formattedpickerStartDate} - {formattedpickerEndDate}
            </Typography>
          </Grid>
          {compactColumn && (
            <Grid item>
              <Tooltip title={hwoSourceTooltip}>
                <Typography
                  style={{ color: compactColumn.color, cursor: 'pointer' }}
                  variant="subtitle2"
                >
                  {compactColumn.title}
                </Typography>
              </Tooltip>
            </Grid>
          )}
        </Grid>

        {compact ? (
          <Grid container direction="column" spacing={1}>
            {cardColumns
              .filter((item) => item.display)
              .flatMap((item) =>
                item.rows.map(({ key, value, iconType, iconColor }, index) => (
                  <Grid key={key} item>
                    <Box display="flex" alignItems="center">
                      <Typography
                        className={classes.compactRowLabel}
                        variant="caption"
                        color="textSecondary"
                      >
                        {rows[index]}
                      </Typography>
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
                      {iconType === 'check' && (
                        <CheckCircleOutlineIcon
                          className={classes.values}
                          style={{ fontSize: '1.1em', color: iconColor }}
                        />
                      )}
                      {iconType === 'warning' && (
                        <WarningIcon
                          className={classes.values}
                          style={{ fontSize: '1.1em', color: iconColor }}
                        />
                      )}
                    </Box>
                  </Grid>
                )),
              )}
          </Grid>
        ) : (
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
                      {item.rows.map(({ key, value, iconType, iconColor }) => (
                        <Grid key={key} item>
                          <Box display="flex" alignItems="center">
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
                            {iconType === 'check' && (
                              <CheckCircleOutlineIcon
                                className={classes.values}
                                style={{ fontSize: '1.1em', color: iconColor }}
                              />
                            )}
                            {iconType === 'warning' && (
                              <WarningIcon
                                className={classes.values}
                                style={{ fontSize: '1.1em', color: iconColor }}
                              />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                ),
            )}
          </Grid>
        )}
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
    compactCard: {
      minHeight: 150,
      padding: theme.spacing(1),
      margin: '4px 0',
    },
    dateRow: {
      marginBottom: theme.spacing(1.5),
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
    compactRowLabel: {
      minWidth: 40,
      marginRight: theme.spacing(1),
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
  siteId: number;
  compact?: boolean;
}

export default withStyles(styles)(AnalysisCard);
