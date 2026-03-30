import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  createStyles,
  IconButton,
  makeStyles,
  Popover,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import DateRangeIcon from "@material-ui/icons/DateRange";
import ClearIcon from "@material-ui/icons/Clear";
import HistoryIcon from "@material-ui/icons/History";

interface DatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    label: {
      fontWeight: 600,
      color: theme.palette.text.secondary,
      whiteSpace: "nowrap",
      fontSize: "0.85rem",
    },
    activeDateLabel: {
      color: theme.palette.primary.main,
      fontWeight: 700,
      fontSize: "0.9rem",
    },
    popoverContent: {
      padding: theme.spacing(2),
      minWidth: 280,
    },
    popoverTitle: {
      fontWeight: 600,
      marginBottom: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    dateInput: {
      width: "100%",
    },
    buttonRow: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: theme.spacing(2),
    },
    clearButton: {
      color: theme.palette.error.main,
    },
    todayButton: {
      color: theme.palette.text.secondary,
    },
    iconButton: {
      padding: 6,
    },
    activeIndicator: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.main,
      display: "inline-block",
      marginRight: 4,
    },
  })
);

/**
 * Formats a Date to YYYY-MM-DD string for the native date input.
 */
const toInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns today as YYYY-MM-DD string (max selectable date).
 */
const getTodayInputValue = (): string => {
  return toInputValue(new Date());
};

/**
 * Returns a reasonable minimum date (Jan 1 2015) as YYYY-MM-DD string.
 * Aqualink data should be available from around this period.
 */
const getMinInputValue = (): string => {
  return "2015-01-01";
};

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [inputValue, setInputValue] = useState<string>(
    selectedDate ? toInputValue(selectedDate) : getTodayInputValue()
  );

  const isOpen = Boolean(anchorEl);

  const handleOpenPicker = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      // Sync input with current selected date or today
      setInputValue(selectedDate ? toInputValue(selectedDate) : getTodayInputValue());
    },
    [selectedDate]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    },
    []
  );

  const handleApply = useCallback(() => {
    if (!inputValue) {
      handleClose();
      return;
    }
    const parsed = new Date(inputValue + "T00:00:00");
    if (!isNaN(parsed.getTime())) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      // Don't allow future dates
      if (parsed > today) {
        onDateChange(new Date(today.setHours(0, 0, 0, 0)));
      } else {
        onDateChange(parsed);
      }
    }
    handleClose();
  }, [inputValue, onDateChange, handleClose]);

  const handleClear = useCallback(() => {
    onDateChange(null);
    setInputValue(getTodayInputValue());
    handleClose();
  }, [onDateChange, handleClose]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleApply();
      } else if (event.key === "Escape") {
        handleClose();
      }
    },
    [handleApply, handleClose]
  );

  const isHistoricalActive = selectedDate !== null;

  return (
    <Box className={classes.root}>
      <HistoryIcon fontSize="small" color={isHistoricalActive ? "primary" : "disabled"} />

      {isHistoricalActive ? (
        <Typography className={classes.activeDateLabel}>
          <span className={classes.activeIndicator} />
          {selectedDate!.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Typography>
      ) : (
        <Typography className={classes.label}>View historical date</Typography>
      )}

      <Tooltip title={isHistoricalActive ? "Change date" : "Select a past date"}>
        <IconButton
          className={classes.iconButton}
          onClick={handleOpenPicker}
          color={isHistoricalActive ? "primary" : "default"}
          size="small"
        >
          <DateRangeIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {isHistoricalActive && (
        <Tooltip title="Return to current data">
          <IconButton
            className={classes.iconButton}
            onClick={handleClear}
            size="small"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box className={classes.popoverContent}>
          <Typography variant="subtitle2" className={classes.popoverTitle}>
            <HistoryIcon fontSize="small" color="primary" />
            View map at a past date
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 12 }}>
            Select a date to explore historical reef data, including sea surface
            temperatures and bleaching alerts for that time.
          </Typography>
          <TextField
            label="Date"
            type="date"
            variant="outlined"
            size="small"
            className={classes.dateInput}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            inputProps={{
              max: getTodayInputValue(),
              min: getMinInputValue(),
            }}
            InputLabelProps={{ shrink: true }}
          />
          <Box className={classes.buttonRow}>
            {isHistoricalActive && (
              <Button
                size="small"
                className={classes.clearButton}
                onClick={handleClear}
              >
                Reset to today
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleApply}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default DatePicker;
