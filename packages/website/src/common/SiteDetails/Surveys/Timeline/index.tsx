import React from 'react';
import { useSelector } from 'react-redux';
import { Hidden } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { surveyListSelector } from 'store/Survey/surveyListSlice';
import { SurveyMedia } from 'store/Survey/types';
import { filterSurveys } from 'helpers/surveys';
import { sortByDate } from 'helpers/dates';
import { reefCheckSurveyListSelector } from 'store/ReefCheckSurveys';
import TimelineDesktop from './Desktop';
import TimelineTablet from './Tablet';
import { TimelineProps } from './types';

function SurveyTimeline({
  loading = false,
  isAdmin,
  siteId,
  addNewButton,
  timeZone = null,
  observation,
  pointName,
  pointId,
  historicalDate,
  classes,
}: SurveyTimelineProps) {
  const surveyList = useSelector(surveyListSelector);
  const { list: reefCheckSurveyList = [] } =
    useSelector(reefCheckSurveyListSelector) ?? {};

  const displayAddButton =
    isAdmin &&
    addNewButton &&
    !(window && window.location.pathname.includes('new_survey'));

  // Combine surveys and reef check surveys into a single list
  const mergedSurveys: TimelineProps['surveys'] = sortByDate(
    [
      ...filterSurveys(surveyList, observation, pointId)
        .filter(
          (survey) =>
            !historicalDate ||
            (survey.diveDate && survey.diveDate.slice(0, 10) <= historicalDate),
        )
        .map((s) => ({
          ...s,
          date: s.diveDate ?? '',
          type: 'survey' as const,
        })),
      ...(reefCheckSurveyList
        ?.filter(
          (survey) =>
            !historicalDate ||
            (survey.date && survey.date.slice(0, 10) <= historicalDate),
        )
        .map((s) => ({
          ...s,
          date: s.date ?? '',
          type: 'reefCheckSurvey' as const,
        })) || []),
    ],
    'date',
    'desc',
  );
  const timelineProps: TimelineProps = {
    siteId,
    loading,
    isAdmin,
    pointId,
    pointName,
    surveys: mergedSurveys,
    timeZone,
    displayAddButton,
  };

  return (
    <div className={classes.root}>
      <Hidden lgDown>
        <TimelineDesktop {...timelineProps} />
      </Hidden>
      <Hidden lgUp>
        <TimelineTablet {...timelineProps} />
      </Hidden>
    </div>
  );
}

const styles = () =>
  createStyles({
    root: {
      marginTop: '3rem',
      width: '100%',
    },
  });

interface SurveyTimelineIncomingProps {
  siteId?: number;
  loading?: boolean;
  addNewButton: boolean;
  timeZone?: string | null;
  isAdmin: boolean;
  observation: SurveyMedia['observations'] | 'any';
  pointName: string | null;
  pointId: number;
  historicalDate?: string;
}

type SurveyTimelineProps = SurveyTimelineIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyTimeline);
