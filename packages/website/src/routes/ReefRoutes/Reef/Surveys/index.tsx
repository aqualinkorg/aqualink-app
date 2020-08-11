import React, { useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Typography,
  Select,
  FormControl,
  MenuItem,
} from "@material-ui/core";

import Timeline from "./Timeline";

const Surveys = ({ classes }: SurveysProps) => {
  const [history, setHistory] = useState<string>("all");
  const [observation, setObservation] = useState<string>("any");

  const handleHistoryChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setHistory(event.target.value as string);
  };

  const handleObservationChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setObservation(event.target.value as string);
  };

  return (
    <Grid className={classes.root} container justify="center" item xs={12}>
      <Grid
        className={classes.surveyWrapper}
        container
        justify="center"
        item
        xs={6}
        alignItems="center"
      >
        <Grid container justify="center" item xs={4}>
          <Typography className={classes.title}>Survey History</Typography>
        </Grid>
        <Grid container alignItems="center" justify="center" item xs={4}>
          <Grid item>
            <Typography variant="h6" className={classes.subTitle}>
              Survey History:
            </Typography>
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <Select
                labelId="survey-history"
                id="survey-history"
                name="survey-history"
                value={history}
                onChange={handleHistoryChange}
                className={classes.selectedItem}
              >
                <MenuItem value="all">
                  <Typography className={classes.menuItem} variant="h6">
                    All
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container alignItems="center" justify="center" item xs={4}>
          <Grid item>
            <Typography variant="h6" className={classes.subTitle}>
              Observation:
            </Typography>
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <Select
                labelId="survey-observation"
                id="survey-observation"
                name="survey-observation"
                value={observation}
                onChange={handleObservationChange}
                className={classes.selectedItem}
              >
                <MenuItem value="any">
                  <Typography className={classes.menuItem} variant="h6">
                    Any
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
      <Grid container justify="center" item xs={10}>
        <Timeline />
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: "#f5f6f6",
      marginTop: "5rem",
    },
    surveyWrapper: {
      marginTop: "5rem",
    },
    title: {
      fontSize: 22,
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.45,
      letterSpacing: "normal",
      color: "#2a2a2a",
    },
    subTitle: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1,
      letterSpacing: "normal",
      color: "#474747",
      marginRight: "1rem",
    },
    formControl: {
      minWidth: 120,
    },
    selectedItem: {
      color: theme.palette.primary.main,
    },
    menuItem: {
      color: theme.palette.primary.main,
    },
  });

type SurveysProps = WithStyles<typeof styles>;

export default withStyles(styles)(Surveys);
