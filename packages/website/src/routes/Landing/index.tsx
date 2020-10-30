import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import NavBar from "../../common/NavBar";

const LandingPage = ({ classes }: LandingPageProps) => {
  return (
    <>
      <NavBar routeButtons searchLocation={false} />
    </>
  );
};

const styles = () =>
  createStyles({
    root: {},
  });

type LandingPageProps = WithStyles<typeof styles>;

export default withStyles(styles)(LandingPage);
