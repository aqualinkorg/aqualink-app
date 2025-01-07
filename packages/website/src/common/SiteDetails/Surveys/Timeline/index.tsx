import { useSelector } from 'react-redux';
import { Hidden } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { surveyListSelector } from 'store/Survey/surveyListSlice';
import { SurveyMedia } from 'store/Survey/types';
import { filterSurveys } from 'helpers/surveys';
import TimelineDesktop from './Desktop';
import TimelineTablet from './Tablet';
import { TimelineProps } from './types';

const SurveyTimeline = ({
  loading = false,
  isAdmin,
  siteId,
  addNewButton,
  timeZone = null,
  observation,
  pointName,
  pointId,
  classes,
}: SurveyTimelineProps) => {
  const surveyList = useSelector(surveyListSelector);
  const displayAddButton =
    isAdmin &&
    addNewButton &&
    !(window && window.location.pathname.includes('new_survey'));
  // If the site is loading, then display two survey card skeletons,
  // else display the actual survey cards.
  const filteredSurveys = loading
    ? [null, null]
    : filterSurveys(surveyList, observation, pointId);
  const timelineProps: TimelineProps = {
    siteId,
    loading,
    isAdmin,
    pointId,
    pointName,
    surveys: filteredSurveys,
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
};

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
}

type SurveyTimelineProps = SurveyTimelineIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyTimeline);
