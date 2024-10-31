import { LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon-extensions';
import React from 'react';
import { ValueWithTimestamp } from 'store/Sites/types';

export interface DownloadCSVDialogProps {
  open: boolean;
  data: { name: string; values: ValueWithTimestamp[] }[];
  startDate: string;
  endDate: string;
  onClose: (
    shouldDownload: boolean,
    additionalData: boolean,
    allDates: boolean,
    hourly: boolean,
  ) => void;
  loading: boolean;
}

const additionalDataLabels = [
  'wave_mean_period_spotter',
  'wind_direction_spotter',
  'wave_mean_direction_spotter',
  'dhw_noaa',
  'temp_alert_noaa',
  'additional site-specific data when available',
];

const DownloadCSVDialog = ({
  onClose,
  open,
  data,
  startDate,
  endDate,
  loading,
}: DownloadCSVDialogProps) => {
  const classes = useStyles();
  const [additionalData, setAdditionalData] = React.useState(false);
  const [allDates, setAllDates] = React.useState(false);
  const [hourly, setHourly] = React.useState(false);

  const handleClose = (shouldDownload: boolean) => {
    if (shouldDownload) {
      onClose(true, additionalData, allDates, hourly);
    } else {
      onClose(false, false, false, true);
    }
  };

  React.useEffect(() => {
    if (open) {
      setAdditionalData(false);
      setAllDates(false);
      setHourly(false);
    }
  }, [open]);

  return (
    <Dialog
      scroll="paper"
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        if (reason === 'escapeKeyDown') handleClose(false);
      }}
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h4">Download CSV</Typography>
      </DialogTitle>
      {loading && <LinearProgress color="secondary" />}
      <DialogContent dividers className={classes.dialogContent}>
        <DialogContentText>
          Selected data to download into CSV format from{' '}
          {allDates ? (
            <span className={classes.bold}>all available dates</span>
          ) : (
            <>
              dates between{' '}
              <span className={classes.bold}>
                {DateTime.fromISO(startDate).toFormat('LL/dd/yyyy')}
              </span>{' '}
              and{' '}
              <span className={classes.bold}>
                {DateTime.fromISO(endDate).toFormat('LL/dd/yyyy')}
              </span>
            </>
          )}
        </DialogContentText>
        <DialogContentText>
          <FormGroup row>
            <Tooltip
              title="Download all additional data available from all sources for this site"
              placement="top"
              arrow
            >
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={additionalData}
                    onChange={() => setAdditionalData(!additionalData)}
                  />
                }
                label="Additional Data"
              />
            </Tooltip>
            <Tooltip
              title="Download data for all available dates"
              placement="top"
              arrow
            >
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={allDates}
                    onChange={() => setAllDates(!allDates)}
                  />
                }
                label="All Dates"
              />
            </Tooltip>
            <Tooltip title="Average data per hour" placement="top" arrow>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={hourly}
                    onChange={() => setHourly(!hourly)}
                  />
                }
                label="Hourly Data"
              />
            </Tooltip>
          </FormGroup>
          <div>
            <ul>
              {data.map((x) => (
                <li key={x.name}>{x.name}</li>
              ))}
            </ul>
          </div>
          {additionalData && (
            <div>
              Additional data may include:
              <ul>
                {additionalDataLabels.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={() => handleClose(true)} color="primary" autoFocus>
          {loading ? 'Loading...' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    overflowWrap: 'break-word',
  },
  bold: {
    fontWeight: 700,
  },
  dialogContent: {
    maxWidth: '31rem',
  },
}));

export default DownloadCSVDialog;
