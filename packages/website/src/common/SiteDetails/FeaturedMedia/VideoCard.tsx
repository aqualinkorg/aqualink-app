import React from "react";
import {
  Box,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import grey from "@material-ui/core/colors/grey";
import { fade } from "@material-ui/core/styles/colorManipulator";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import YouTube, { Options } from "react-youtube";

const VideoCard = ({ url, loading, errored, classes }: VideoCardProps) => {
  const playerOpts: Options = {
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      modestbranding: 1,
    },
  };

  if (loading) {
    return (
      <Skeleton
        className={classes.loadingAnimation}
        height="100%"
        variant="rect"
      />
    );
  }

  if (errored) {
    return (
      <Box className={classes.errorWrapper}>
        <VideocamOffIcon color="secondary" fontSize="large" />
        <Typography variant="h4" color="secondary" align="center">
          Video stream is not live
        </Typography>
      </Box>
    );
  }

  return (
    <YouTube
      containerClassName={classes.fullHeightAndWidth}
      className={classes.fullHeightAndWidth}
      opts={playerOpts}
      videoId={url}
    />
  );
};

const styles = () =>
  createStyles({
    loadingAnimation: {
      backgroundColor: fade(grey[600], 0.5),
    },

    fullHeightAndWidth: {
      height: "100%",
      width: "100%",
    },

    errorWrapper: {
      backgroundColor: grey[200],
      flexDirection: "column",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });

interface VideoCardIncomingProps {
  url: string;
  loading: boolean;
  errored: boolean;
}

type VideoCardProps = VideoCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(VideoCard);
