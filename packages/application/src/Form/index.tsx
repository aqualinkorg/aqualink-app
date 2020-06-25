/* eslint-disable no-restricted-globals */
import React, {
  useState,
  useCallback,
  BaseSyntheticEvent,
  useEffect,
  ChangeEvent,
} from "react";
import {
  Theme,
  AppBar,
  Toolbar,
  Grid,
  Typography,
  Button,
  createStyles,
  withStyles,
  WithStyles,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Collapse,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import CloseIcon from "@material-ui/icons/Close";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router-dom";

import Map from "./Map";
import formServices, { SendFormData } from "../services/formServices";

const Form = ({ match, classes }: FormProps) => {
  const {
    register,
    errors,
    triggerValidation,
    getValues,
    handleSubmit,
    setValue,
    reset,
  } = useForm();

  const [reefId, setReefId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [depth, setDepth] = useState<number | null>(null);
  const [installationSchedule, setInstallationSchedule] = useState<
    string | null
  >(new Date().toISOString());
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [errorAlertOpen, setErrorAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  useEffect(() => {
    formServices
      .getFormData(match.params.appId, match.params.uid)
      .then((resp) => {
        const { data } = resp;
        if (data) {
          setUserName(data.userId.fullName);
          setOrganization(data.userId.organization);
          setLatitude(data.reefId.polygon.coordinates[1]);
          setLongitude(data.reefId.polygon.coordinates[0]);
          setDepth(data.reefId.depth);
          setReefId(data.reefId.id);
          setValue([
            { latitude: data.reefId.polygon.coordinates[1] },
            { longitude: data.reefId.polygon.coordinates[0] },
            { depth: data.reefId.depth },
          ]);
        }
      })
      .catch(() => {
        setErrorAlertOpen(true);
        setAlertMessage("Failed to load form data");
      });
  }, [setValue, match.params.appId, match.params.uid]);

  const onSubmit = useCallback(
    (
      data: any,
      event?: BaseSyntheticEvent<object, HTMLElement, HTMLElement>
    ) => {
      if (event) {
        event.preventDefault();
      }

      const sendData: SendFormData = {
        uid: match.params.uid,
        reef: {
          name: data.reefName,
          polygon: {
            type: "Point",
            coordinates: [
              parseFloat(data.longitude),
              parseFloat(data.latitude),
            ],
          },
          depth: parseFloat(data.depth),
        },
        reefApplication: {
          reefId,
          uid: match.params.uid,
          permitRequirements: data.permitting,
          fundingSource: data.fundingSource,
          installationSchedule,
          installationResources: data.installation,
        },
      };

      formServices
        .sendFormData(match.params.appId, sendData)
        .then(() => {
          setDialogOpen(true);
          reset();
          setInstallationSchedule(new Date().toISOString());
        })
        .catch(() => {
          setErrorAlertOpen(true);
          setAlertMessage("Form submission failed");
        });
    },
    [installationSchedule, reset, match.params.appId, match.params.uid, reefId]
  );

  const handleDateChange = useCallback(
    (date: Date | null) => {
      if (date) {
        setInstallationSchedule(date.toISOString());
      }
    },
    [setInstallationSchedule]
  );

  const handleChange = useCallback(
    (prop: string) => {
      return async (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        const { target } = event;
        const { value } = target;
        const valueNum = parseFloat(value);
        switch (prop) {
          case "latitude":
            if (!isNaN(valueNum)) {
              setLatitude(valueNum);
            }
            await triggerValidation("latitude");
            break;
          case "longitude":
            if (!isNaN(valueNum)) {
              setLongitude(valueNum);
            }
            await triggerValidation("longitude");
            break;
          case "depth":
            if (!isNaN(valueNum)) {
              setDepth(valueNum);
            }
            await triggerValidation("depth");
            break;
          case "reefName":
            await triggerValidation("reefName");
            break;
          case "permitting":
            await triggerValidation("permitting");
            break;
          case "fundingSource":
            await triggerValidation("fundingSource");
            break;
          case "installation":
            await triggerValidation("installation");
            break;
          default:
            break;
        }
      };
    },
    [triggerValidation]
  );

  return (
    <>
      {/* Form page NavBar */}
      <AppBar style={{ height: 70 }} position="static">
        <Toolbar>
          <Grid container justify="center">
            <Grid item xs={10} container direction="row">
              <Typography variant="h4">Aqua</Typography>
              <Typography style={{ fontWeight: 300 }} variant="h4">
                link
              </Typography>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Collapse in={errorAlertOpen}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setErrorAlertOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Collapse>
      {/* Form Page Message */}
      <Grid style={{ marginTop: "4rem" }} container justify="center">
        <Grid item xs={8}>
          <Typography variant="h5">Application</Typography>
          <Typography style={{ fontWeight: 300 }} variant="body1">
            Please take a minute to fill out one of these forms for each site
            you wish to apply for.
          </Typography>
          <Typography style={{ fontWeight: 300 }} variant="body1">
            If you have any quesions dont hesitate to reach out to{" "}
            <a href="mailto:info@aqualink.org">info@aqualink.org</a>
          </Typography>
        </Grid>
      </Grid>
      <Grid style={{ marginTop: "4rem" }} container justify="center">
        <Grid item xs={4}>
          <Grid className={classes.map} item>
            <Map
              center={latitude && longitude ? [latitude, longitude] : [0, 0]}
            />
          </Grid>
        </Grid>
        <Grid container direction="column" item xs={4}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            {/* User Name */}
            <Typography>Your Name</Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              variant="outlined"
              id="user-name"
              fullWidth
              disabled
              value={userName}
            />
            {/* Organization */}
            <Typography style={{ marginTop: "3rem" }}>Organization</Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              variant="outlined"
              id="organization"
              fullWidth
              disabled
              value={organization}
            />
            {/* Site Location */}
            <Typography style={{ marginTop: "3rem" }}>Location</Typography>
            {/* Longitude and Latitude */}
            <Grid container item spacing={4}>
              <Grid item xs={6}>
                <TextField
                  inputProps={{ className: classes.textField }}
                  inputRef={register({
                    required: "Latitude is required",
                    pattern: {
                      value: /^-?\d+\.\d+$/,
                      message: "Latitude should be a decimal number",
                    },
                  })}
                  error={!!errors.latitude}
                  name="latitude"
                  variant="outlined"
                  id="site-latitude"
                  fullWidth
                  onChange={handleChange("latitude")}
                  placeholder="Latitude in decimal degrees"
                  helperText={
                    errors.latitude ? errors.latitude.message : "Latitude"
                  }
                  defaultValue={latitude}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  inputProps={{ className: classes.textField }}
                  inputRef={register({
                    required: "Longitude is required",
                    pattern: {
                      value: /^-?\d+\.\d+$/,
                      message: "Longitude should be a decimal number",
                    },
                  })}
                  error={!!errors.longitude}
                  name="longitude"
                  variant="outlined"
                  id="site-longitude"
                  fullWidth
                  onChange={handleChange("longitude")}
                  placeholder="Longitude in decimal degrees"
                  helperText={
                    errors.longitude ? errors.longitude.message : "Longitude"
                  }
                  defaultValue={longitude}
                />
              </Grid>
            </Grid>
            {/* Depth */}
            <Typography style={{ marginTop: "3rem" }}>Depth (m)</Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({
                required: "Depth is required",
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: "Depth should be a number",
                },
              })}
              error={!!errors.depth}
              name="depth"
              variant="outlined"
              id="site-depth"
              fullWidth
              onChange={handleChange("depth")}
              placeholder="Depth in meters"
              helperText={errors.depth ? errors.depth.message : ""}
              defaultValue={depth}
            />
            <Typography style={{ marginTop: "3rem" }}>
              Please provide some additional information for each reef:
            </Typography>
            {/* Reef Name */}
            <Typography style={{ marginTop: "3rem" }}>Reef Name</Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({
                required: "Reef Name is required",
              })}
              error={!!errors.reefName}
              variant="outlined"
              id="reef-name"
              name="reefName"
              fullWidth
              onChange={handleChange("reefName")}
              placeholder="e.g. Sombrero Reef"
              helperText={errors.reefName ? errors.reefName.message : ""}
            />
            {/* Permitting */}
            <Typography style={{ marginTop: "3rem" }}>Permtting</Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({
                required: "This is a required field",
              })}
              error={!!errors.permitting}
              variant="outlined"
              id="permitting"
              name="permitting"
              fullWidth
              multiline
              onChange={handleChange("permitting")}
              placeholder="Please describe the permitting requirements. Please be sure to
              mention the authority having jurisdiction."
              helperText={errors.permitting ? errors.permitting.message : ""}
            />
            {/* Funding Source */}
            <Typography style={{ marginTop: "3rem" }}>
              Funding Source
            </Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({
                required: "This is a required field",
              })}
              error={!!errors.fundingSource}
              variant="outlined"
              id="funding-source"
              name="fundingSource"
              fullWidth
              multiline
              onChange={handleChange("fundingSource")}
              placeholder="Funding source for import duties and shipping. Please describe the funding source for the import duties and shipping costs."
              helperText={
                errors.fundingSource ? errors.fundingSource.message : ""
              }
            />
            {/* Schedule for Installation */}
            <Typography style={{ marginTop: "3rem" }}>
              Schedule for Installation.
            </Typography>
            <Typography style={{ fontWeight: 300 }}>
              What is the soonest date after September 2020 that you could
              install the spotter and conduct a survey.
            </Typography>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                margin="dense"
                format="MM/dd/yyyy"
                value={installationSchedule}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>
            {/* Installation, survey and maintenance personnel and equipment */}
            <Typography style={{ marginTop: "3rem" }}>
              Installation, survey and maintenance personnel and equipment
            </Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({
                required: "This is a required field",
              })}
              error={!!errors.installation}
              variant="outlined"
              id="installation"
              name="installation"
              fullWidth
              multiline
              onChange={handleChange("installation")}
              placeholder="Please provide a description of the people that will be able to conduct periodic surveys and maintenance of the buoy. Please also include a description of the equipment (e.g. a boat, cameras) that are available."
              helperText={
                errors.installation ? errors.installation.message : ""
              }
            />
            {/* Successful Submission Dialog */}
            <Dialog open={dialogOpen}>
              <DialogTitle
                className={classes.successDialogTitle}
                id="successful-submission-dialog-title"
              >
                Successful Form Submission
              </DialogTitle>
              <DialogContent className={classes.successDialogContent}>
                <DialogContentText
                  className={classes.successDialogContentText}
                  id="successful-submission-dialog-content"
                >
                  You have successfully submitted the form. Click Visit to
                  navigate to Aqualink Home Page.
                </DialogContentText>
              </DialogContent>
              <DialogActions className={classes.successDialogActions}>
                <Button color="primary" onClick={() => setDialogOpen(false)}>
                  Back
                </Button>
                <Button color="primary" href="https://www.aqualink.org/">
                  Visit
                </Button>
              </DialogActions>
            </Dialog>
            <Grid style={{ margin: "3rem 0 3rem 0" }} item>
              <Button
                disabled={
                  !!Object.keys(errors).length ||
                  !getValues().latitude ||
                  !getValues().longitude ||
                  !getValues().reefName ||
                  !getValues().permitting ||
                  !getValues().fundingSource ||
                  !getValues().installation ||
                  userName === "" ||
                  organization === ""
                }
                type="submit"
                color="primary"
                variant="contained"
              >
                Submit
              </Button>
            </Grid>
          </form>
        </Grid>
      </Grid>
      {/* Form page Footer */}
      <AppBar position="static">
        <Toolbar>
          <Grid container justify="center">
            <Grid item xs={10} container direction="row">
              <Typography variant="h4">Aqua</Typography>
              <Typography style={{ fontWeight: 300 }} variant="h4">
                link
              </Typography>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    select: {
      width: "100%",
      color: "black",
      marginTop: "1rem",
      marginBottom: "1rem",
    },
    menuItem: {
      color: "black",
    },
    textField: {
      color: "black",
    },
    map: {
      height: "40vh",
      width: "30vw",
    },
    successDialogTitle: {
      backgroundColor: theme.palette.primary.dark,
    },
    successDialogContent: {
      backgroundColor: theme.palette.primary.dark,
    },
    successDialogContentText: {
      color: theme.palette.text.primary,
    },
    successDialogActions: {
      backgroundColor: theme.palette.primary.dark,
    },
  });

interface MatchProps
  extends RouteComponentProps<{ appId: string; uid: string }> {}

type FormProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Form);
