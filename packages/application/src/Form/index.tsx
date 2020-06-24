/* eslint-disable no-restricted-globals */
import React, {
  useState,
  ChangeEvent,
  useCallback,
  BaseSyntheticEvent,
} from "react";
import {
  AppBar,
  Toolbar,
  Grid,
  Typography,
  Select,
  MenuItem,
  Button,
  createStyles,
  withStyles,
  WithStyles,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
} from "@material-ui/core";
import { useForm } from "react-hook-form";

const reefPicture = require("./reef-picture.png");

const Form = ({ classes }: FormProps) => {
  const {
    register,
    errors,
    triggerValidation,
    getValues,
    handleSubmit,
  } = useForm();

  const [contact, setContact] = useState<string>("");
  const [contactDialogName, setContactDialogName] = useState<string>("");
  const [contactList, setContactList] = useState<string[]>([
    "Zack Johnson",
    "David Lang",
  ]);
  const [contactDialogOpen, setContactDialogOpen] = useState<boolean>(false);

  const handleContactDialog = (open: boolean) => {
    setContactDialogOpen(open);
  };

  const onSubmit = useCallback(
    (
      data: any,
      event?: BaseSyntheticEvent<object, HTMLElement, HTMLElement>
    ) => {
      if (event) {
        console.log(event);
        // event.preventDefault();
      }
      console.log({ ...data, contact });
    },
    [contact]
  );

  const addContact = () => {
    if (typeof contactDialogName === "string") {
      if (
        contactDialogName !== "" &&
        !contactList.includes(contactDialogName)
      ) {
        setContactList([...contactList, contactDialogName]);
      }
    }
    setContactDialogName("");
    setContactDialogOpen(false);
  };

  const handleChange = useCallback(
    (prop: string) => {
      return async (
        event: ChangeEvent<{
          name?: string | undefined;
          value: string | unknown;
        }>
      ) => {
        const { target } = event;
        const { value } = target;
        switch (prop) {
          case "contact":
            if (typeof value === "string") {
              setContact(value);
            }
            break;
          case "contactDialogName":
            if (typeof value === "string") {
              setContactDialogName(value);
            }
            break;
          case "siteName":
            await triggerValidation("siteName");
            break;
          case "siteLocation":
            await triggerValidation("siteLocation");
            break;
          case "latitude":
            await triggerValidation("latitude");
            break;
          case "longitude":
            await triggerValidation("longitude");
            break;
          case "depth":
            await triggerValidation("depth");
            break;
          case "organizations":
            await triggerValidation("organizations");
            break;
          default:
            break;
        }
      };
    },
    [triggerValidation, setContact, setContactDialogName]
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
      {/* Form Page Message */}
      <Grid style={{ marginTop: "4rem" }} container justify="center">
        <Grid item xs={8}>
          <Typography variant="h5">Survey</Typography>
          <Typography style={{ fontWeight: 300 }} variant="body1">
            Please take a minute to fill out one of these surveys for each site
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
          <img style={{ borderRadius: 4 }} src={reefPicture} alt="reef" />
        </Grid>
        <Grid container direction="column" item xs={4}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            {/* Site Contact */}
            <Typography>Site Contact</Typography>
            <Typography style={{ fontWeight: 300 }} variant="body1">
              Please Select the primary contact for this site from the list
            </Typography>
            <Select
              variant="outlined"
              className={classes.select}
              labelId="survey-form"
              label="Select a contact"
              id="contact"
              value={contact}
              onChange={handleChange("contact")}
              placeholder="Select a contact"
            >
              {contactList.map((item) => {
                return (
                  <MenuItem
                    className={classes.menuItem}
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>
                );
              })}
            </Select>
            <Typography style={{ fontWeight: 300 }} variant="body1">
              If you do not see your contact information here, please{" "}
              <Button onClick={() => handleContactDialog(true)} color="primary">
                add a new contact
              </Button>
            </Typography>
            <Dialog
              open={contactDialogOpen}
              onClose={() => setContactDialogOpen(false)}
              aria-labelledby="form-dialog-title"
            >
              <DialogContent>
                <TextField
                  inputProps={{ className: classes.textField }}
                  autoFocus
                  margin="dense"
                  id="contact-dialog-name"
                  label="Contact Name"
                  fullWidth
                  onChange={handleChange("contactDialogName")}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setContactDialogOpen(false)}
                  color="primary"
                >
                  Cancel
                </Button>
                <Button onClick={addContact} color="primary">
                  Add
                </Button>
              </DialogActions>
            </Dialog>
            {/* Site Name */}
            <Typography style={{ marginTop: "3rem" }}>Site Name</Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({
                required: "Site Name is required",
              })}
              error={!!errors.siteName}
              variant="outlined"
              id="site-name"
              name="siteName"
              fullWidth
              onChange={handleChange("siteName")}
              placeholder="e.g. Sombrero Reef"
              helperText={errors.siteName ? errors.siteName.message : ""}
            />
            {/* Site Location */}
            <Typography style={{ marginTop: "3rem" }}>Site Location</Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({
                required: "Site Location is required",
              })}
              error={!!errors.siteLocation}
              variant="outlined"
              id="site-location"
              name="siteLocation"
              fullWidth
              onChange={handleChange("siteLocation")}
              placeholder="e.g. Marathon Key, Florida"
              helperText={
                errors.siteLocation ? errors.siteLocation.message : ""
              }
            />
            {/* Longitude and Latitude */}
            <Grid style={{ marginTop: "3rem" }} container item spacing={4}>
              <Grid item xs={6}>
                <Typography>Latitude</Typography>
                <TextField
                  inputProps={{ className: classes.textField }}
                  inputRef={register({
                    required: "Latitude is required",
                    pattern: {
                      value: /^\d+\.\d+$/,
                      message: "Latitude should be a decimal number",
                    },
                  })}
                  error={!!errors.latitude}
                  name="latitude"
                  variant="outlined"
                  id="site-latitude"
                  fullWidth
                  onChange={handleChange("latitude")}
                  placeholder="in decimal degrees"
                  helperText={errors.latitude ? errors.latitude.message : ""}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography>Longitude</Typography>
                <TextField
                  inputProps={{ className: classes.textField }}
                  inputRef={register({
                    required: "Longitude is required",
                    pattern: {
                      value: /^\d+\.\d+$/,
                      message: "Longitude should be a decimal number",
                    },
                  })}
                  error={!!errors.longitude}
                  name="longitude"
                  variant="outlined"
                  id="site-longitude"
                  fullWidth
                  onChange={handleChange("longitude")}
                  placeholder="in decimal degrees"
                  helperText={errors.longitude ? errors.longitude.message : ""}
                />
              </Grid>
            </Grid>
            {/* Depth */}
            <Typography style={{ marginTop: "3rem" }}>Depth</Typography>
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
              placeholder="in meters"
              helperText={errors.depth ? errors.depth.message : ""}
            />
            {/* Collaborating Organizations */}
            <Typography style={{ marginTop: "3rem" }}>
              Collaborating Organizations
            </Typography>
            <TextField
              inputProps={{ className: classes.textField }}
              inputRef={register({})}
              name="organizations"
              variant="outlined"
              id="site-organizations"
              fullWidth
              onChange={handleChange("organizations")}
              multiline
              placeholder="Please list any organizations that will be collaborating with you on the installation, maintenance, and monitoring on this site"
            />
            <Grid style={{ margin: "3rem 0 3rem 0" }} item>
              <Button
                disabled={
                  !!Object.keys(errors).length ||
                  !contact ||
                  !getValues().siteName ||
                  !getValues().siteLocation ||
                  !getValues().latitude ||
                  !getValues().longitude ||
                  !getValues().depth
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

const styles = () =>
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
  });

interface FormProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(Form);
