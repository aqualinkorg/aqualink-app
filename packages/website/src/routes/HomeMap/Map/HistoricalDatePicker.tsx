import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import {
  Box,
  IconButton,
  Tooltip,
  Theme,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, subDays } from 'date-fns';
import {
  selectedDateSelector,
  setSelectedDate,
} from 'store/Homepage/homepageSlice';

function HistoricalDatePicker({ classes }: HistoricalDatePickerProps) {
  const dispatch = useAppDispatch();
  const selectedDate = useSelector(selectedDateSelector);
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (date: Date | null) => {
    if (date && !Number.isNaN(date.getTime())) {
      dispatch(setSelectedDate(format(date, 'yyyy-MM-dd')));
    }
  };

  const handleClear = () => {
    dispatch(setSelectedDate(null));
  };

  const handleToggle = () => {
    if (selectedDate) {
      handleClear();
    } else {
      setOpen(true);
    }
  };

  return (
    <div className={classes.container}>
      {selectedDate ? (
        <Box className={classes.dateDisplay}>
          <Typography variant="caption" className={classes.label}>
            Viewing:
          </Typography>
          <Typography variant="body2" className={classes.dateText}>
            {format(parseISO(selectedDate), 'MMM d, yyyy')}
          </Typography>
          <Tooltip title="Return to live data">
            <IconButton size="small" onClick={handleClear} className={classes.clearButton}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Tooltip title="View historical data">
          <IconButton onClick={handleToggle} size="large">
            <HistoryIcon color="primary" />
          </IconButton>
        </Tooltip>
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={selectedDate ? parseISO(selectedDate) : null}
          onChange={handleDateChange}
          maxDate={subDays(new Date(), 1)}
          minDate={new Date('2018-01-01')}
          slotProps={{
            textField: {
              className: classes.hiddenInput,
              size: 'small',
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'absolute',
      top: 10,
      left: 55,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    dateDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'white',
      borderRadius: 5,
      padding: '4px 8px',
      border: '2px solid rgba(0,0,0,0.2)',
      backgroundClip: 'padding-box',
    },
    label: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
    },
    dateText: {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    clearButton: {
      marginLeft: 2,
      padding: 2,
    },
    hiddenInput: {
      '& .MuiInputBase-root': {
        display: 'none',
      },
    },
  });

type HistoricalDatePickerProps = WithStyles<typeof styles>;

export default withStyles(styles)(HistoricalDatePicker);
