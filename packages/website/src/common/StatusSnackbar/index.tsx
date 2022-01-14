import React from "react";
import { Snackbar } from "@material-ui/core";
import { Alert, AlertProps } from "@material-ui/lab";

const StatusSnackbar = ({
  message,
  severity,
  handleClose,
}: StatusSnackbarProps) => (
  <Snackbar
    open
    onClose={handleClose}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
  >
    <Alert variant="filled" onClose={handleClose} severity={severity}>
      {message}
    </Alert>
  </Snackbar>
);

interface StatusSnackbarProps {
  message: string;
  severity: AlertProps["severity"];
  handleClose: AlertProps["onClose"];
}

export default StatusSnackbar;
