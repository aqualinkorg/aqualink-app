import React, { useState } from 'react';
import { Box, Button, IconButton, Popover, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import EventIcon from '@mui/icons-material/Event';
import { format } from 'date-fns';
import DatePicker from 'common/Datepicker';

function MapDateControl({
  historicalDate,
  onDateChange,
  anomalyChecking,
  anomalyAvailable,
  classes,
}: MapDateControlProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClose = () => setAnchorEl(null);

  const handleDateChange = (date: Date | null) => {
    onDateChange(date ? format(date, 'yyyy-MM-dd') : null);
  };

  const handleBackToLive = () => {
    onDateChange(null);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="large"
      >
        <EventIcon color={historicalDate ? 'secondary' : 'primary'} />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box className={classes.panel}>
          <Typography variant="subtitle2">View a past date</Typography>
          <DatePicker
            value={historicalDate ?? null}
            dateName="Date"
            timeZone="UTC"
            onChange={handleDateChange}
          />
          {historicalDate && (
            <Button size="small" onClick={handleBackToLive}>
              Back to live view
            </Button>
          )}
          {historicalDate && anomalyChecking && (
            <Typography variant="caption" color="textSecondary">
              Checking the satellite record for this date...
            </Typography>
          )}
          {historicalDate && !anomalyChecking && !anomalyAvailable && (
            <Typography variant="caption" color="error">
              The SST anomaly layer has no archived file for this date: NCEI
              keeps only the most recent days of the preliminary grid. The
              layers below are unaffected.
            </Typography>
          )}
          <Typography variant="caption" color="textSecondary">
            Select the &quot;SST Anomaly&quot; map layer to see satellite data
            for the chosen date. Other layers and sensor readings stay live.
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

const styles = () =>
  createStyles({
    panel: {
      padding: '1rem',
      maxWidth: 240,
    },
  });

interface MapDateControlIncomingProps {
  historicalDate?: string | null;
  onDateChange: (date: string | null) => void;
  /** True while the anomaly file for the selected date is being probed. */
  anomalyChecking: boolean;
  /** False when NCEI no longer serves an anomaly file for that date. */
  anomalyAvailable: boolean;
}

type MapDateControlProps = WithStyles<typeof styles> &
  MapDateControlIncomingProps;

export default withStyles(styles)(MapDateControl);
