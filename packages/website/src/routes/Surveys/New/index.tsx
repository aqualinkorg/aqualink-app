import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
} from "@material-ui/core";

import type { Reef } from "../../../store/Reefs/types";
import Map from "./Map";

const NewSurvey = ({ reef, classes }: NewSurveyProps) => {
  return (
    <Grid className={classes.root} container justify="center">
      <Grid item xs={10}>
        {reef.name && (
          <Typography variant="h5">{`NEW SURVEY FOR ${reef.name.toUpperCase()}`}</Typography>
        )}
      </Grid>
      <Grid
        style={{ marginTop: "2rem" }}
        container
        justify="space-between"
        item
        xs={10}
      >
        <Grid item xs={12}>
          <Typography style={{ fontWeight: "normal" }} variant="h6">
            Choose survey location from map
          </Typography>
        </Grid>
        <Grid className={classes.mapContainer} item xs={6}>
          <Map polygon={reef.polygon} />
        </Grid>
        <Grid item xs={5}>
          Hello
        </Grid>
      </Grid>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
    mapContainer: {
      height: "30rem",
    },
  });

interface NewSurveyIncomingProps {
  reef: Reef;
}

type NewSurveyProps = NewSurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(NewSurvey);
