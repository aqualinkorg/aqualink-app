import React from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
} from '@material-ui/core';

import type { Site } from 'store/Sites/types';
import type { SurveyState } from 'store/Survey/types';
import { getSiteNameAndRegion } from 'store/Sites/helpers';
import { displayTimeInLocalTimezone } from 'helpers/dates';
import {
  getNumberOfImages,
  getNumberOfSurveyPoints,
} from 'helpers/surveyMedia';
import ObservationBox from './ObservationBox';

const SurveyDetails = ({ site, survey, classes }: SurveyDetailsProps) => {
  const nSurveyPoints = getNumberOfSurveyPoints(survey?.surveyMedia || []);
  const nImages = getNumberOfImages(survey?.surveyMedia || []);
  const { region: regionName } = getSiteNameAndRegion(site);
  return (
    <Grid container item xs={12} justifyContent="space-between" spacing={2}>
      {survey && (
        <Grid container item direction="column" spacing={3} xs={12} lg={8}>
          <Grid item>
            <Typography variant="subtitle1">
              {displayTimeInLocalTimezone({
                isoDate: survey.diveDate,
                format: "LL/dd/yyyy 'at' h:mm a",
                displayTimezone: false,
                timeZone: site.timezone,
              })}
            </Typography>
          </Grid>
          <Grid container item>
            <Grid container item direction="column" xs={12} md={4}>
              <Typography className={classes.regionName}>
                {regionName}
              </Typography>
              <Typography className={classes.siteName} variant="subtitle1">
                {site.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                color="primary"
                variant="h4"
                className={classes.inlineText}
              >
                {nSurveyPoints}
              </Typography>
              <Typography
                color="initial"
                variant="h6"
                className={classes.inlineText}
              >
                SURVEY POINT{nSurveyPoints === 1 ? '' : 'S'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                color="primary"
                variant="h4"
                className={classes.inlineText}
              >
                {nImages}
              </Typography>
              <Typography
                color="initial"
                variant="h6"
                className={classes.inlineText}
              >
                IMAGE{nImages === 1 ? '' : 'S'}
              </Typography>
            </Grid>
          </Grid>
          {survey.comments && (
            <Grid container item direction="column">
              <Typography variant="h6">Comments</Typography>
              <Typography variant="subtitle1">{survey.comments}</Typography>
            </Grid>
          )}
        </Grid>
      )}
      <Grid item xs={12} md={6} lg={3}>
        <ObservationBox
          depth={site.depth}
          date={survey?.diveDate}
          satelliteTemperature={survey?.satelliteTemperature}
          dailyData={site.dailyData || []}
        />
      </Grid>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    regionName: {
      fontSize: 18,
    },
    siteName: {
      maxWidth: '95%',
      overflowWrap: 'break-word',
    },
    inlineText: {
      display: 'inline',
      fontWeight: 'normal',
      marginLeft: '0.5rem',
    },
  });

interface SurveyDetailsIncomingProps {
  site: Site;
  survey?: SurveyState | null;
}

SurveyDetails.defaultProps = {
  survey: null,
};

type SurveyDetailsProps = SurveyDetailsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyDetails);
