import React, { useState, useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Box,
  Typography,
  Grid,
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
import { setTimeZone } from "../../../../../helpers/dates";
import siteServices from "../../../../../services/siteServices";
import {
  excludeSourceData,
  siteRequest,
} from "../../../../../store/Sites/selectedSiteSlice";
import ConfirmationDialog from "./ConfirmationDialog";

const ExclusionDatesDialog = ({
  dialogType,
  open,
  token,
  timeZone,
  siteId,
  onClose,
  classes,
}: ExclusionDatesDialogProps) => {
  const dispatch = useDispatch();

  // State variables for deploy dialog
  const [deployDateTime, setDeployDateTime] = useState<Date | null>(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployError, setDeployError] = useState<string>();
  const [pickerError, setPickerError] = useState("");

  // State variables for maintain dialog
  const [maintainStartDateTime, setMaintainStartDateTime] =
    useState<Date | null>(null);
  const [maintainEndDateTime, setMaintainEndDateTime] = useState<Date | null>(
    null
  );
  const [maintainLoading, setMaintainLoading] = useState(false);
  const [maintainError, setMaintainError] = useState<string>();
  const [startPickerError, setStartPickerError] = useState("");
  const [endPickerError, setEndPickerError] = useState("");
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const isMaintainDisabled =
    !maintainStartDateTime || !maintainEndDateTime || maintainLoading;

  useEffect(() => {
    switch (dialogType) {
      case "deploy":
        if (deployDateTime) {
          setPickerError("");
        }
        break;
      case "maintain":
        if (maintainStartDateTime) {
          setStartPickerError("");
        }
        if (maintainEndDateTime) {
          setEndPickerError("");
        }
        break;
      default:
        break;
    }
  }, [deployDateTime, dialogType, maintainEndDateTime, maintainStartDateTime]);

  const onDeployDialogClose = () => {
    setDeployLoading(false);
    setDeployDateTime(null);
    setDeployError(undefined);
    setPickerError("");
    onClose();
  };

  const onMaintainDialogClose = () => {
    setMaintainLoading(false);
    setMaintainStartDateTime(null);
    setMaintainEndDateTime(null);
    setMaintainError(undefined);
    setStartPickerError("");
    setEndPickerError("");
    onClose();
  };

  const onDeploy = () => {
    const localDate = setTimeZone(deployDateTime, timeZone);
    if (localDate) {
      setDeployLoading(true);
      siteServices
        .deploySpotter(siteId, { endDate: localDate.toString() }, token)
        .then(() => {
          setPickerError("");
          onDeployDialogClose();
          dispatch(siteRequest(`${siteId}`));
        })
        .catch((err) =>
          setDeployError(err?.response?.data?.message || "Something went wrong")
        )
        .finally(() => setDeployLoading(false));
    } else {
      setPickerError("Cannot be empty");
    }
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
      siteServices
        .maintainSpotter(
          siteId,
          {
            endDate: localEndDate,
            startDate: localStartDate,
          },
          token
        )
        .then(() => {
          setStartPickerError("");
          setEndPickerError("");
          onMaintainDialogClose();
          dispatch(
            excludeSourceData({
              source: "spotter",
              start: localStartDate,
              end: localEndDate,
            })
          );
        })
        .catch((err) =>
          setMaintainError(
            err?.response?.data?.message || "Something went wrong"
          )
        )
        .finally(() => {
          setMaintainLoading(false);
          onConfirmationDialogClose();
        });
    }
  };

  const confirmActionButtonText = () => {
    switch (dialogType) {
      case "deploy":
        return deployLoading ? "Deploying..." : "Deploy";
      case "maintain":
        return "Add Period";
      default:
        return "";
    }
  };

  const onConfirmationDialogOpen = () => setIsConfirmationDialogOpen(true);
  const onConfirmationDialogClose = () => setIsConfirmationDialogOpen(false);

  const actions: Action[] = [
    {
      action:
        dialogType === "deploy" ? onDeployDialogClose : onMaintainDialogClose,
      color: "secondary",
      size: "small",
      text: "Cancel",
      variant: "outlined",
    },
    {
      action: dialogType === "deploy" ? onDeploy : onConfirmationDialogOpen,
      color: "primary",
      size: "small",
      text: confirmActionButtonText(),
      variant: "outlined",
      disabled: dialogType === "deploy" ? deployLoading : isMaintainDisabled,
    },
  ];

  return (
    <>
      <ConfirmationDialog
        open={isConfirmationDialogOpen}
        isConfirmLoading={maintainLoading}
        onClose={onConfirmationDialogClose}
        handleMaintainPeriodAddition={onMaintainAdd}
        start={maintainStartDateTime || undefined}
        end={maintainEndDateTime || undefined}
      />
      <Dialog
        open={open}
        actions={actions}
        header={
          dialogType === "deploy" ? "Mark as deployed" : "Data Exclusion Dates"
        }
        onClose={
          dialogType === "deploy" ? onDeployDialogClose : onMaintainDialogClose
        }
        content={
          <div className={classes.dialogContent}>
            <Box mb="20px">
              <Alert severity="info">
                {dialogType === "deploy"
                  ? "Spotter data before this date will be deleted."
                  : "Spotter data between these dates will be deleted."}
              </Alert>
            </Box>
            <Box mb="5px">
              {(deployError || maintainError) && (
                <Alert severity="error">{deployError || maintainError}</Alert>
              )}
            </Box>
            <Typography
              className={classes.dateTitle}
              color="textSecondary"
              variant="h5"
            >
              {dialogType === "deploy" ? "Activation Date" : "Start"}
            </Typography>
            <Grid
              className={
                dialogType === "maintain"
                  ? classes.startDateContainer
                  : undefined
              }
              container
              item
              spacing={1}
            >
              <Grid item xs={12} sm={6}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className={classes.textField}
                    disableToolbar
                    format="MM/dd/yyyy"
                    autoOk
                    size="small"
                    fullWidth
                    showTodayButton
                    value={
                      dialogType === "deploy"
                        ? deployDateTime
                        : maintainStartDateTime
                    }
                    onChange={
                      dialogType === "deploy"
                        ? setDeployDateTime
                        : setMaintainStartDateTime
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    inputProps={{
                      className: classes.textField,
                    }}
                    inputVariant="outlined"
                    error={
                      dialogType === "deploy"
                        ? pickerError !== ""
                        : startPickerError !== ""
                    }
                    helperText={
                      dialogType === "deploy" ? pickerError : startPickerError
                    }
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardTimePicker
                    className={classes.textField}
                    id="time-picker"
                    name="diveTime"
                    size="small"
                    autoOk
                    fullWidth
                    format="HH:mm"
                    value={
                      dialogType === "deploy"
                        ? deployDateTime
                        : maintainStartDateTime
                    }
                    onChange={
                      dialogType === "deploy"
                        ? setDeployDateTime
                        : setMaintainStartDateTime
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change time",
                    }}
                    InputProps={{
                      className: classes.textField,
                    }}
                    keyboardIcon={<AccessTimeIcon />}
                    inputVariant="outlined"
                    error={
                      dialogType === "deploy"
                        ? pickerError !== ""
                        : startPickerError !== ""
                    }
                    helperText={
                      dialogType === "deploy" ? pickerError : startPickerError
                    }
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            </Grid>
            {dialogType === "maintain" && (
              <>
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
                        size="small"
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
                        size="small"
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
              </>
            )}
          </div>
        }
      />
    </>
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

interface ExclusionDatesDialogIncomingProps {
  dialogType: "deploy" | "maintain";
  open: boolean;
  token: string;
  timeZone?: string | null;
  siteId: number;
  onClose: () => void;
}

ExclusionDatesDialog.defaultProps = {
  timeZone: null,
};

type ExclusionDatesDialogProps = ExclusionDatesDialogIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ExclusionDatesDialog);
