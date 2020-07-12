import React from "react";
import { Grid, withStyles, WithStyles, createStyles } from "@material-ui/core";

import HomepageNavBar from "./NavBar";
import HomepageMap from "./Map";

const Homepage = ({ classes }: HomepageProps) => (
  <>
    <HomepageNavBar />
    <div className={classes.root}>
      <Grid
        style={{ height: "100%" }}
        container
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid className={classes.map} item xs={6}>
          <HomepageMap />
        </Grid>
        <Grid item xs={6}>
          {" "}
        </Grid>
      </Grid>
    </div>
  </>
);

const styles = () =>
  createStyles({
    root: {
      display: "flex",
      alignItems: "center",
      height: "100%",
    },
    map: {
      height: "100%",
    },
  });

interface HomepageProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(Homepage);
