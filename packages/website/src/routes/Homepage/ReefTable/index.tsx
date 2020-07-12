import React from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  CardMedia,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";

const reefImage = require("../../../assets/reef-image.png");

const ReefTable = ({ classes }: ReefTableProps) => {
  return (
    <>
      <Grid container justify="center">
        <Paper elevation={6} className={classes.selectedReef}>
          <Grid className={classes.card} container item xs={12}>
            <Grid item xs={3}>
              <CardMedia className={classes.cardImage} image={reefImage} />
            </Grid>
            <Grid item xs={7}>
              {" "}
            </Grid>
            <Grid container direction="row" alignItems="center" item xs={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  TEMP AT 25M
                </Typography>
                <Typography
                  className={classes.cardMetrics}
                  variant="h4"
                  color="textSecondary"
                >
                  29.5&#8451;
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  SURFACE TEMP
                </Typography>
                <Typography
                  className={classes.cardMetrics}
                  variant="h4"
                  color="textSecondary"
                >
                  31.8&#8451;
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  DEG. HEAT. DAYS
                </Typography>
                <Typography
                  className={classes.cardMetrics}
                  variant="h4"
                  color="textSecondary"
                >
                  14
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button size="small" variant="contained" color="primary">
                  EXPLORE
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    selectedReef: {
      marginTop: "1rem",
      width: "49vw",
      height: "25vh",
    },
    card: {
      height: "100%",
    },
    cardImage: {
      borderRadius: "4px 0 0 4px",
      height: "100%",
    },
    cardMetrics: {
      color: theme.palette.primary.main,
    },
  });

interface ReefTableProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(ReefTable);
