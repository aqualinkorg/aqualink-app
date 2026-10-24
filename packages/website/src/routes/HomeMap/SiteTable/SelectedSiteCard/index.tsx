import React from 'react';
import { Box, Card, Theme, Typography } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link, useLocation } from 'react-router-dom';

import { useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';

import {
  siteDetailsSelector,
  siteErrorSelector,
  siteLoadingSelector,
} from 'store/Sites/selectedSiteSlice';
import {
  sitesListCurrentDateSelector,
  sitesListErrorSelector,
  sitesListLoadingSelector,
  sitesListSelector,
} from 'store/Sites/sitesListSlice';
import { surveyListSelector } from 'store/Survey/surveyListSlice';
import { sortByDate } from 'helpers/dates';
import LoadingSkeleton from 'common/LoadingSkeleton';
import { getSiteDetailPath } from '../../helpers';
import SelectedSiteCardContent from './CardContent';

const featuredSiteId = process.env.REACT_APP_FEATURED_SITE_ID || '';

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

function SelectedSiteCard({ historicalDate }: SelectedSiteCardProps) {
  const classes = useStyles();
  const location = useLocation();
  const site = useSelector(siteDetailsSelector);
  const sites = useSelector(sitesListSelector);
  const mapRequestLoading = useSelector(sitesListLoadingSelector);
  const mapRequestError = useSelector(sitesListErrorSelector);
  const mapCurrentDate = useSelector(sitesListCurrentDateSelector);
  const loading = useSelector(siteLoadingSelector);
  const error = useSelector(siteErrorSelector);
  const surveyList = useSelector(surveyListSelector);

  const isFeatured = (site?.id || '').toString() === featuredSiteId;

  const visibleSurveys = historicalDate
    ? surveyList.filter(
        (survey) =>
          survey.diveDate && survey.diveDate.slice(0, 10) <= historicalDate,
      )
    : surveyList;
  const { featuredSurveyMedia } =
    sortByDate(visibleSurveys, 'diveDate', 'desc').find(
      (survey) =>
        survey.featuredSurveyMedia &&
        survey.featuredSurveyMedia.type === 'image',
    ) || {};

  const hasMedia = Boolean(featuredSurveyMedia?.url);
  const mapDataReady =
    !mapRequestLoading && !mapRequestError && mapCurrentDate === historicalDate;
  const historicalSite = mapDataReady
    ? sites?.find((item) => item.id === site?.id)
    : undefined;
  const displayedSite = (() => {
    if (!mapDataReady) return undefined;
    if (!historicalDate || !site) return site;
    return {
      ...site,
      collectionData: historicalSite?.collectionData || {},
      historicalDataDate: historicalSite?.historicalDataDate,
      dailyData: [],
    };
  })();

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
                <Link
                  to={getSiteDetailPath(site.id, historicalDate)}
                  state={{ from: location.pathname }}
                >
                  <LaunchIcon className={classes.launchIcon} />
                </Link>
              )}
            </Typography>
          )}
        </LoadingSkeleton>
      </Box>

      <Card>
        {!mapDataReady ? (
          <Box p={2}>
            <Typography color={mapRequestError ? 'error' : 'textSecondary'}>
              {mapRequestError ||
                `Loading map data${historicalDate ? ` for ${historicalDate}` : ''}…`}
            </Typography>
          </Box>
        ) : (
          <SelectedSiteCardContent
            site={displayedSite}
            loading={loading}
            error={error}
            historicalDate={historicalDate}
            imageUrl={
              featuredSurveyMedia?.thumbnailUrl || featuredSurveyMedia?.url
            }
          />
        )}
      </Card>
    </Box>
  );
}

interface SelectedSiteCardProps {
  historicalDate?: string;
}

export default SelectedSiteCard;
