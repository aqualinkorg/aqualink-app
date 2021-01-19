import React, { useEffect, useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Typography,
  Box,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useDispatch } from "react-redux";

import Dialog, { Action } from "../../../../../common/Dialog";
import reefServices from "../../../../../services/reefServices";
import { setTimeZone } from "../../../../../helpers/dates";
import { reefRequest } from "../../../../../store/Reefs/selectedReefSlice";

const DeployDialog = ({
  open,
  token,
  timeZone,
  reefId,
  onClose,
  classes,
}: DeployDialogProps) => {
  const dispatch = useDispatch();
  const [deployDateTime, setDeployDateTime] = useState<Date | null>(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployError, setDeployError] = useState<boolean>(false);
  const [pickerError, setPickerError] = useState("");

  useEffect(() => {
    if (deployDateTime) {
      setPickerError("");
    }
  }, [deployDateTime]);

  const onDialogClose = () => {
    setDeployLoading(false);
    setDeployDateTime(null);
    setDeployError(false);
    setPickerError("");
    onClose();
  };

  const onDeploy = () => {
    const localDate = setTimeZone(deployDateTime, timeZone);
    if (localDate) {
      setDeployLoading(true);
      reefServices
        .deploySpotter(reefId, { endDate: localDate.toString() }, token)
        .then(() => {
          setPickerError("");
          onDialogClose();
          dispatch(reefRequest(`${reefId}`));
        })
        .catch(() => setDeployError(true))
        .finally(() => setDeployLoading(false));
    } else {
      setPickerError("Cannot be empty");
    }
  };

  const actions: Action[] = [
    {
      action: onDialogClose,
      color: "secondary",
      size: "small",
      text: "Cancel",
      variant: "outlined",
    },
    {
      action: onDeploy,
      color: "primary",
      size: "small",
      text: deployLoading ? "Deploying..." : "Deploy",
      variant: "outlined",
      disabled: deployLoading,
    },
  ];

  return (
    <Dialog
      actions={actions}
      content={
        <div className={classes.dialogContent}>
          <Box mb="20px">
            <Alert severity="info">
              Spotter data before this date will not be displayed.
            </Alert>
          </Box>
          <Box mb="5px">
            {deployError && (
              <Alert severity="error">Something went wrong</Alert>
            )}
          </Box>
          <Typography
            className={classes.dateTitle}
            color="textSecondary"
            variant="h5"
          >
            Activation Date
          </Typography>
          <Grid container item spacing={1}>
            <Grid item xs={12} sm={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className={classes.textField}
                  disableToolbar
                  format="MM/dd/yyyy"
                  id="installationSchedule"
                  name="installationSchedule"
                  autoOk
                  fullWidth
                  showTodayButton
                  value={deployDateTime}
                  onChange={setDeployDateTime}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                  inputProps={{
                    className: classes.textField,
                  }}
                  inputVariant="outlined"
                  error={pickerError !== ""}
                  helperText={pickerError}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardTimePicker
                  className={classes.textField}
                  id="time-picker"
                  name="diveTime"
                  autoOk
                  fullWidth
                  format="HH:mm"
                  value={deployDateTime}
                  onChange={setDeployDateTime}
                  KeyboardButtonProps={{
                    "aria-label": "change time",
                  }}
                  InputProps={{
                    className: classes.textField,
                  }}
                  keyboardIcon={<AccessTimeIcon />}
                  inputVariant="outlined"
                  error={pickerError !== ""}
                  helperText={pickerError}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
        </div>
      }
      header="Mark as deployed"
      onClose={onDialogClose}
      open={open}
    />
  );
};

const styles = (theme: Theme) =>
  createStyles({
    dialogContent: {
      marginBottom: 20,
    },
    dateTitle: {
      marginBottom: 10,
    },
    textField: {
      color: "black",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
  });

interface DeployDialogIncomingProps {
  open: boolean;
  token: string;
  timeZone: string;
  reefId: number;
  onClose: () => void;
}

type DeployDialogProps = DeployDialogIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DeployDialog);
