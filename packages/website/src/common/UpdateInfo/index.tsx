import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Box,
  Typography,
} from "@material-ui/core";
import UpdateIcon from "@material-ui/icons/Update";
import { Link } from "react-router-dom";

const UpdateInfo = ({
  relativeTime,
  timeText,
  image,
  imageText,
  live,
  frequency,
  href,
  withMargin,
  classes,
}: UpdateInfoProps) => (
  <Grid
    className={`${classes.updateInfo} ${withMargin && classes.withMargin}`}
    container
    justify="space-between"
    alignItems="center"
    item
  >
    <Grid item>
      <Grid container alignItems="center" justify="center">
        <Grid item>
          <UpdateIcon className={classes.updateIcon} fontSize="small" />
        </Grid>
        <Grid item>
          <Box display="flex" flexDirection="column">
            <Typography className={classes.updateInfoText} variant="caption">
              {timeText} {relativeTime}
            </Typography>
            {frequency && (
              <Typography className={classes.updateInfoText} variant="caption">
                Updated {frequency}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Grid>
    <Grid className={classes.nooaChip} item>
      <Grid container alignItems="center" justify="center">
        {live ? (
          <>
            <div className={classes.circle} />
            <Typography className={classes.nooaChipText}>LIVE</Typography>
          </>
        ) : (
          <Link
            to={{ pathname: href }}
            target="_blank"
            className={classes.nooaLink}
          >
            <Typography className={classes.nooaChipText}>
              {imageText}
            </Typography>
            {image && (
              <img
                className={classes.sensorImage}
                alt="sensor-type"
                src={image}
              />
            )}
          </Link>
        )}
      </Grid>
    </Grid>
  </Grid>
);

const styles = (theme: Theme) => {
  const maxWidth = 1080;

  return createStyles({
    updateInfo: {
      backgroundColor: "#c4c4c4",
      color: "#757575",
      padding: 4,
      minHeight: 40,
    },
    withMargin: {
      marginTop: 32,
    },
    updateIcon: {
      marginRight: 4,
      height: 24,
      width: 24,
    },
    updateInfoText: {
      [theme.breakpoints.between("md", maxWidth)]: {
        fontSize: 8.5,
      },
    },
    nooaChip: {
      backgroundColor: "#dddddd",
      borderRadius: 8,
      height: 24,
      width: 60,
      display: "flex",
      [theme.breakpoints.between("md", maxWidth)]: {
        width: 48,
      },
    },
    nooaLink: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      color: "inherit",
      "&:hover": {
        textDecoration: "none",
        color: "inherit",
      },
    },
    nooaChipText: {
      fontSize: 9,
      [theme.breakpoints.between("md", maxWidth)]: {
        fontSize: 7,
      },
    },
    sensorImage: {
      height: 18,
      width: 18,
    },
    circle: {
      backgroundColor: "#51DD00",
      borderRadius: "50%",
      height: 8.4,
      width: 8.4,
      marginRight: 5,
    },
  });
};

interface UpdateInfoIncomingProps {
  relativeTime: string | null;
  timeText: string;
  image: string | null;
  imageText: string | null;
  live: boolean;
  frequency: "hourly" | "daily" | "every 6 hours" | null;
  href?: string;
  withMargin?: boolean;
}

UpdateInfo.defaultProps = {
  href: "",
  withMargin: false,
};

type UpdateInfoProps = UpdateInfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UpdateInfo);
