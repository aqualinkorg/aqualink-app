import React from "react";
import {
  Button,
  Typography,
  Grid,
  Theme,
  withStyles,
  WithStyles,
  createStyles,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import HomepageNavBar from "./HomepageNavBar";

const Homepage = ({ classes }: HomepageProps) => (
  <>
    <HomepageNavBar />
    <div className={classes.root}>
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item>
          <Typography gutterBottom color="primary" variant="h1">
            Welcome to Aqualink App
          </Typography>
        </Grid>
        <Grid item>
          <Link style={{ textDecoration: "none" }} to="/reefs">
            <Button color="primary" variant="contained">
              See Reefs List
            </Button>
          </Link>
        </Grid>
      </Grid>
    </div>
  </>
);

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      alignItems: "center",
      height: "100%",
      backgroundColor: theme.palette.text.secondary,
    },
  });

interface HomepageProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(Homepage);
