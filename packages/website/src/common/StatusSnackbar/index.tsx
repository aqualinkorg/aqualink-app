import React from "react";
import { Button, Snackbar, makeStyles, Theme } from "@material-ui/core";
import { Alert, AlertProps } from "@material-ui/lab";

const StatusSnackbar = ({
  message,
  furtherActionLabel,
  severity,
  handleClose,
  onFurtherActionTake,
}: StatusSnackbarProps) => {
  const classes = useStyles(!!message);

  return (
    <Snackbar
      className={classes.snackbar}
      open
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Alert
        className={classes.alert}
        variant="filled"
        onClose={handleClose}
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
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  snackbar: {
    maxWidth: "50%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "90%",
    },
  },
  alert: {
    alignItems: "center",
  },
  alertMessage: (hasMessage: boolean) => ({
    display: "flex",
    alignItems: "center",
    ...(hasMessage ? { padding: 0 } : {}),
  }),
  button: {
    marginLeft: theme.spacing(1.5),
  },
}));

interface StatusSnackbarProps {
  message: string;
  furtherActionLabel?: string;
  severity: AlertProps["severity"];
  handleClose: AlertProps["onClose"];
  onFurtherActionTake?: () => void;
}

StatusSnackbar.defaultProps = {
  furtherActionLabel: undefined,
  onFurtherActionTake: () => {},
};

export default StatusSnackbar;
