import React, { useState } from "react";
import { Map } from "immutable";
import { pick } from "lodash";
import L from "leaflet";
import {
  Typography,
  Grid,
  Box,
  Paper,
  Container,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";

import NavBar from "../../common/NavBar";
import LocationMap from "./LocationMap";
import reemimage from "../../assets/img/reemimage.jpg";

const obligations = [
  "Pay for shipping and any applicable duties",
  "Obtain any necessary permits (if applicable)",
  "Provide and attach a ballast (e.g. 60lb kettlebell)",
  "Deploy spotter with mooring weight (can be done from a kayak)",
  "Maintain spotter (inspect and clean every 6 months)",
  "Conduct initial and periodic photographic surveys and upload imagery to our website",
];

const contactFormElements = [
  { id: "name", label: "Name" },
  { id: "org", label: "Organization" },
  { id: "Email", label: "Email" },
];

const locationFormElements = [
  { id: "lat", label: "Latitude" },
  { id: "lng", label: "Longitude" },
  { id: "depth", label: "Depth (m)" },
];

const agreements = [
  { id: "shipping", label: "Handle any shipping and permitting charges" },
  { id: "buoy", label: "Provide mooring and deploy buoy" },
  { id: "survey", label: "Conduct initial survey" },
];

const Apply = ({ classes }: ApplyProps) => {
  const [formModel, setFormModel] = useState(Map<String, String | boolean>());
  const [markerPosition, setMarkerPosition] = useState<L.LatLngTuple>([
    37.773972,
    -122.431297,
  ]);

  function updateFormElement(id: String, value: String | boolean) {
    setFormModel(formModel.set(id, value));
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
      <Box py={4}>
        <Container>
          <Grid container spacing={6}>
            <Grid item xs={7}>
              <Typography variant="h3" gutterBottom>
                Manage your local reef
              </Typography>

              <Typography>
                We will be starting with our deployments in August and would
                love to have you apply to get free access to our system.
                We&apos;ll have more more more information coming shortly.
                Submitting the application doesn&apos;t obligate you, if you
                have questions please first take a look at our FAQ page and if
                you don&apos;t get the answer you&apos;re looking for then email
                info@aqualink.org.
              </Typography>

              <Box mt={4}>
                <img src={reemimage} alt="Reefs" style={{ width: "100%" }} />
              </Box>
            </Grid>

            <Grid item xs={5}>
              <Box bgcolor="grey.100" p={4}>
                <Typography variant="h4" gutterBottom>
                  Your Obligations
                </Typography>

                <Typography component="div">
                  You will be given a free smart buoy but there are some things
                  you will be expected to do or provide:
                  <ol>
                    {obligations.map((item) => (
                      <li key={item} className={classes.listItem}>
                        {item}
                      </li>
                    ))}
                  </ol>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Box bgcolor="grey.100" mt={8} p={4}>
          <Container>
            <Grid container spacing={6}>
              <Grid item xs={7}>
                <LocationMap
                  markerPosition={markerPosition}
                  setMarkerPosition={setMarkerPosition}
                />
              </Grid>

              <Grid item xs={5}>
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
                              label={label}
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
                          <Grid item xs={6} key={label}>
                            <TextField
                              id={id}
                              label={label}
                              value={formModel.get(id, "")}
                              onChange={(e) =>
                                updateFormElement(id, e.target.value)
                              }
                              {...textFieldProps}
                            />
                          </Grid>
                        ))}

                        <Grid item xs={12}>
                          Agree to:
                          <FormGroup>
                            {agreements.map(({ id, label }) => (
                              <FormControlLabel
                                key={label}
                                className={classes.formControlLabel}
                                control={
                                  <Checkbox
                                    color="primary"
                                    checked={
                                      formModel.get(id, false) as boolean
                                    }
                                    onChange={(_, checked) =>
                                      updateFormElement(id, checked)
                                    }
                                    name="checkedA"
                                  />
                                }
                                label={label}
                              />
                            ))}
                          </FormGroup>
                        </Grid>

                        <Grid item xs={12}>
                          <Button fullWidth variant="contained" color="primary">
                            Submit
                          </Button>
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
