import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Box,
  Typography,
} from "@material-ui/core";
import UpdateIcon from "@material-ui/icons/Update";

const UpdateInfo = ({ timestamp, image, classes }: UpdateInfoProps) => (
  <Grid
    className={classes.updateInfo}
    container
    justify="space-around"
    alignItems="center"
    item
    spacing={1}
  >
    <Grid item>
      <Grid container alignItems="center" justify="center">
        <Grid item>
          <UpdateIcon className={classes.updateIcon} fontSize="small" />
        </Grid>
        <Grid item>
          <Box display="flex" flexDirection="column">
            <Typography variant="caption">
              Last data received {timestamp}
            </Typography>
            <Typography variant="caption">Updated daily</Typography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
    <Grid className={classes.nooaChip} item>
      <Grid container alignItems="center">
        <Typography variant="caption">NOAA</Typography>
        <img className={classes.sensorImage} alt="sensor-type" src={image} />
      </Grid>
    </Grid>
  </Grid>
);

const styles = () =>
  createStyles({
    updateInfo: {
      backgroundColor: "#c4c4c4",
      color: "#757575",
      padding: " 0.5rem 0.125rem",
    },
    updateIcon: {
      marginRight: 5,
      height: "2rem",
      width: "2rem",
    },
    nooaChip: {
      backgroundColor: "#dddddd",
      borderRadius: 4,
      height: 26,
    },
    sensorImage: {
      height: 20,
      width: 20,
    },
  });

interface UpdateInfoIncomingProps {
  timestamp: string | null;
  image: string;
}

type UpdateInfoProps = UpdateInfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UpdateInfo);
