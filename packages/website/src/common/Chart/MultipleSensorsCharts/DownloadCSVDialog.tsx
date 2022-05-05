import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { SofarValue } from "../../../store/Sites/types";

export interface DownloadCSVDialogProps {
  open: boolean;
  data: { name: string; values: SofarValue[] }[];
  startDate: string;
  endDate: string;
  onClose: (data: { name: string; values: SofarValue[] }[]) => void;
}

const DownloadCSVDialog = ({
  onClose,
  open,
  data,
  startDate,
  endDate,
}: DownloadCSVDialogProps) => {
  const classes = useStyles();
  const [selected, setSelected] = useState<boolean[]>(
    new Array(data.length).fill(true)
  );

  const handleChange = (position: number) => {
    const newSelected = selected.map((item, index) =>
      index === position ? !item : item
    );
    setSelected(newSelected);
  };

  const handleClose = (shouldDownload: boolean) => {
    if (shouldDownload) {
      onClose(data.filter((_, index) => selected[index]));
    } else {
      onClose([]);
    }
  };

  useEffect(() => {
    setSelected(new Array(data.length).fill(true));
  }, [data]);

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
          Select data to download into CSV format for dates between{" "}
          <span className={classes.bold}>
            {moment(startDate).format("MM/DD/YYYY")}
          </span>{" "}
          and{" "}
          <span className={classes.bold}>
            {moment(endDate).format("MM/DD/YYYY")}
          </span>
        </DialogContentText>
        <div className={classes.checkboxesWrapper}>
          {data.map((x, index) => (
            <FormControlLabel
              className={classes.checkboxLabel}
              control={
                <Checkbox
                  color="primary"
                  disabled={x.values.length === 0}
                  checked={selected[index]}
                  onChange={() => handleChange(index)}
                />
              }
              label={x.name}
            />
          ))}
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
  checkboxesWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  checkboxLabel: {
    color: "#2f2f2f",
  },
  bold: {
    fontWeight: 700,
  },
}));

export default DownloadCSVDialog;
