import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  makeStyles,
} from "@material-ui/core";
import moment from "moment";
import { grey } from "@material-ui/core/colors";

const ConfirmationDialog = ({
  open,
  isConfirmLoading,
  start,
  end,
  onClose,
  handleMaintainPeriodAddition,
}: ConfirmationDialogProps) => {
  const classes = useStyles();
  // TODO add timezone info in the confirmation dialog.
  const startDate = moment(start).format("MM/DD/YYYY HH:mm");
  const endDate = moment(end).format("MM/DD/YYYY HH:mm");

  return (
    <Dialog maxWidth="sm" fullWidth open={open} onClose={onClose}>
      <DialogContent className={classes.content}>
        <Typography color="textSecondary">
          Are you sure you want to proceed? Data between{" "}
          <span className={classes.bold}>{startDate}</span> and{" "}
          <span className={classes.bold}>{endDate}</span> will be lost.
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
          {isConfirmLoading ? "Saving..." : "Save"}
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
  onClose: () => void;
  handleMaintainPeriodAddition: () => void;
}

ConfirmationDialog.defaultProps = {
  start: undefined,
  end: undefined,
};

export default ConfirmationDialog;
