import React from 'react';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import DatePicker from 'common/Datepicker';
import {
  sitesListDateSelector,
  sitesListLoadingSelector,
} from 'store/Sites/sitesListSlice';
import { toDayString } from 'helpers/historicalDay';

const useStyles = makeStyles(() => ({
  root: {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
  },
}));

/**
 * Lets users look at the map as it was on a past day. `value` is the selected day
 * (YYYY-MM-DD) or undefined for the latest data.
 */
function HistoricalDateControl({
  value,
  onChange,
}: HistoricalDateControlProps) {
  const classes = useStyles();
  const loadedDate = useSelector(sitesListDateSelector);
  const loading = useSelector(sitesListLoadingSelector);
  const isUpdating = loading && (value ?? null) !== loadedDate;

  return (
    <Paper
      className={classes.root}
      elevation={2}
      data-testid="map-date-control"
    >
      <DatePicker
        value={value ?? toDayString(new Date())}
        dateName="Data on"
        dateNameTextVariant="subtitle2"
        timeZone="UTC"
        onChange={(date) => {
          if (!date || Number.isNaN(date.getTime())) return;
          const day = toDayString(date);
          onChange(day === toDayString(new Date()) ? undefined : day);
        }}
      />
      <Box width={20} display="flex" justifyContent="center">
        {isUpdating && <CircularProgress size={16} />}
      </Box>
      {value && (
        <Button size="small" onClick={() => onChange(undefined)}>
          Latest
        </Button>
      )}
    </Paper>
  );
}

interface HistoricalDateControlProps {
  value?: string;
  onChange: (day: string | undefined) => void;
}

export default HistoricalDateControl;
