import React from "react";
import { AppBar, Toolbar, Grid, Button } from "@material-ui/core";

const HomePageNavBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Grid item xs={12}>
          <Grid container justify="flex-end" alignItems="center">
            <Grid item>
              <Button variant="contained" color="secondary">
                Log In
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default HomePageNavBar;
