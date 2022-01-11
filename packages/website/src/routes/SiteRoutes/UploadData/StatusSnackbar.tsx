import React from "react";
import { Snackbar } from "@material-ui/core";
import { Alert, AlertProps } from "@material-ui/lab";

const alertMessage = (severity: StatusSnackbarProps["severity"]) => {
  switch (severity) {
    case "success":
      return "Successfully uploaded files.";
    case "error":
      return "Something went wrong.";
    default:
      return null;
  }
};

const StatusSnackbar = ({ severity, handleClose }: StatusSnackbarProps) => (
  <Snackbar
    open
    onClose={handleClose}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
  >
    <Alert variant="filled" onClose={handleClose} severity={severity}>
      {alertMessage(severity)}
    </Alert>
  </Snackbar>
);

interface StatusSnackbarProps {
  severity: AlertProps["severity"];
  handleClose: AlertProps["onClose"];
}

export default StatusSnackbar;
