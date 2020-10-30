import React from "react";
import { Grid, Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const RouteButtons = () => {
  return (
    <Grid container justify="space-evenly" item xs={12} sm={7} md={4}>
      <Grid item>
        <Button component={Link} to="/map">
          MAP
        </Button>
      </Grid>
      <Grid item>
        <Button component={Link} to="/about">
          ABOUT
        </Button>
      </Grid>
      <Grid item>
        <Button component={Link} to="/register">
          REGISTER YOUR SITE
        </Button>
      </Grid>
    </Grid>
  );
};

export default RouteButtons;
