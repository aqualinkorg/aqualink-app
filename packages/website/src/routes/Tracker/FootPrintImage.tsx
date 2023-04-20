import React from 'react';
import {
  Grid,
  Typography,
  createStyles,
  Theme,
  makeStyles,
} from '@material-ui/core';

import footprint from '../../assets/img/tracker-page/footprint.png';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    footPrintImageText: {
      marginRight: theme.spacing(2),
    },
    footPrintImageLink: {
      textAlign: 'right',
    },
    footPrintImage: ({ imageHeight }: FootPrintImageProps) =>
      imageHeight ? { height: imageHeight } : {},
  }),
);

const FootPrintImage = ({ imageHeight }: FootPrintImageProps) => {
  const classes = useStyles({ imageHeight });
  return (
    <Grid container direction="column">
      <Grid item className={classes.footPrintImageText}>
        <Typography align="right">Built with support from:</Typography>
      </Grid>
      <Grid item className={classes.footPrintImageLink}>
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://www.footprintcoalition.com/"
        >
          <img
            className={classes.footPrintImage}
            src={footprint}
            alt="footprint"
          />
        </a>
      </Grid>
    </Grid>
  );
};

interface FootPrintImageProps {
  imageHeight?: number;
}

FootPrintImage.defaultProps = {
  imageHeight: undefined,
};

export default FootPrintImage;
