import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import { WithStyles, styled } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { Link } from 'react-router-dom';
import { isNumber } from 'lodash';

import { formatNumber } from 'helpers/numberUtils';
import { displayTimeInLocalTimezone } from 'helpers/dates';
import { Sources } from 'store/Sites/types';
import { Dataset } from '..';

export const TOOLTIP_WIDTH = 220;

const Circle = styled('div')<{}, { color: string; size?: number }>(
  ({ size = 10, color: backgroundColor }) => ({
    marginRight: 5,
    marginTop: 3,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    display: 'inline-block',
  }),
);

// small helper to specify tha NOAA surface data is from satellite
const sourceTitle = (title: string, source: Sources | undefined) => {
  if (source === 'noaa' && title === 'SURFACE') {
    return ' (NOAA - SAT)';
  }
  return source ? ` (${source.toUpperCase()})` : '';
};

const TemperatureMetric = ({
  value,
  title,
  color,
  unit,
  gridClassName,
  source,
}: {
  value: number | null;
  title: string;
  color: string;
  unit: string;
  gridClassName: string | undefined;
  source?: Sources;
}) => (
  <Grid container item className={gridClassName}>
    <Circle color={color} />
    <Typography variant="caption">
      {title} {`${formatNumber(value, 1)} ${unit}`}
      {sourceTitle(title, source)}
    </Typography>
  </Grid>
);

const Tooltip = ({
  siteId,
  date,
  datasets,
  surveyId,
  siteTimeZone,
  userTimeZone,
  classes,
}: TooltipProps) => {
  const hasHourlyData = datasets.some(({ isDailyUpdated }) => !isDailyUpdated);
  const dateString = displayTimeInLocalTimezone({
    isoDate: date,
    format: `MM/dd/yy${hasHourlyData ? ' HH:mm a' : ''}`,
    displayTimezone: hasHourlyData,
    timeZone: userTimeZone,
    timeZoneToDisplay: siteTimeZone,
  });

  const tooltipLines: {
    value: number | null;
    color: string;
    title: string;
    unit: string;
    source?: Sources;
  }[] = datasets.map(
    ({ data, curveColor, label, unit, tooltipLabel, source }) => ({
      value: data[0]?.value,
      color: curveColor,
      title: tooltipLabel || label,
      unit,
      source,
    }),
  );

  return (
    <div className={classes.tooltip}>
      <Card className={classes.tooltipCard}>
        <CardHeader
          className={classes.tooltipHeader}
          title={
            <Typography
              color="textPrimary"
              variant="caption"
              style={{ whiteSpace: 'nowrap' }}
            >
              {dateString}
            </Typography>
          }
        />
        <CardContent className={classes.tooltipContent}>
          <Grid
            style={{ height: '100%' }}
            item
            container
            justifyContent="space-between"
          >
            <Grid
              container
              justifyContent="space-between"
              direction="column"
              alignItems="center"
              item
              xs={12}
            >
              {tooltipLines.map(
                (item) =>
                  isNumber(item.value) && (
                    <TemperatureMetric
                      key={`${item.color}_${item.value}`}
                      {...item}
                      gridClassName={classes.tooltipContentItem}
                      unit={item.unit}
                    />
                  ),
              )}
            </Grid>
            {surveyId && (
              <Grid item>
                <Link
                  className={classes.surveyLink}
                  to={`/sites/${siteId}/survey_details/${surveyId}`}
                >
                  <Button variant="contained" color="primary" size="small">
                    VIEW SURVEY
                  </Button>
                </Link>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <div
        className={classes.tooltipArrow}
        style={{
          borderColor: '#095877 transparent transparent transparent',
        }}
      />
    </div>
  );
};

const styles = () =>
  createStyles({
    tooltip: {
      display: 'flex',
      justifyContent: 'center',
      minHeight: 60,
      width: TOOLTIP_WIDTH,
    },
    tooltipCard: {
      display: 'flex',
      flexFlow: 'column',
      backgroundColor: '#095877',
      borderRadius: 8,
      paddingBottom: '0.5rem',
    },
    tooltipHeader: {
      flex: '0 1 auto',
      padding: '0.5rem 1rem 1rem',
      height: 30,
    },
    tooltipContent: {
      flex: '1 1 auto',
      padding: '0rem 1rem 0rem 1rem',
    },
    tooltipContentItem: {
      height: 20,
      margin: '0',
      display: 'flex',
      flexWrap: 'nowrap',
    },
    tooltipArrow: {
      content: ' ',
      position: 'absolute',
      top: '100%' /* At the bottom of the tooltip */,
      left: '50%',
      marginLeft: '-10px',
      borderWidth: '10px',
      borderStyle: 'solid',
      borderColor: '#095877 transparent transparent transparent',
    },
    surveyLink: {
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'none',
      },
    },
  });

export interface TooltipData {
  siteId: number;
  date: string;
  datasets: Dataset[];
  surveyId?: number | null;
  siteTimeZone?: string | null;
  userTimeZone?: string;
}

type TooltipProps = TooltipData & WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
