import React from 'react';
import {
  Box,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from '@material-ui/core';
import PermMediaIcon from '@material-ui/icons/PermMedia';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';

const MediaCount = ({ images, videos, classes }: MediaCountProps) => {
  return (
    <div className={classes.mediaCount}>
      <Box mr={2}>
        <Typography component="span" variant="subtitle1">
          {images} image{images === 1 ? '' : 's'}
        </Typography>
        <PermMediaIcon className={classes.mediaCountIcon} />
      </Box>
      {videos > 0 && (
        <Box ml={2}>
          <Typography component="span" variant="subtitle1">
            {videos} video{videos === 1 ? '' : 's'}
          </Typography>
          <VideoLibraryIcon className={classes.mediaCountIcon} />
        </Box>
      )}
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    mediaCount: {
      display: 'flex',
    },
    mediaCountIcon: {
      marginLeft: theme.spacing(1),
    },
  });

interface MediaCountIncomingProps {
  images: number;
  videos: number;
}

type MediaCountProps = MediaCountIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaCount);
