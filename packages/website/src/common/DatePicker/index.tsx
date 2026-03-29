import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Tooltip,
  Typography,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { DatePicker as MuiDatePicker } from "@material-ui/pickers";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import RestoreIcon from "@material-ui/icons/Restore";
import { format, isValid, parseISO } from "date-fns";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  button: {
    textTransform: "none",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    borderRadius: theme.shape.borderRadius,
    padding: "6px 12px",
    fontSize: "0.875rem",
  },
  activeButton: {
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  popoverContent: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  popoverTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  resetButton: {
    marginTop: theme.spacing(1),
  },
  dateLabel: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
}));

export interface DatePickerProps {
  /** Currently selected date string (ISO format) or null for "today" */
  selectedDate: string | null;
  /** Called when user picks a new date */
  onDateChange: (date: string | null) => void;
  /** Minimum selectable date (ISO string) */
  minDate?: string;
  /** Maximum selectable date (ISO string), defaults to today */
  maxDate?: string;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const today = new Date();
  const maxDateObj = maxDate ? parseISO(maxDate) : today;
  const minDateObj = minDate ? parseISO(minDate) : new Date("2010-01-01");

  const selectedDateObj = selectedDate ? parseISO(selectedDate) : null;
  const isHistorical = selectedDateObj !== null;

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleDateChange = useCallback(
    (date: Date | null) => {
      if (date && isValid(date)) {
        onDateChange(format(date, "yyyy-MM-dd"));
        handleClose();
      }
    },
    [onDateChange, handleClose]
  );

  const handleReset = useCallback(() => {
    onDateChange(null);
    handleClose();
  }, [onDateChange, handleClose]);

  const open = Boolean(anchorEl);
  const id = open ? "date-picker-popover" : undefined;

  const buttonLabel = isHistorical
    ? format(selectedDateObj!, "MMM d, yyyy")
    : "View Historical Date";

  return (
    <Box className={classes.root}>
      <Tooltip
        title={
          isHistorical
            ? `Viewing data for ${format(selectedDateObj!, "MMMM d, yyyy")} — click to change`
            : "View map data for a past date"
        }
        arrow
      >
        <Button
          aria-describedby={id}
          variant="contained"
          size="small"
          startIcon={isHistorical ? <AccessTimeIcon /> : <RestoreIcon />}
          onClick={handleOpen}
          className={`${classes.button} ${
            isHistorical ? classes.activeButton : ""
          }`}
        >
          {buttonLabel}
        </Button>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box className={classes.popoverContent}>
          <Typography variant="subtitle2" className={classes.popoverTitle}>
            Select a historical date
          </Typography>
          <Typography variant="caption" className={classes.dateLabel}>
            View ocean temperatures and site conditions as of a specific date.
          </Typography>
          <MuiDatePicker
            autoOk
            orientation="landscape"
            variant="static"
            openTo="date"
            value={selectedDateObj || today}
            onChange={handleDateChange}
            minDate={minDateObj}
            maxDate={maxDateObj}
            disableFuture
          />
          {isHistorical && (
            <Button
              startIcon={<RestoreIcon />}
              onClick={handleReset}
              variant="outlined"
              size="small"
              className={classes.resetButton}
            >
              Return to Today
            </Button>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default DatePickerComponent;
