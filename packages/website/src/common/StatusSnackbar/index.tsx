import React from 'react';
import {
  Button,
  Snackbar,
  Theme,
  Alert,
  SnackbarCloseReason,
  AlertProps,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

function StatusSnackbar({
  open,
  message,
  furtherActionLabel,
  severity,
  handleClose,
  onFurtherActionTake = () => {},
}: StatusSnackbarProps) {
  const classes = useStyles({ hasMessage: !!message });

  return message ? (
    <Snackbar
      className={classes.snackbar}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Alert
        className={classes.alert}
        variant="filled"
        onClose={(e) => handleClose(e)}
        severity={severity}
        classes={{ message: classes.alertMessage }}
      >
        {message}
        {furtherActionLabel && onFurtherActionTake && (
          <Button
            size="small"
            className={classes.button}
            onClick={onFurtherActionTake}
          >
            {furtherActionLabel}
          </Button>
        )}
      </Alert>
    </Snackbar>
  ) : null;
}

const useStyles = makeStyles<Theme, { hasMessage: boolean }>(
  (theme: Theme) => ({
    snackbar: {
      maxWidth: '50%',
      [theme.breakpoints.down('md')]: {
        maxWidth: '90%',
      },
    },
    alert: {
      alignItems: 'center',
    },
    alertMessage: ({ hasMessage }) => ({
      display: 'flex',
      alignItems: 'center',
      ...(hasMessage ? { padding: 0 } : {}),
    }),
    button: {
      marginLeft: theme.spacing(1.5),
    },
  }),
);

interface StatusSnackbarProps {
  open: boolean;
  message?: string;
  furtherActionLabel?: string;
  severity: AlertProps['severity'];
  handleClose: (
    event: React.SyntheticEvent<any> | Event,
    reason?: SnackbarCloseReason,
  ) => void;
  onFurtherActionTake?: () => void;
}

export default StatusSnackbar;
