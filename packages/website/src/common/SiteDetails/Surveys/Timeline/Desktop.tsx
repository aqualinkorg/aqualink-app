import React from 'react';
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@material-ui/lab';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import classNames from 'classnames';
import grey from '@material-ui/core/colors/grey';

import { displayTimeInLocalTimezone } from 'helpers/dates';
import { times } from 'lodash';
import AddButton from '../AddButton';
import SurveyCard from '../SurveyCard';
import LoadingSkeleton from '../../../LoadingSkeleton';
import incomingStyles from '../styles';
import { TimelineProps } from './types';
import { ReefCheckSurveyCard } from '../ReefCheckSurveyCard';

const CONNECTOR_COLOR = grey[500];

const TimelineDesktop = ({
  siteId,
  loading,
  displayAddButton,
  surveys,
  pointId,
  pointName,
  isAdmin,
  timeZone,
}: TimelineProps) => {
  const classes = useStyles();
  const isSiteIdValid = typeof siteId === 'number';

  return (
    <Timeline>
      {displayAddButton && !loading && (
        <TimelineItem className={classes.timelineItem}>
          <TimelineOppositeContent
            className={classNames(
              classes.timelineOppositeContent,
              classes.addNewButtonOpposite,
            )}
          />
          <TimelineContent className={classes.addNewButtonWrapper}>
            {isSiteIdValid && <AddButton siteId={siteId} />}
          </TimelineContent>
        </TimelineItem>
      )}
      {(loading ? times(2, () => null) : surveys).map((survey, index) => (
        <TimelineItem
          key={survey?.id || `loading-survey-${index}`}
          className={classes.timelineItem}
        >
          <TimelineOppositeContent className={classes.timelineOppositeContent}>
            <LoadingSkeleton
              className={classes.dateSkeleton}
              loading={loading}
              variant="text"
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
          </TimelineOppositeContent>
          <TimelineSeparator>
            <hr className={classes.connector} />
            <TimelineDot variant="outlined" className={classes.dot} />
            <hr className={classes.connector} />
          </TimelineSeparator>
          <TimelineContent className={classes.surveyCardWrapper}>
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
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  ...incomingStyles,
  timelineItem: {
    alignItems: 'center',
  },
  timelineOppositeContent: {
    flex: '0 0 130px',
  },
  addNewButtonOpposite: {
    padding: theme.spacing(0, 1.25),
  },
  addNewButtonWrapper: {
    marginRight: theme.spacing(10),
  },
  connector: {
    height: 180,
    borderLeft: `2px dashed ${CONNECTOR_COLOR}`,
    marginTop: 0,
    marginBottom: 0,
  },
  dot: {
    border: `1px solid ${CONNECTOR_COLOR}`,
    backgroundColor: theme.palette.primary.light,
    height: '1rem',
    width: '1rem',
    padding: 0,
    margin: 0,
  },
  dateSkeleton: {
    marginLeft: 'auto',
  },
}));

export default TimelineDesktop;
