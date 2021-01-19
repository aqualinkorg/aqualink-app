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

const MaintainDialog = ({
  open,
  token,
  timeZone,
  reefId,
  onClose,
  classes,
}: MaintainDialogProps) => {
  const dispatch = useDispatch();
  const [
    maintainStartDateTime,
    setMaintainStartDateTime,
  ] = useState<Date | null>(null);
  const [maintainEndDateTime, setMaintainEndDateTime] = useState<Date | null>(
    null
  );
  const [maintainLoading, setMaintainLoading] = useState(false);
  const [maintainError, setMaintainError] = useState<boolean>(false);
  const [startPickerError, setStartPickerError] = useState("");
  const [endPickerError, setEndPickerError] = useState("");

  useEffect(() => {
    if (maintainStartDateTime) {
      setStartPickerError("");
    }
    if (maintainEndDateTime) {
      setEndPickerError("");
    }
  }, [maintainEndDateTime, maintainStartDateTime]);

  const onDialogClose = () => {
    setMaintainLoading(false);
    setMaintainStartDateTime(null);
    setMaintainEndDateTime(null);
    setMaintainError(false);
    setStartPickerError("");
    setEndPickerError("");
    onClose();
  };

  const onMaintainAdd = () => {
    const localStartDate = setTimeZone(maintainStartDateTime, timeZone);
    const localEndDate = setTimeZone(maintainEndDateTime, timeZone);

    if (!localStartDate) {
      setStartPickerError("Cannot be empty");
    }
    if (!localEndDate) {
      setEndPickerError("Cannot be empty");
    }
    if (localStartDate && localEndDate) {
      setMaintainLoading(true);
      reefServices
        .maintainSpotter(
          reefId,
          {
            endDate: localEndDate.toString(),
            startDate: localStartDate.toString(),
          },
          token
        )
        .then(() => {
          setStartPickerError("");
          setEndPickerError("");
          onDialogClose();
          dispatch(reefRequest(`${reefId}`));
        })
        .catch(() => setMaintainError(true))
        .finally(() => setMaintainLoading(false));
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
      action: onMaintainAdd,
      color: "primary",
      size: "small",
      text: maintainLoading ? "Adding..." : "Add Period",
      variant: "outlined",
      disabled: maintainLoading,
    },
  ];

  return (
    <Dialog
      actions={actions}
      content={
        <div className={classes.dialogContent}>
          <Box mb="20px">
            <Alert severity="info">
              Spotter data between these dates will not be displayed.
            </Alert>
          </Box>
          <Box mb="5px">
            {maintainError && (
              <Alert severity="error">Something went wrong</Alert>
            )}
          </Box>
          <Typography
            className={classes.dateTitle}
            color="textSecondary"
            variant="h5"
          >
            Start
          </Typography>
          <Grid
            className={classes.startDateContainer}
            container
            item
            spacing={1}
          >
            <Grid item xs={12} sm={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className={classes.textField}
                  disableToolbar
                  fullWidth
                  format="MM/dd/yyyy"
                  id="installationSchedule"
                  name="installationSchedule"
                  autoOk
                  showTodayButton
                  value={maintainStartDateTime}
                  onChange={setMaintainStartDateTime}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                  inputProps={{
                    className: classes.textField,
                  }}
                  inputVariant="outlined"
                  error={startPickerError !== ""}
                  helperText={startPickerError}
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
                  value={maintainStartDateTime}
                  onChange={setMaintainStartDateTime}
                  KeyboardButtonProps={{
                    "aria-label": "change time",
                  }}
                  InputProps={{
                    className: classes.textField,
                  }}
                  keyboardIcon={<AccessTimeIcon />}
                  inputVariant="outlined"
                  error={startPickerError !== ""}
                  helperText={startPickerError}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
          <Typography
            className={classes.dateTitle}
            color="textSecondary"
            variant="h5"
          >
            End
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
                  value={maintainEndDateTime}
                  onChange={setMaintainEndDateTime}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                  inputProps={{
                    className: classes.textField,
                  }}
                  inputVariant="outlined"
                  error={endPickerError !== ""}
                  helperText={endPickerError}
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
                  value={maintainEndDateTime}
                  onChange={setMaintainEndDateTime}
                  KeyboardButtonProps={{
                    "aria-label": "change time",
                  }}
                  InputProps={{
                    className: classes.textField,
                  }}
                  keyboardIcon={<AccessTimeIcon />}
                  inputVariant="outlined"
                  error={endPickerError !== ""}
                  helperText={endPickerError}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
        </div>
      }
      header="Maintenance Period"
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
    startDateContainer: {
      marginBottom: 20,
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

interface MaintainDialogIncomingProps {
  open: boolean;
  token: string;
  timeZone: string;
  reefId: number;
  onClose: () => void;
}

type MaintainDialogProps = MaintainDialogIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(MaintainDialog);
