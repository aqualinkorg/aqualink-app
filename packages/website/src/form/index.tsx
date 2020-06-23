/* eslint-disable no-restricted-globals */
import React, { useState, ChangeEvent, useCallback } from "react";
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

const reefPicture = require("./reef-picture.png");

const Form = ({ classes }: FormProps) => {
  const [contact, setContact] = useState<string>("");
  const [contactDialogName, setContactDialogName] = useState<string>("");
  const [contactList, setContactList] = useState<string[]>([
    "Zack Johnson",
    "David Lang",
  ]);
  const [contactDialogOpen, setContactDialogOpen] = useState<boolean>(false);
  const [siteName, setSiteName] = useState<string>("");
  const [siteLocation, setSiteLocation] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [depth, setDepth] = useState<string>("");
  const [organizations, setOrganizations] = useState<string>("");

  const handleContactDialog = (open: boolean) => {
    setContactDialogOpen(open);
  };

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
      return (
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
            if (typeof value === "string") {
              setSiteName(value);
            }
            break;
          case "siteLocation":
            if (typeof value === "string") {
              setSiteLocation(value);
            }
            break;
          case "latitude":
            if (typeof value === "string") {
              setLatitude(value);
            }
            break;
          case "longitude":
            if (typeof value === "string") {
              setLongitude(value);
            }
            break;
          case "depth":
            if (typeof value === "string") {
              setDepth(value);
            }
            break;
          case "organizations":
            if (typeof value === "string") {
              setOrganizations(value);
            }
            break;
          default:
            break;
        }
      };
    },
    [
      setContact,
      setContactDialogName,
      setSiteName,
      setSiteLocation,
      setLatitude,
      setLongitude,
      setDepth,
      setOrganizations,
    ]
  );

  const onSubmit = () => {
    console.log({
      contact,
      siteName,
      siteLocation,
      latitude,
      longitude,
      depth,
      organizations,
    });
  };

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
                <MenuItem className={classes.menuItem} key={item} value={item}>
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
            variant="outlined"
            id="site-name"
            fullWidth
            onChange={handleChange("siteName")}
            value={siteName}
            placeholder="e.g. Sombrero Reef"
          />
          {/* Site Location */}
          <Typography style={{ marginTop: "3rem" }}>Site Location</Typography>
          <TextField
            inputProps={{ className: classes.textField }}
            variant="outlined"
            id="site-location"
            fullWidth
            onChange={handleChange("siteLocation")}
            value={siteLocation}
            placeholder="e.g. Marathon Key, Florida"
          />
          {/* Longitude and Latitude */}
          <Grid style={{ marginTop: "3rem" }} container item spacing={4}>
            <Grid item xs={6}>
              <Typography>Latitude</Typography>
              <TextField
                error={latitude !== "" && isNaN(parseFloat(latitude))}
                inputProps={{ className: classes.textField }}
                variant="outlined"
                id="site-latitude"
                fullWidth
                onChange={handleChange("latitude")}
                value={latitude}
                placeholder="in decimal degrees"
                helperText={
                  (latitude !== "" &&
                    isNaN(parseFloat(latitude)) &&
                    "Should be a number with decimals") ||
                  ""
                }
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>Longitude</Typography>
              <TextField
                error={longitude !== "" && isNaN(parseFloat(longitude))}
                inputProps={{ className: classes.textField }}
                variant="outlined"
                id="site-longitude"
                fullWidth
                onChange={handleChange("longitude")}
                value={longitude}
                placeholder="in decimal degrees"
                helperText={
                  (longitude !== "" &&
                    isNaN(parseFloat(longitude)) &&
                    "Should be a number with decimals") ||
                  ""
                }
              />
            </Grid>
          </Grid>
          {/* Depth */}
          <Typography style={{ marginTop: "3rem" }}>Depth</Typography>
          <TextField
            inputProps={{ className: classes.textField }}
            variant="outlined"
            id="site-depth"
            fullWidth
            onChange={handleChange("depth")}
            value={depth}
            placeholder="in meters"
          />
          {/* Collaborating Organizations */}
          <Typography style={{ marginTop: "3rem" }}>
            Collaborating Organizations
          </Typography>
          <TextField
            inputProps={{ className: classes.textField }}
            variant="outlined"
            id="site-organizations"
            fullWidth
            onChange={handleChange("organizations")}
            value={organizations}
            multiline
            placeholder="Please list any organizations that will be collaborating with you on the installation, maintenance, and monitoring on this site"
          />
          <Grid style={{ margin: "3rem 0 3rem 0" }} item>
            <Button color="primary" variant="contained" onClick={onSubmit}>
              Submit
            </Button>
          </Grid>
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
