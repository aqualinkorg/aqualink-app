import React from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';

import { displayTimeInLocalTimezone } from 'helpers/dates';
import AddButton from '../AddButton';
import SurveyCard from '../SurveyCard';
import incomingStyles from '../styles';
import { TimelineProps } from './types';
import LoadingSkeleton from '../../../LoadingSkeleton';

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
      {surveys.map((survey, index) => (
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
              {survey?.diveDate && (
                <Typography variant="h6" className={classes.dates}>
                  {displayTimeInLocalTimezone({
                    isoDate: survey.diveDate,
                    format: 'MM/DD/YYYY',
                    displayTimezone: false,
                    timeZone,
                  })}
                </Typography>
              )}
            </LoadingSkeleton>
          </Grid>
          <Grid className={classes.surveyCardWrapper} container item xs={12}>
            <SurveyCard
              pointId={pointId}
              pointName={pointName}
              isAdmin={isAdmin}
              siteId={siteId}
              survey={survey}
              loading={loading}
            />
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
