import React from 'react';
import { Alert, Box, Grid, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Site } from 'store/Sites/types';
import { formatNumber } from 'helpers/numberUtils';
import { findIntervalByLevel } from 'helpers/bleachingAlertIntervals';
import {
  historicalChartRange,
  withHistoricalDate,
} from 'helpers/historicalDate';
import Chart from 'common/Chart';
import { standardDailyDataDataset } from 'common/Chart/MultipleSensorsCharts/helpers';

export default function HistoricalSiteSummary({ site }: { site: Site }) {
  const date = site.historicalDate!;
  const { satelliteTemperature, dhw, tempWeeklyAlert } =
    site.collectionData || {};
  const range = historicalChartRange(date);
  const values = [
    [
      'Surface temperature',
      satelliteTemperature == null
        ? 'No data'
        : `${formatNumber(satelliteTemperature, 1)} °C`,
    ],
    ['Heat stress', dhw == null ? 'No data' : `${formatNumber(dhw, 1)} DHW`],
    [
      'Weekly alert',
      tempWeeklyAlert == null
        ? 'No data'
        : findIntervalByLevel(tempWeeklyAlert).label,
    ],
  ];
  return (
    <Box my={3}>
      <Typography variant="h4">
        {site.name || site.region?.name || `Site ${site.id}`}
      </Typography>
      <Typography variant="h6">Daily snapshot: {date} (UTC)</Typography>
      <Link to={withHistoricalDate('/map', date)}>Back to historical map</Link>
      <Alert severity="info" sx={{ my: 2 }}>
        This view shows stored daily observations. Site names and locations are
        current metadata.
        {site.historicalObservedAt
          ? ` Observation timestamp: ${site.historicalObservedAt}.`
          : ' No daily observation is available for this date.'}
      </Alert>
      <Grid container spacing={2}>
        {values.map(([label, value]) => (
          <Grid item xs={12} sm={4} key={label}>
            <Paper sx={{ p: 2 }}>
              <Typography>{label}</Typography>
              <Typography variant="h5">{value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box mt={3} height={300}>
        <Typography>Daily surface temperature through {date} (UTC)</Typography>
        {site.dailyData.some((row) => row.satelliteTemperature != null) ? (
          <Chart
            siteId={site.id}
            datasets={[
              {
                ...standardDailyDataDataset(
                  site.dailyData,
                  site.maxMonthlyMean,
                  false,
                  'UTC',
                ),
                pointRadius: 3,
              },
            ]}
            startDate={range.start}
            endDate={range.end}
            timeZone="UTC"
            surveys={[]}
            temperatureThreshold={null}
            maxMonthlyMean={null}
            showYearInTicks
          />
        ) : (
          <Alert severity="info">
            No daily temperature observations in this 90-day period.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
