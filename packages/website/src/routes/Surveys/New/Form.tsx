import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";

import { diveLocationSelector } from "../../../store/Survey/surveySlice";

const SurveyForm = ({ classes }: SurveyFormProps) => {
  const diveLocation = useSelector(diveLocationSelector);

  return (
    <>
      <Grid style={{ marginBottom: "1rem" }} item xs={12}>
        <Typography variant="h6">Dive Location</Typography>
      </Grid>
      <Grid
        style={{ marginBottom: "2rem" }}
        container
        justify="space-between"
        item
        xs={12}
      >
        <Grid item xs={5}>
          <TextField
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            placeholder="LAT"
            label="Latitude"
            value={diveLocation?.lat}
            disabled
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            placeholder="LONG"
            label="Longitude"
            value={diveLocation?.lng}
            disabled
          />
        </Grid>
      </Grid>
      <Grid style={{ marginBottom: "1rem" }} item xs={12}>
        <Typography variant="h6">Weather Conditions</Typography>
      </Grid>
    </>
  );
};

const styles = () =>
  createStyles({
    textField: {
      color: "black",
    },
  });

type SurveyFormProps = WithStyles<typeof styles>;

export default withStyles(styles)(SurveyForm);
