import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon-extensions';
import { useHistoricalDate } from 'hooks/useHistoricalDate';
import {
  validHistoricalDate,
  withHistoricalDate,
} from 'helpers/historicalDate';

export default function HistoricalDate() {
  const asOf = useHistoricalDate();
  const location = useLocation();
  const navigate = useNavigate();
  const rawDate = new URLSearchParams(location.search).get('asOf');
  const invalid = Boolean(rawDate && !asOf);
  const changeDate = (value?: string) => {
    if (value && !validHistoricalDate(value)) return;
    const params = new URLSearchParams(location.search);
    params.delete('start');
    params.delete('end');
    navigate(
      withHistoricalDate(
        `${location.pathname}?${params}${location.hash}`,
        value,
      ),
    );
  };
  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      px={2}
      py={1}
    >
      <TextField
        label="Data date (UTC)"
        type="date"
        size="small"
        value={asOf || ''}
        onChange={(event) => changeDate(event.target.value || undefined)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: DateTime.utc().toISODate() }}
        error={invalid}
        helperText={invalid ? 'Invalid date. Showing current data.' : undefined}
      />
      <Typography variant="body2">
        {asOf ? `Observations through ${asOf} (UTC)` : 'Current data'}
      </Typography>
      {asOf && (
        <Button onClick={() => changeDate()}>Return to current data</Button>
      )}
    </Box>
  );
}
