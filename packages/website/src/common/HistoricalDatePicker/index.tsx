import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Box,
  Button,
  DialogActions,
  Typography,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface HistoricalDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onClear?: () => void;
}

function HistoricalDatePicker({
  value,
  onChange,
  onClear,
}: HistoricalDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);

  const handleOpen = () => {
    setSelectedDate(value);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleApply = () => {
    onChange(selectedDate);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange(null);
    if (onClear) onClear();
    setOpen(false);
  };

  return (
    <>
      <Tooltip
        title={
          value
            ? `Viewing data from ${format(value, 'MMM dd, yyyy')}`
            : 'View historical data'
        }
      >
        <IconButton
          onClick={handleOpen}
          size="large"
          sx={{
            backgroundColor: value ? 'primary.main' : 'background.paper',
            color: value ? 'white' : 'text.secondary',
            '&:hover': {
              backgroundColor: value ? 'primary.dark' : 'action.hover',
            },
            boxShadow: 2,
          }}
        >
          <CalendarTodayIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Select Historical Date</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Typography variant="body2" color="text.secondary">
              Choose a date to view historical map and site data. This allows
              you to explore past coral bleaching events and temperature
              patterns.
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Historical Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                maxDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: 'Select a date to view historical data',
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClear} color="secondary">
            Clear & Show Current
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default HistoricalDatePicker;
