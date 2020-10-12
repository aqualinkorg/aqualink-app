import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { Map, fromJS } from "immutable";
import { pick, isEmpty } from "lodash";
import L from "leaflet";
import isEmail from "validator/lib/isEmail";
import isNumeric from "validator/lib/isNumeric";
import isLatLong from "validator/lib/isLatLong";
import {
  Typography,
  Grid,
  Box,
  Paper,
  Container,
  TextField,
  Button,
  Snackbar,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Tooltip,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useSelector } from "react-redux";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import LocationMap from "./LocationMap";
import { userInfoSelector } from "../../store/User/userSlice";
import reefServices from "../../services/reefServices";

const contactFormElements = [
  { id: "name", label: "Name" },
  { id: "org", label: "Organization" },
  {
    id: "email",
    label: "Email",
    validator: (email: string) => isEmail(email),
    errorMessage: "Enter a valid email",
  },
];

const Apply = ({ classes }: ApplyProps) => {
  const user = useSelector(userInfoSelector);
  const [formModel, setFormModel] = useState(Map<string, string | boolean>());
  const [formErrors, setFormErrors] = useState(Map<string, string>());
  const [snackbarOpenFromDatabase, setSnackbarOpenFromDatabase] = useState<
    boolean
  >(false);
  const [snackbarOpenFromCarto, setSnackbarOpenFromCarto] = useState<boolean>(
    false
  );
  const [databaseSubmissionOk, setDatabaseSubmissionOk] = useState<boolean>(
    false
  );
  const [cartoSubmissionOk, setCartoSubmissionOk] = useState<boolean>(false);
  const [newReefId, setNewReefId] = useState<number>();

  useEffect(() => {
    if (user && user.fullName && user.email) {
      setFormModel(
        formModel
          .set("name", user.fullName)
          .set("org", user.organization || " ")
          .set("email", user.email)
      );
    } else {
      setFormModel(formModel.set("name", "").set("org", "").set("email", ""));
    }
  }, [user, formModel]);

  const locationFormElements = [
    {
      id: "lat",
      label: "Latitude",
      validator: (lat: string) => isLatLong(`${lat},${formModel.get("lng")}`),
      errorMessage: "Enter a valid lat/lng",
    },
    { id: "lng", label: "Longitude" },
    { id: "siteName", label: "Site Name" },
    {
      id: "depth",
      label: "Depth (m)",
      validator: isNumeric,
      errorMessage: "Depth should be a number",
    },
  ];

  const joinedFormElements = locationFormElements.concat(contactFormElements);

  function updateFormElement(id: string, value: string | boolean) {
    setFormModel(formModel.set(id, value));
  }

  function updateMarkerPosition(position: L.LatLngTuple) {
    const [lat, lng] = position;
    setFormModel(
      formModel.set("lat", lat.toString()).set("lng", lng.toString())
    );
  }

  function handleFormSubmission() {
    const errors = joinedFormElements.reduce(
      (acc, { id, label, validator, errorMessage }) => {
        const value = formModel.get(id);
        if (!value) {
          return { ...acc, [id]: `"${label}" is required` };
        }

        if (validator && !validator(value as string)) {
          return { ...acc, [id]: errorMessage };
        }

        return acc;
      },
      {}
    );

    setFormErrors(fromJS(errors));

    if (isEmpty(errors)) {
      const time = new Date().getTime();
      const date = new Date(time);

      const {
        name,
        org,
        email,
        siteName,
        lat,
        lng,
        depth,
      } = formModel.toJS() as {
        [key: string]: string;
      };

      // Add to database
      if (user && user.token) {
        reefServices
          .registerReef(
            siteName,
            parseFloat(lat),
            parseFloat(lng),
            parseInt(depth, 10),
            user.token
          )
          .then(({ data }) => {
            setNewReefId(data.reef.id);
            setDatabaseSubmissionOk(true);
            setSnackbarOpenFromDatabase(true);
          })
          .catch((error) => {
            setDatabaseSubmissionOk(false);
            setSnackbarOpenFromDatabase(true);
            console.error(error);
          });
      }

      // Add to Carto
      const { REACT_APP_CARTO_API_KEY } = process.env;
      const position = JSON.stringify({
        type: "Point",
        coordinates: [lng, lat],
      });

      const sql = `INSERT INTO proposed_sites (the_geom, name, org, email, lat, lng, depth, date)
        VALUES (ST_SetSRID(ST_GeomFromGeoJSON('${position}'),4326),'${name}','${org}','${email}','${lat}','${lng}','${depth}','${date}')`;
      fetch(
        `https://drewjgray.carto.com/api/v2/sql?&q=${sql}&api_key=${REACT_APP_CARTO_API_KEY}`
      )
        .then((response) => {
          setCartoSubmissionOk(response.ok);
          setSnackbarOpenFromCarto(true);
        })
        .catch((error) => {
          setCartoSubmissionOk(false);
          setSnackbarOpenFromCarto(true);
          console.error(error);
        });
    }
  }

  const textFieldProps = {
    fullWidth: true,
    variant: "outlined" as "outlined",
    size: "small" as "small",
    InputProps: { classes: pick(classes, ["root", "notchedOutline"]) },
  };

  return (
    <>
      <NavBar searchLocation={false} />
      <Box pt={4}>
        <Container>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Typography variant="h3" gutterBottom>
                Register your local site
              </Typography>

              <Typography>
                To get your local site registered with Aqualink to start
                tracking surface temperatures and survey imagery please complete
                the form below. Your site will become immediately available for
                you to see though some of the data will take up to 24 hours to
                show up.
              </Typography>

              <Typography>
                Once you have your site registered you can apply to get a smart
                buoy to track underwater temperatures as well. If approved,
                Aqualink will provide you with a buoy free of charge but you
                will be responsible for paying the shipping and import duties
                costs (if applicable).
              </Typography>
            </Grid>
          </Grid>
        </Container>

        <Box bgcolor="grey.100" mt={8} p={{ xs: 0, md: 4 }}>
          <Container>
            <Grid container spacing={6}>
              <Grid item xs={12} md={7}>
                <LocationMap
                  markerPositionLat={formModel.get("lat", "") as string}
                  markerPositionLng={formModel.get("lng", "") as string}
                  updateMarkerPosition={updateMarkerPosition}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper elevation={2}>
                  <Box color="text.secondary" p={4}>
                    <Typography variant="h4" gutterBottom>
                      Application Form
                    </Typography>

                    <Grid container spacing={2}>
                      <>
                        {contactFormElements.map(({ id, label }) => (
                          <Grid item xs={12} key={label}>
                            <TextField
                              id={id}
                              disabled
                              label={label}
                              error={formErrors.get(id, "").length !== 0}
                              helperText={formErrors.get(id, "")}
                              value={formModel.get(id, "")}
                              onChange={(e) =>
                                updateFormElement(id, e.target.value)
                              }
                              {...textFieldProps}
                            />
                          </Grid>
                        ))}

                        <Grid item xs={12}>
                          <Typography>Location: Select point on map</Typography>
                        </Grid>

                        {locationFormElements.map(({ id, label }) => (
                          <Grid
                            item
                            // eslint-disable-next-line no-nested-ternary
                            xs={id === "siteName" ? 8 : id === "depth" ? 4 : 6}
                            key={label}
                          >
                            <TextField
                              id={id}
                              label={label}
                              error={formErrors.get(id, "").length !== 0}
                              helperText={formErrors.get(id, "")}
                              value={formModel.get(id, "")}
                              onChange={(e) =>
                                updateFormElement(id, e.target.value)
                              }
                              {...textFieldProps}
                            />
                          </Grid>
                        ))}

                        <Grid item xs={12}>
                          <Tooltip
                            disableHoverListener={Boolean(user)}
                            title="Please login to register a site"
                          >
                            <div>
                              <Button
                                disabled={!user}
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleFormSubmission}
                              >
                                Submit
                              </Button>
                            </div>
                          </Tooltip>
                        </Grid>
                      </>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      {newReefId && <Redirect to={`/reefs/${newReefId}`} />}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={snackbarOpenFromCarto && snackbarOpenFromDatabase}
        autoHideDuration={4000}
        onClose={() => {
          setSnackbarOpenFromCarto(false);
          setSnackbarOpenFromDatabase(false);
        }}
      >
        <Alert
          onClose={() => {
            setSnackbarOpenFromCarto(false);
            setSnackbarOpenFromDatabase(false);
          }}
          severity={
            databaseSubmissionOk && cartoSubmissionOk ? "success" : "error"
          }
          elevation={6}
          variant="filled"
        >
          {databaseSubmissionOk && cartoSubmissionOk
            ? "Application successfully submitted."
            : "Something went wrong, please try again"}
        </Alert>
      </Snackbar>
      <Footer />
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    listItem: {
      marginTop: theme.spacing(1),
    },

    root: {
      color: theme.palette.text.secondary,

      "&:hover $notchedOutline": {
        borderColor: theme.palette.grey[300],
      },
    },

    notchedOutline: {},

    formControlLabel: {
      marginBottom: 0,
    },
  });

type ApplyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Apply);
