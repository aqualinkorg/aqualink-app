import React, { useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { DateTime } from 'luxon-extensions';
import {
  formatHistoricalDate,
  isValidHistoricalDate,
  MIN_HISTORICAL_DATE,
} from 'helpers/historicalDate';
import { mapIconSize } from 'layout/App/theme';

// Calendar days are handled as local dates and converted to YYYY-MM-DD,
// so the selected day never shifts because of the browser's time zone.
const toLocalDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const yesterday = () =>
  toLocalDate(DateTime.utc().minus({ days: 1 }).toISODate() as string);

const useStyles = makeStyles(() => ({
  button: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    height: mapIconSize,
    width: mapIconSize,
    borderRadius: 5,
    margin: '10px',
    backgroundColor: 'white',
    backgroundClip: 'padding-box',
    border: '2px solid rgba(0,0,0,0.2)',
    left: 0,
    top: 140,
    zIndex: 1000,
  },
  banner: {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
  },
}));

function HistoricalDateControl({
  date,
  loading = false,
  onChange,
}: HistoricalDateControlProps) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(null);

  const openDialog = () => {
    setDraft(date ? toLocalDate(date) : yesterday());
    setOpen(true);
  };

  const draftValue = draft ? format(draft, 'yyyy-MM-dd') : undefined;
  const canApply = isValidHistoricalDate(draftValue) && draftValue !== date;

  const onApply = () => {
    if (canApply) {
      onChange(draftValue);
    }
    setOpen(false);
  };

  const onReset = () => {
    onChange(undefined);
    setOpen(false);
  };

  return (
    <>
      <div className={classes.button}>
        <Tooltip title="View the map on a past date" placement="left">
          <IconButton
            aria-label="Select historical date"
            onClick={openDialog}
            size="large"
          >
            <CalendarMonthIcon color={date ? 'secondary' : 'primary'} />
          </IconButton>
        </Tooltip>
      </div>
      {date && (
        <div className={classes.banner}>
          <Chip
            color="primary"
            icon={<HistoryIcon />}
            label={
              loading
                ? `Loading ${formatHistoricalDate(date)}…`
                : `Showing ${formatHistoricalDate(date)}`
            }
            onClick={openDialog}
            onDelete={onReset}
            data-testid="historical-date-chip"
          />
        </div>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>View the map on a past date</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Site colors and values show the heat stress as of the end of the
            selected day (UTC). Map overlays are only available for the latest
            data.
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={draft}
              onChange={(value: Date | null) => setDraft(value)}
              minDate={toLocalDate(MIN_HISTORICAL_DATE)}
              maxDate={yesterday()}
              views={['year', 'month', 'day']}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={onReset} disabled={!date}>
            Back to latest
          </Button>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onApply} variant="contained" disabled={!canApply}>
            Show date
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

interface HistoricalDateControlProps {
  /** Selected historical date (YYYY-MM-DD), undefined for the latest data */
  date?: string;
  loading?: boolean;
  onChange: (date: string | undefined) => void;
}

export default HistoricalDateControl;
