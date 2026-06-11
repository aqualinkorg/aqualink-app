import React, { useState } from 'react';
import { Theme, IconButton, Popover, Box, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DateTime } from 'luxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { mapIconSize } from 'layout/App/theme';

interface DateFilterProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  classes: Record<string, string>;
}

function DateFilter({ selectedDate, onDateChange, classes }: DateFilterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateChange = (date: Date | null) => {
    onDateChange(date);
    if (date) {
      handleClose();
    }
  };

  const handleClear = () => {
    onDateChange(null);
    handleClose();
  };

  const formattedDate = selectedDate
    ? DateTime.fromJSDate(selectedDate).toFormat('MMM dd, yyyy')
    : null;

  return (
    <>
      <div className={classes.dateFilterButton}>
        <IconButton onClick={handleClick} size="large">
          <CalendarTodayIcon
            color={selectedDate ? 'primary' : 'inherit'}
            className={classes.icon}
          />
        </IconButton>
        {formattedDate && (
          <Typography
            variant="caption"
            className={classes.dateLabel}
            color="primary"
          >
            {formattedDate}
          </Typography>
        )}
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box p={2} className={classes.popover}>
          <Typography variant="subtitle2" gutterBottom>
            View map data for date:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              minDate={DateTime.fromISO('2020-01-01').toJSDate()}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
          {selectedDate && (
            <Box mt={1}>
              <Typography
                variant="caption"
                color="primary"
                className={classes.clearButton}
                onClick={handleClear}
                role="button"
              >
                Clear date filter
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}

const mapButtonStyles = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute' as const,
  height: mapIconSize,
  width: mapIconSize,
  borderRadius: 5,
  margin: '10px',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  border: '2px solid rgba(0,0,0,0.2)',
};

const styles = (theme: Theme) =>
  createStyles({
    dateFilterButton: {
      ...mapButtonStyles,
      left: 0,
      top: 140,
      zIndex: 1000,
      flexDirection: 'column',
    },
    icon: {
      fontSize: '24px',
    },
    dateLabel: {
      fontSize: '9px',
      marginTop: -4,
      whiteSpace: 'nowrap',
    },
    popover: {
      minWidth: 280,
    },
    clearButton: {
      cursor: 'pointer',
      textDecoration: 'underline',
      '&:hover': {
        color: theme.palette.primary.dark,
      },
    },
  });

export default withStyles(styles)(DateFilter);
