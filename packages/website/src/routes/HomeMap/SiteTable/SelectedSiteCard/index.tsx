import React, { useEffect, useState } from 'react';
import { Box, Card, Theme, Typography } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import { addDays, format, parseISO } from 'date-fns';

import {
  siteDetailsSelector,
  siteErrorSelector,
  siteLoadingSelector,
} from 'store/Sites/selectedSiteSlice';
import { surveyListSelector } from 'store/Survey/surveyListSlice';
import { sortByDate } from 'helpers/dates';
import siteServices from 'services/siteServices';
import LoadingSkeleton from 'common/LoadingSkeleton';
import SelectedSiteCardContent, { HistoricalDailyData } from './CardContent';

const featuredSiteId = process.env.REACT_APP_FEATURED_SITE_ID || '';

/**
 * Fetches the site's daily data for the selected past date through the
 * existing `GET sites/:id/daily_data?start=&end=` endpoint.
 * Returns undefined when no historical date is selected (live view).
 */
function useHistoricalDailyData(
  siteId: number | undefined,
  historicalDate: string | null | undefined,
): HistoricalDailyData | undefined {
  const [result, setResult] = useState<HistoricalDailyData | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!siteId || !historicalDate) {
      setResult(undefined);
      return undefined;
    }

    let cancelled = false;

    setResult({ data: null, loading: true });
    const start = `${historicalDate}T00:00:00.000Z`;
    const end = `${format(
      addDays(parseISO(historicalDate), 1),
      'yyyy-MM-dd',
    )}T00:00:00.000Z`;
    siteServices
      .getSiteDailyData(siteId.toString(), start, end)
      .then(({ data }) => {
        if (!cancelled) {
          const match =
            data.find((entry) => entry.date?.slice(0, 10) === historicalDate) ||
            null;
          setResult({ data: match, loading: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ data: null, loading: false });
        }
      });

    return () => {
      // eslint-disable-next-line fp/no-mutation
      cancelled = true;
    };
  }, [siteId, historicalDate]);

  return result;
}

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
  const site = useSelector(siteDetailsSelector);
  const loading = useSelector(siteLoadingSelector);
  const error = useSelector(siteErrorSelector);
  const surveyList = useSelector(surveyListSelector);
  const historicalDailyData = useHistoricalDailyData(site?.id, historicalDate);

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
          historicalDate={historicalDate}
          historicalDailyData={historicalDailyData}
          imageUrl={
            featuredSurveyMedia?.thumbnailUrl || featuredSurveyMedia?.url
          }
        />
      </Card>
    </Box>
  );
}

interface SelectedSiteCardIncomingProps {
  /** ISO date (yyyy-MM-dd). When set, the card shows that date's daily data. */
  historicalDate?: string | null;
}

type SelectedSiteCardProps = SelectedSiteCardIncomingProps;

export default SelectedSiteCard;
