import React from 'react';
import { Grid, Typography } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import { displayTimeInLocalTimezone } from 'helpers/dates';
import { times } from 'lodash';
import AddButton from '../AddButton';
import SurveyCard from '../SurveyCard';
import incomingStyles from '../styles';
import { TimelineProps } from './types';
import LoadingSkeleton from '../../../LoadingSkeleton';
import { ReefCheckSurveyCard } from '../ReefCheckSurveyCard';

const TimelineTablet = ({
  siteId,
  loading,
  surveys,
  displayAddButton,
  pointId,
  pointName,
  isAdmin,
  timeZone,
}: TimelineProps) => {
  const classes = useStyles();
  const isSiteIdValid = typeof siteId === 'number';

  return (
    <Grid container item xs={12}>
      {displayAddButton && !loading && (
        <Grid
          className={classes.addNewButtonMobileWrapper}
          container
          alignItems="center"
          item
          xs={12}
        >
          {isSiteIdValid && <AddButton siteId={siteId} />}
        </Grid>
      )}
      {(loading ? times(2, () => null) : surveys).map((survey, index) => (
        <Grid
          key={survey?.id || `loading-survey-${index}`}
          className={classes.surveyWrapper}
          container
          justifyContent="center"
          item
          xs={12}
        >
          <Grid className={classes.dateWrapper} item xs={11}>
            <LoadingSkeleton
              loading={loading}
              variant="text"
              width="30%"
              lines={1}
            >
              {survey?.date && (
                <Typography variant="h6" className={classes.dates}>
                  {displayTimeInLocalTimezone({
                    isoDate: survey.date,
                    format: 'LL/dd/yyyy',
                    displayTimezone: false,
                    timeZone,
                  })}
                </Typography>
              )}
            </LoadingSkeleton>
          </Grid>
          <Grid className={classes.surveyCardWrapper} container item xs={12}>
            {survey?.type === 'survey' && (
              <SurveyCard
                pointId={pointId}
                pointName={pointName}
                isAdmin={isAdmin}
                siteId={siteId}
                survey={survey}
                loading={loading}
              />
            )}
            {survey?.type === 'reefCheckSurvey' && (
              <ReefCheckSurveyCard survey={survey} />
            )}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  ...incomingStyles,
  addNewButtonMobileWrapper: {
    marginBottom: '1rem',
  },
  surveyWrapper: {
    marginTop: '2rem',
  },
}));

export default TimelineTablet;
