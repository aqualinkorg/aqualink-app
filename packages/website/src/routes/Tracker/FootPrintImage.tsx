import React from 'react';
import { Grid, Typography, Theme } from '@mui/material';

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

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
            src={footprint.src}
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

export default FootPrintImage;
