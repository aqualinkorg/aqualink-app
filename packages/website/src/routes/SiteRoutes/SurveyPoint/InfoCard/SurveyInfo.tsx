import React from 'react';
import { Grid, Typography, Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { SurveyListItem } from 'store/Survey/types';
import { findImagesAtSurveyPoint } from 'helpers/surveys';

function SurveyInfo({ surveys, pointId, classes }: SurveyInfoProps) {
  const nSurveys = surveys.length;
  const nImages = findImagesAtSurveyPoint(surveys, pointId);

  return (
    <Grid item>
      <Grid
        className={classes.autoWidth}
        container
        justifyContent="space-between"
        spacing={4}
      >
        <Grid item>
          <Grid
            className={classes.autoWidth}
            container
            alignItems="baseline"
            spacing={1}
          >
            <Grid item>
              <Typography variant="h5" className={classes.coloredText}>
                {nSurveys}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" color="textSecondary">
                SURVEY
                {nSurveys > 1 ? 'S' : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid
            className={classes.autoWidth}
            container
            alignItems="baseline"
            spacing={1}
          >
            <Grid item>
              <Typography variant="h5" className={classes.coloredText}>
                {nImages}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" color="textSecondary">
                IMAGE
                {nImages > 1 ? 'S' : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    autoWidth: {
      width: 'auto',
    },

    coloredText: {
      color: theme.palette.primary.main,
    },
  });

interface SurveyInfoIncomingProps {
  pointId: number;
  surveys: SurveyListItem[];
}

type SurveyInfoProps = SurveyInfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyInfo);
