import React from 'react';
import { Box, Typography, Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

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
