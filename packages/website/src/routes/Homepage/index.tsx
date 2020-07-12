import React from "react";
import { Grid, withStyles, WithStyles, createStyles } from "@material-ui/core";

import HomepageNavBar from "./NavBar";
import HomepageMap from "./Map";
import ReefTable from "./ReefTable";

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
        <Grid className={classes.reefTable} item xs={6}>
          <ReefTable />
        </Grid>
      </Grid>
    </div>
  </>
);

const styles = () =>
  createStyles({
    root: {
      height: "100%",
    },
    map: {
      height: "100%",
    },
    reefTable: {
      height: "calc(100vh - 64px)",
      overflowY: "auto",
    },
  });

interface HomepageProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(Homepage);
