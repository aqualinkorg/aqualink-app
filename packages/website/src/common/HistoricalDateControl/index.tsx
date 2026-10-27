import React from 'react';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { useHistoricalDate } from 'hooks/useHistoricalDate';
import { utcToday } from 'helpers/historicalDate';

export default function HistoricalDateControl() {
  const { date, error, setDate } = useHistoricalDate();
  return (
    <Box p={2} bgcolor="background.paper">
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <TextField
          label="Daily snapshot (UTC)"
          type="date"
          size="small"
          value={date || ''}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: '0001-01-01', max: utcToday() }}
          error={Boolean(error)}
          onChange={(event) => setDate(event.target.value || undefined)}
        />
        {(date !== undefined || error) && (
          <Button onClick={() => setDate(undefined)}>Return to live</Button>
        )}
        <Typography variant="body2">
          {[
            error && 'Invalid date. Choose a valid date or return to live.',
            date &&
              'Daily observations only. Grey means no alert observation. Live overlays and forecasts are hidden.',
            'Viewing live data. Choose a date to view past daily observations.',
          ].find(Boolean)}
        </Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
