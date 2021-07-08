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
import { grey } from "@material-ui/core/colors";
import UpdateIcon from "@material-ui/icons/Update";
import Chip from "../Chip";

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
            {relativeTime && (
              <Typography className={classes.updateInfoText} variant="caption">
                {timeText} {relativeTime}
              </Typography>
            )}
            {frequency && (
              <Typography className={classes.updateInfoText} variant="caption">
                Updated {frequency}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Grid>
    <Chip
      live={live}
      href={live ? undefined : href}
      image={image}
      imageText={imageText}
    />
  </Grid>
);

const styles = (theme: Theme) =>
  createStyles({
    updateInfo: {
      backgroundColor: grey[400],
      color: grey[700],
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
      [theme.breakpoints.between("md", "md")]: {
        fontSize: 8.5,
      },
    },
  });

interface UpdateInfoIncomingProps {
  relativeTime: string | undefined;
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
