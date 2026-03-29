import React, { useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  makeStyles,
} from "@material-ui/core";
import HistoryIcon from "@material-ui/icons/History";
import CloseIcon from "@material-ui/icons/Close";
import { format, isValid, parseISO } from "date-fns";

interface DatePickerProps {
  selectedDate: string | null;
  onChange: (date: string | null) => void;
  maxDate?: string; // ISO string, defaults to today
  minDate?: string; // ISO string
  label?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  dateField: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    "& .MuiOutlinedInput-root": {
      height: 36,
    },
    "& .MuiInputLabel-outlined": {
      transform: "translate(14px, 10px) scale(1)",
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
      },
    },
  },
  activeLabel: {
    color: theme.palette.warning.main,
    fontWeight: 700,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  resetButton: {
    padding: 4,
    color: theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.error.main,
    },
  },
  historyIcon: {
    color: theme.palette.warning.main,
    marginRight: 2,
  },
}));

const today = () => format(new Date(), "yyyy-MM-dd");

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  maxDate,
  minDate,
  label = "View historical date",
}) => {
  const classes = useStyles();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) {
        onChange(null);
        return;
      }
      const parsed = parseISO(val);
      if (isValid(parsed)) {
        onChange(val);
      }
    },
    [onChange]
  );

  const handleReset = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const resolvedMax = maxDate || today();

  return (
    <Box className={classes.root}>
      {selectedDate && (
        <Tooltip title="Viewing historical data">
          <Typography className={classes.activeLabel} variant="caption">
            <HistoryIcon
              className={classes.historyIcon}
              style={{ fontSize: 14, verticalAlign: "middle" }}
            />
            {format(parseISO(selectedDate), "MMM d, yyyy")}
          </Typography>
        </Tooltip>
      )}
      <TextField
        className={classes.dateField}
        label={label}
        type="date"
        size="small"
        variant="outlined"
        value={selectedDate || ""}
        onChange={handleChange}
        inputProps={{
          max: resolvedMax,
          ...(minDate ? { min: minDate } : {}),
        }}
        InputLabelProps={{ shrink: true }}
      />
      {selectedDate && (
        <Tooltip title="Reset to today">
          <IconButton
            className={classes.resetButton}
            size="small"
            onClick={handleReset}
            aria-label="Reset to today"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {selectedDate && (
        <Tooltip title="Go to today">
          <Button
            size="small"
            variant="outlined"
            onClick={handleReset}
            style={{ whiteSpace: "nowrap", height: 36 }}
          >
            Today
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default DatePicker;
