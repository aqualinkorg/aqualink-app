import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Tooltip,
  Theme,
  Typography,
  Box,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useAppDispatch } from 'store/hooks';
import {
  historicalDateSelector,
  setHistoricalDate,
} from 'store/Homepage/homepageSlice';
import { sitesRequest } from 'store/Sites/sitesListSlice';
import { mapIconSize } from 'layout/App/theme';

function HistoricalDatePicker({ classes }: HistoricalDatePickerProps) {
  const dispatch = useAppDispatch();
  const historicalDate = useSelector(historicalDateSelector);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const handleDateChange = useCallback(
    (date: Date | null) => {
      if (date && !Number.isNaN(date.getTime())) {
        const dateStr = format(date, 'yyyy-MM-dd');
        dispatch(setHistoricalDate(dateStr));
        dispatch(sitesRequest(dateStr));
      }
      setPickerOpen(false);
    },
    [dispatch],
  );

  const handleClear = useCallback(() => {
    dispatch(setHistoricalDate(null));
    dispatch(sitesRequest());
  }, [dispatch]);

  const isActive = Boolean(historicalDate);

  return (
    <div className={classes.container}>
      {isActive && (
        <Box className={classes.dateLabel}>
          <Typography variant="caption" className={classes.dateLabelText}>
            {historicalDate}
          </Typography>
          <IconButton
            size="small"
            onClick={handleClear}
            className={classes.clearButton}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Tooltip title="View historical data">
        <IconButton
          onClick={() => setPickerOpen(true)}
          className={isActive ? classes.activeButton : classes.button}
          size="large"
        >
          <CalendarTodayIcon
            color={isActive ? 'inherit' : 'primary'}
            fontSize="small"
          />
        </IconButton>
      </Tooltip>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          value={historicalDate ? new Date(historicalDate) : null}
          onChange={handleDateChange}
          maxDate={new Date()}
          minDate={new Date('2000-01-01')}
          slotProps={{
            textField: {
              className: classes.hiddenInput,
            },
            toolbar: { hidden: true },
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
      right: 0,
      top: 150,
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      margin: '10px',
      [theme.breakpoints.down('lg')]: {
        top: 100,
      },
    },
    button: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: mapIconSize,
      width: mapIconSize,
      borderRadius: 5,
      backgroundColor: 'white',
      backgroundClip: 'padding-box',
      border: '2px solid rgba(0,0,0,0.2)',
    },
    activeButton: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: mapIconSize,
      width: mapIconSize,
      borderRadius: 5,
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      backgroundClip: 'padding-box',
      border: '2px solid rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    dateLabel: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.primary.main,
      borderRadius: 4,
      padding: '2px 4px 2px 8px',
      marginBottom: 4,
    },
    dateLabelText: {
      color: 'white',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    clearButton: {
      color: 'white',
      padding: 2,
      marginLeft: 2,
    },
    hiddenInput: {
      position: 'absolute',
      width: 0,
      height: 0,
      overflow: 'hidden',
      opacity: 0,
      pointerEvents: 'none',
    },
  });

type HistoricalDatePickerProps = WithStyles<typeof styles>;

export default withStyles(styles)(HistoricalDatePicker);
