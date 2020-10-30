import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

const LandingPage = ({ classes }: LandingPageProps) => {
  return <div className={classes.root}>Landing Page</div>;
};

const styles = () =>
  createStyles({
    root: {},
  });

type LandingPageProps = WithStyles<typeof styles>;

export default withStyles(styles)(LandingPage);
