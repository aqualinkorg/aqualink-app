import React from "react";
import { Theme, Grid, Box, Typography, makeStyles } from "@material-ui/core";
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
  chipWidth,
  subtitle,
}: UpdateInfoProps) => {
  const classes = useStyles({ chipWidth });
  return (
    <Grid
      className={`${classes.updateInfo} ${withMargin && classes.withMargin}`}
      container
      justify="space-between"
      alignItems="center"
      item
    >
      <Grid item className={classes.dateInfoWrapper}>
        <Grid container alignItems="center" justify="center">
          <Grid item>
            <UpdateIcon className={classes.updateIcon} fontSize="small" />
          </Grid>
          <Grid item className={classes.dateInfo}>
            <Box display="flex" flexDirection="column">
              {relativeTime && (
                <Typography
                  className={classes.updateInfoText}
                  variant="caption"
                >
                  {timeText} {relativeTime}
                </Typography>
              )}
              <Typography className={classes.updateInfoText} variant="caption">
                {frequency ? `Updated ${frequency}` : subtitle}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <Chip
        live={live}
        href={live ? undefined : href}
        image={image}
        imageText={imageText}
        width={chipWidth}
      />
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
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
  dateInfoWrapper: ({ chipWidth }: { chipWidth?: number }) => ({
    maxWidth: `calc(100% - ${chipWidth || 60}px)`,
    [theme.breakpoints.only("md")]: {
      maxWidth: `calc(100% - ${chipWidth || 48}px)`,
    },
  }),
  dateInfo: {
    maxWidth: "calc(100% - 28px)",
  },
}));

interface UpdateInfoProps {
  relativeTime?: string;
  timeText: string;
  image?: string;
  imageText?: string;
  live?: boolean;
  frequency?: "hourly" | "daily" | "every 6 hours";
  subtitle?: string;
  href?: string;
  withMargin?: boolean;
  chipWidth?: number;
}

UpdateInfo.defaultProps = {
  relativeTime: undefined,
  image: undefined,
  imageText: undefined,
  frequency: undefined,
  subtitle: undefined,
  href: undefined,
  withMargin: false,
  live: false,
  chipWidth: undefined,
};

export default UpdateInfo;
