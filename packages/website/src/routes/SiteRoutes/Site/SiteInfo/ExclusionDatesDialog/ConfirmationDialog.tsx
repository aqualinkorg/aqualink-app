import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { grey } from '@mui/material/colors';
import { DateTime } from 'luxon-extensions';

const ConfirmationDialog = ({
  open,
  isConfirmLoading,
  start,
  end,
  timeZone,
  onClose,
  handleMaintainPeriodAddition,
}: ConfirmationDialogProps) => {
  const classes = useStyles();
  if (!start || !end) return null;

  const startDate = DateTime.fromJSDate(start).toFormat('LL/dd/yyyy HH:mm');
  const endDate = DateTime.fromJSDate(end).toFormat('LL/dd/yyyy HH:mm');

  return (
    <Dialog maxWidth="sm" fullWidth open={open} onClose={onClose}>
      <DialogContent className={classes.content}>
        <Typography color="textSecondary">
          Are you sure you want to proceed? Data between{' '}
          <span className={classes.bold}>
            {startDate} {timeZone}
          </span>{' '}
          and{' '}
          <span className={classes.bold}>
            {endDate} {timeZone}
          </span>{' '}
          will be lost.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          size="small"
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          size="small"
          disabled={isConfirmLoading}
          variant="outlined"
          onClick={handleMaintainPeriodAddition}
        >
          {isConfirmLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(() => ({
  content: {
    borderBottom: `1px solid ${grey[300]}`,
  },
  bold: {
    fontWeight: 700,
  },
}));

interface ConfirmationDialogProps {
  open: boolean;
  isConfirmLoading: boolean;
  start?: Date;
  end?: Date;
  timeZone: string;
  onClose: () => void;
  handleMaintainPeriodAddition: () => void;
}

export default ConfirmationDialog;
