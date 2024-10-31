import React from 'react';
import { Box, Card, Theme, Typography } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';

import {
  siteDetailsSelector,
  siteErrorSelector,
  siteLoadingSelector,
} from 'store/Sites/selectedSiteSlice';
import { surveyListSelector } from 'store/Survey/surveyListSlice';
import { sortByDate } from 'helpers/dates';
import LoadingSkeleton from 'common/LoadingSkeleton';
import SelectedSiteCardContent from './CardContent';

const featuredSiteId = process.env.NEXT_PUBLIC_FEATURED_SITE_ID || '';

const SelectedSiteCard = () => {
  const classes = useStyles();
  const site = useSelector(siteDetailsSelector);
  const loading = useSelector(siteLoadingSelector);
  const error = useSelector(siteErrorSelector);
  const surveyList = useSelector(surveyListSelector);

  const isFeatured = (site?.id || '').toString() === featuredSiteId;

  const { featuredSurveyMedia } =
    sortByDate(surveyList, 'diveDate', 'desc').find(
      (survey) =>
        survey.featuredSurveyMedia &&
        survey.featuredSurveyMedia.type === 'image',
    ) || {};

  const hasMedia = Boolean(featuredSurveyMedia?.url);

  // If FEATURED_SITE is not setup, no card is displayed.
  if (featuredSiteId === '' && isFeatured) {
    return null;
  }

  return (
    <Box className={classes.card}>
      <Box mb={2}>
        <LoadingSkeleton
          loading={loading}
          variant="text"
          lines={1}
          textHeight={28}
        >
          {site && (
            <Typography variant="h5" color="textSecondary">
              {isFeatured ? 'Featured Site' : 'Selected Site'}
              {!hasMedia && (
                <Link to={`/sites/${site?.id}`}>
                  <LaunchIcon className={classes.launchIcon} />
                </Link>
              )}
            </Typography>
          )}
        </LoadingSkeleton>
      </Box>

      <Card>
        <SelectedSiteCardContent
          site={site}
          loading={loading}
          error={error}
          imageUrl={
            featuredSurveyMedia?.thumbnailUrl || featuredSurveyMedia?.url
          }
        />
      </Card>
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    [theme.breakpoints.down('md')]: {
      padding: 10,
    },
    padding: 20,
  },
  launchIcon: {
    fontSize: 20,
    marginLeft: '0.5rem',
    color: '#2f2f2f',
    '&:hover': {
      color: '#2f2f2f',
    },
  },
}));

export default SelectedSiteCard;
