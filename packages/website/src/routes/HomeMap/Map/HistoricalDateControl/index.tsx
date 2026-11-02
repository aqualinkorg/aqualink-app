import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Popover,
  Tooltip,
  Theme,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { formatHistoricalDate, todayUtc } from 'helpers/historicalDate';
import { mapIconSize } from 'layout/App/theme';

const MIN_DATE = parseISO('1985-01-01');

function HistoricalDateControl({
  date,
  onChange,
  classes,
}: HistoricalDateControlProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const close = () => setAnchorEl(null);

  const onSelect = (value: Date | null) => {
    if (!value || Number.isNaN(value.getTime())) return;
    const selected = format(value, 'yyyy-MM-dd');
    onChange(selected >= todayUtc() ? undefined : selected);
    close();
  };

  const onReset = () => {
    onChange(undefined);
    close();
  };

  return (
    <>
      <div className={classes.button}>
        <Tooltip title="View the map on a past date">
          <IconButton
            aria-label="Select a date"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="large"
          >
            <CalendarMonthIcon color="primary" />
          </IconButton>
        </Tooltip>
      </div>
      {date && (
        <Chip
          className={classes.chip}
          color="primary"
          label={`Showing data for ${formatHistoricalDate(date)}`}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          onDelete={onReset}
          data-testid="historical-date-chip"
        />
      )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={date ? parseISO(date) : null}
            onChange={onSelect}
            minDate={MIN_DATE}
            maxDate={parseISO(todayUtc())}
          />
        </LocalizationProvider>
        <Box display="flex" justifyContent="flex-end" px={2} pb={2}>
          <Button onClick={onReset} disabled={!date} size="small">
            Show latest data
          </Button>
        </Box>
      </Popover>
    </>
  );
}

const styles = (theme: Theme) =>
  createStyles({
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
      right: 0,
      top: 150,
      zIndex: 400,
      [theme.breakpoints.down('lg')]: {
        top: 100,
      },
    },
    chip: {
      position: 'absolute',
      top: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 400,
    },
  });

interface HistoricalDateControlIncomingProps {
  /** Selected day (YYYY-MM-DD), undefined when showing the latest data. */
  date?: string;
  onChange: (date?: string) => void;
}

type HistoricalDateControlProps = HistoricalDateControlIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(HistoricalDateControl);
