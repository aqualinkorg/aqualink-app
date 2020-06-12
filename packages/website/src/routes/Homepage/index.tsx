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
import HomePageNavBar from "./HomePageNavBar";

const Homepage = ({ classes }: HomepageProps) => (
  <>
    <HomePageNavBar />
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
          <Button href="/reefs" color="primary" variant="contained">
            See Reefs List
          </Button>
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
