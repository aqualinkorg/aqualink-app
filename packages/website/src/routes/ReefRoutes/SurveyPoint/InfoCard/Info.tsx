import React from "react";
import {
  Grid,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";

const Info = ({
  pointName,
  reefName,
  reefRegion,
  nSurveys,
  lat,
  lng,
  classes,
}: InfoProps) => {
  return (
    <Grid className={classes.cardInfo} item xs={12} md={6}>
      <Grid container justify="space-between" spacing={2}>
        <Grid item>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="h5" color="textSecondary">
                {pointName}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {reefName}
                {reefRegion && `, ${reefRegion}`}
              </Typography>
            </Grid>
            {lat && lng && (
              <Grid item>
                <Grid container item spacing={1}>
                  <Grid item>
                    <Typography variant="subtitle2" color="textSecondary">
                      LAT: {lat}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle2" color="textSecondary">
                      LNG: {lng}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Grid container justify="space-between" item spacing={4}>
            <Grid item>
              <Grid container alignItems="baseline" item spacing={1}>
                <Grid item>
                  <Typography variant="h5" className={classes.coloredText}>
                    {nSurveys}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" color="textSecondary">
                    SURVEYS
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="baseline" item spacing={1}>
                <Grid item>
                  {/* TODO: Calculate actual number of images with a util */}
                  <Typography variant="h5" className={classes.coloredText}>
                    2
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" color="textSecondary">
                    IMAGES
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    cardInfo: {
      padding: 24,
    },

    coordinates: {
      marginTop: 16,
    },

    coloredText: {
      color: theme.palette.primary.main,
    },
  });

interface InfoIncomingProps {
  pointName: string;
  reefName: string | null;
  reefRegion: string | null | undefined;
  nSurveys: number;
  lat: number | undefined;
  lng: number | undefined;
}

type InfoProps = InfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Info);
