import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import RestoreIcon from '@mui/icons-material/Restore';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import {
  selectedDateSelector,
  setSelectedDate,
  sitesRequest,
} from 'store/Sites/sitesListSlice';
import {
  getTodayUtcDateString,
  isValidHistoricalDate,
} from 'store/Sites/historicalDateHelpers';

export interface HistoricalDatePickerProps {
  variant?: 'map' | 'site';
}

interface HistoricalDialogProps {
  open: boolean;
  draftDate: string;
  selectedDate: string | null;
  onDraftChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

const MAP_CONTAINER_STYLE: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 150,
  zIndex: 400,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  margin: 10,
};

const MAP_ICON_WRAPPER_STYLE: React.CSSProperties = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  width: 40,
  borderRadius: 5,
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  border: '2px solid rgba(0,0,0,0.2)',
};

const ACTIVE_CHIP_STYLE: React.CSSProperties = {
  backgroundColor: 'white',
  fontWeight: 600,
  border: '1px solid rgba(0,0,0,0.2)',
};

const SITE_BAR_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 12,
};

function HistoricalDateDialog({
  open,
  draftDate,
  selectedDate,
  onDraftChange,
  onApply,
  onReset,
  onClose,
}: HistoricalDialogProps) {
  const maxDate = getTodayUtcDateString();
  const canApply = isValidHistoricalDate(draftDate);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>View Historical Map &amp; Site Data</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Select a past UTC date to inspect historical coral bleaching alert
          levels and satellite sea surface temperatures.
        </Typography>
        <Box mt={2}>
          <TextField
            label="Historical date (UTC)"
            type="date"
            fullWidth
            value={draftDate}
            onChange={(event) => onDraftChange(event.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              max: maxDate,
              'aria-label': 'Historical date',
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        {selectedDate && (
          <Button
            onClick={onReset}
            color="secondary"
            startIcon={<RestoreIcon />}
          >
            Reset to Latest
          </Button>
        )}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onApply}
          color="primary"
          variant="contained"
          disabled={!canApply}
        >
          Apply Date
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Provides a calendar icon control and modal dialog to browse historical map and
 * site data for a past date, keeping Redux state and URL query parameters synchronized.
 */
function HistoricalDatePicker({
  variant = 'map',
}: HistoricalDatePickerProps) {
  const dispatch = useAppDispatch();
  const selectedDate = useSelector(selectedDateSelector) ?? null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<string>(
    selectedDate || getTodayUtcDateString(),
  );

  useEffect(() => {
    setDraftDate(selectedDate || getTodayUtcDateString());
  }, [selectedDate]);

  const commitDate = (nextDate: string | null) => {
    dispatch(setSelectedDate(nextDate));
    dispatch(sitesRequest(nextDate));
    setDialogOpen(false);
  };

  const handleApply = () => {
    if (isValidHistoricalDate(draftDate)) {
      commitDate(draftDate);
    }
  };

  const handleReset = () => {
    commitDate(null);
  };

  return (
    <>
      {variant === 'map' ? (
        <div style={MAP_CONTAINER_STYLE}>
          {selectedDate && (
            <Chip
              label={`Historical: ${selectedDate}`}
              onDelete={handleReset}
              onClick={() => setDialogOpen(true)}
              color="primary"
              variant="outlined"
              style={ACTIVE_CHIP_STYLE}
            />
          )}
          <div style={MAP_ICON_WRAPPER_STYLE}>
            <Tooltip title="View historical data by date">
              <IconButton
                aria-label="Open historical date selector"
                onClick={() => setDialogOpen(true)}
                size="large"
              >
                <EventIcon color="primary" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div style={SITE_BAR_STYLE}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<EventIcon />}
            onClick={() => setDialogOpen(true)}
          >
            {selectedDate
              ? `Historical Date: ${selectedDate}`
              : 'View Historical Date'}
          </Button>
          {selectedDate && (
            <Button
              variant="text"
              color="primary"
              size="small"
              startIcon={<RestoreIcon />}
              onClick={handleReset}
            >
              Reset to Latest
            </Button>
          )}
        </div>
      )}
      <HistoricalDateDialog
        open={dialogOpen}
        draftDate={draftDate}
        selectedDate={selectedDate}
        onDraftChange={setDraftDate}
        onApply={handleApply}
        onReset={handleReset}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

export default HistoricalDatePicker;
