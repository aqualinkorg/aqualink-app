import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import moment from "moment";
import React from "react";
import { ValueWithTimestamp } from "../../../store/Sites/types";

export interface DownloadCSVDialogProps {
  open: boolean;
  data: { name: string; values: ValueWithTimestamp[] }[];
  startDate: string;
  endDate: string;
  onClose: (shouldDownload: boolean) => void;
}

const DownloadCSVDialog = ({
  onClose,
  open,
  data,
  startDate,
  endDate,
}: DownloadCSVDialogProps) => {
  const classes = useStyles();

  const handleClose = (shouldDownload: boolean) => {
    if (shouldDownload) {
      onClose(true);
    } else {
      onClose(false);
    }
  };

  return (
    <Dialog
      scroll="paper"
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick") return;
        if (reason === "escapeKeyDown") handleClose(false);
      }}
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h4">Download CSV</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Selected data to download into CSV format from dates between{" "}
          <span className={classes.bold}>
            {moment(startDate).format("MM/DD/YYYY")}
          </span>{" "}
          and{" "}
          <span className={classes.bold}>
            {moment(endDate).format("MM/DD/YYYY")}
          </span>
        </DialogContentText>
        <div className={classes.listWrapper}>
          <ul>
            {data.map((x) => (
              <li key={x.name} className={classes.listItem}>
                {x.name}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={() => handleClose(true)} color="primary" autoFocus>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    overflowWrap: "break-word",
  },
  listWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  listItem: {
    color: "#2f2f2f",
  },
  bold: {
    fontWeight: 700,
  },
}));

export default DownloadCSVDialog;
