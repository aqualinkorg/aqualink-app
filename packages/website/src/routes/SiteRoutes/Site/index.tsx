import React, { useEffect } from 'react';
import { Alert, Container, Box } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames';
import {
  siteDetailsSelector,
  siteRequest,
  siteTimeSeriesDataRangeRequest,
  clearTimeSeriesData,
  clearTimeSeriesDataRange,
  siteOceanSenseDataRequest,
  clearOceanSenseData,
  spotterPositionRequest,
  spotterPositionSelector,
  siteLoadingSelector,
  siteErrorSelector,
} from 'store/Sites/selectedSiteSlice';
import {
  surveysRequest,
  surveyListSelector,
} from 'store/Survey/surveyListSlice';
import { userInfoSelector } from 'store/User/userSlice';
import { User } from 'store/User/types';
import { oceanSenseConfig } from 'constants/oceanSenseConfig';
import { Site as SiteType } from 'store/Sites/types';
import { useQueryParam } from 'hooks/useQueryParams';
import { isAdmin } from 'helpers/user';
import { findAdministeredSite } from 'helpers/findAdministeredSite';
import { sortByDate } from 'helpers/dates';
import { findSurveyPointFromList } from 'helpers/siteUtils';
import SiteNavBar from 'common/NavBar';
import SiteFooter from 'common/Footer';
import SiteDetails from 'common/SiteDetails';
import HistoricalDateControl from 'common/HistoricalDateControl';
import HistoricalSiteSummary from 'common/HistoricalSiteSummary';
import { useHistoricalDate } from 'hooks/useHistoricalDate';
import { localizedEndOfDay } from 'common/Chart/MultipleSensorsCharts/helpers';
import LoadingSkeleton from 'common/LoadingSkeleton';
import { DateTime } from 'luxon-extensions';
import { reefCheckSurveysRequest } from 'store/ReefCheckSurveys';
import SiteInfo from './SiteInfo';
import NotFoundPage from '../../NotFound/index';

const getAlertMessage = (
  user: User | null,
  siteId: string,
  hasDailyData: boolean,
) => {
  const userSite = findAdministeredSite(user, parseInt(siteId, 10));
  const { applied, status } = userSite || {};
  const isSiteAdmin = isAdmin(user, parseInt(siteId, 10));

  const defaultMessage =
    'Currently no Smart Buoy deployed at this site location. Real-time values are derived from a combination of NOAA satellite readings and weather models.';

  switch (true) {
    case !hasDailyData:
      return (
        <div>
          Welcome to your virtual site, data is loading, please come back in a
          few hours. This site will be visible publicly as soon as it has been
          approved by the Aqualink team. If your site is not located in the
          ocean or sea, please click on &quot;EDIT SITE DETAILS&quot; to place
          it correctly. For any questions, contact{' '}
          <a href="mailto:info@aqualink.org">info@aqualink.org</a>. To learn
          more, watch this{' '}
          <a href="https://www.youtube.com/watch?v=EQZ3HiPevTY">
            5-minute video
          </a>{' '}
          to see what you can do with Aqualink.
        </div>
      );

    case !isSiteAdmin:
      return defaultMessage;
    case !applied:
      return (
        <div>
          {defaultMessage} Apply for an Aqualink Smart Buoy
          <span> </span> <Link to={`/sites/${siteId}/apply`}>here</Link>.
        </div>
      );

    case status === 'in_review':
      return (
        <div>
          {defaultMessage} Your application for an Aqualink Smart Buoy is being
          reviewed. You can check your application<span> </span>
          <Link to={`/sites/${siteId}/apply`}>here</Link>.
        </div>
      );

    case status === 'approved':
      return 'Your application for an Aqualink Smart Buoy has been approved.';

    case status === 'shipped':
      return "Your Smart Buoy is on its way! Mark it as 'deployed' once it's installed to access its data.";

    case status === 'rejected':
      return (
        <div>
          Your application for an Aqualink Smart Buoy was not approved at this
          time. For more information, you can contact<span> </span>
          <a href="mailto:info@aqualink.org">info@aqualink.org</a>
        </div>
      );

    default:
      return defaultMessage;
  }
};

function Site({ classes }: SiteProps) {
  const { id: siteId = '' } = useParams<{ id: string }>();
  const { date, error: dateError } = useHistoricalDate();
  const siteError = useSelector(siteErrorSelector);
  const storedSite = useSelector(siteDetailsSelector);
  const siteDetails =
    storedSite?.historicalDate === date && `${storedSite?.id}` === siteId
      ? storedSite
      : undefined;
  const siteLoading = useSelector(siteLoadingSelector);
  const user = useSelector(userInfoSelector);
  const surveyList = useSelector(surveyListSelector);
  const spotterPosition = useSelector(spotterPositionSelector);
  const dispatch = useAppDispatch();
  const { id, dailyData, surveyPoints, timezone } = siteDetails || {};
  const [querySurveyPointId] = useQueryParam('surveyPoint');
  const [refresh, setRefresh] = useQueryParam('refresh');
  const { id: selectedSurveyPointId } =
    findSurveyPointFromList(querySurveyPointId, surveyPoints) || {};

  const featuredMedia = sortByDate(surveyList, 'diveDate', 'desc').find(
    (survey) =>
      survey.featuredSurveyMedia && survey.featuredSurveyMedia.type === 'image',
  );

  const {
    id: featuredSurveyId,
    featuredSurveyMedia,
    diveDate,
  } = featuredMedia || {};
  const {
    surveyPoint: featuredSurveyPoint,
    url,
    thumbnailUrl,
  } = featuredSurveyMedia || {};

  const hasSpotterData = Boolean(spotterPosition?.isDeployed);

  const hasDailyData = Boolean(dailyData && dailyData.length > 0);

  const today = localizedEndOfDay(undefined, timezone);

  const siteWithFeaturedImage: SiteType | undefined =
    siteDetails && (siteId === siteDetails.id.toString() || !siteId)
      ? { ...siteDetails, featuredImage: thumbnailUrl || url }
      : undefined;

  const isLoading = !siteWithFeaturedImage;

  useEffect(() => {
    if (refresh === 'true') {
      setRefresh(undefined);

      dispatch(clearTimeSeriesDataRange());
      dispatch(clearTimeSeriesData());
      dispatch(clearOceanSenseData());

      if (!dateError) dispatch(siteRequest({ id: siteId, date }));
      if (!date) {
        dispatch(spotterPositionRequest(siteId));
        dispatch(surveysRequest(siteId));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  // Fetch site and surveys
  useEffect(() => {
    if (!dateError) dispatch(siteRequest({ id: siteId, date }));
    if (!date) {
      dispatch(spotterPositionRequest(siteId));
      dispatch(surveysRequest(siteId));
    }

    return () => {
      dispatch(clearTimeSeriesDataRange());
      dispatch(clearTimeSeriesData());
      dispatch(clearOceanSenseData());
    };
  }, [dispatch, siteId, date, dateError]);

  // Fetch reef check surveys
  useEffect(() => {
    if (
      !date &&
      siteDetails?.reefCheckSites &&
      siteDetails.reefCheckSites.length > 0
    ) {
      dispatch(reefCheckSurveysRequest(siteDetails.id));
    }
  }, [dispatch, siteDetails?.reefCheckSites, siteDetails?.id, date]);

  // Fetch time series data range for the site's closest survey point
  // once the survey points are successfully fetched
  useEffect(() => {
    if (!date && siteId === id?.toString()) {
      dispatch(
        siteTimeSeriesDataRangeRequest({
          siteId,
          pointId: selectedSurveyPointId,
        }),
      );
    }
  }, [dispatch, id, selectedSurveyPointId, siteId, date]);

  useEffect(() => {
    if (!date && id && oceanSenseConfig?.[id] && siteId === id.toString()) {
      dispatch(
        siteOceanSenseDataRequest({
          sensorID: 'oceansense-2',
          startDate: DateTime.fromISO(today).minus({ months: 6 }).toISOString(),
          endDate: today,
          latest: true,
        }),
      );
    }
  }, [dispatch, id, siteId, today, date]);

  const isHistoricalView = date !== undefined || Boolean(dateError);

  return (
    <>
      <SiteNavBar searchLocation />
      <HistoricalDateControl />
      {isHistoricalView && (
        <Container>
          {siteError && <Alert severity="error">{siteError}</Alert>}
          {!dateError &&
            (siteDetails ? (
              <HistoricalSiteSummary site={siteDetails} />
            ) : (
              !siteError && (
                <Box my={3} role="status">
                  Loading historical observations…
                </Box>
              )
            ))}
        </Container>
      )}
      {!isHistoricalView &&
        (!siteLoading && !siteDetails ? (
          <NotFoundPage />
        ) : (
          <Container
            className={classNames({ [classes.noDataWrapper]: !hasDailyData })}
          >
            <Box marginTop="2rem">
              <LoadingSkeleton loading={isLoading} variant="text" lines={3}>
                {siteDetails && (
                  <SiteInfo
                    hasDailyData={hasDailyData}
                    site={siteDetails}
                    lastSurvey={surveyList[surveyList.length - 1]?.diveDate}
                    isAdmin={isAdmin(user, parseInt(siteId, 10))}
                  />
                )}
              </LoadingSkeleton>
            </Box>
            {/* Only show alert message when data is loading */}
            {!hasSpotterData && !isLoading && !hasDailyData && (
              <Box mt="1.3rem">
                <Alert severity="info">
                  {getAlertMessage(user, siteId, hasDailyData)}
                </Alert>
              </Box>
            )}
            <div key={siteId}>
              <SiteDetails
                site={siteWithFeaturedImage}
                selectedSurveyPointId={selectedSurveyPointId}
                featuredSurveyId={featuredSurveyId}
                surveys={surveyList}
                featuredSurveyPoint={featuredSurveyPoint}
                surveyDiveDate={diveDate}
              />
            </div>
          </Container>
        ))}
      <SiteFooter />
    </>
  );
}

const styles = () =>
  createStyles({
    noData: {
      display: 'flex',
      alignItems: 'center',
      height: '80vh',
    },
    noDataWrapper: {
      height: '100%',
    },
  });

type SiteProps = WithStyles<typeof styles>;

export default withStyles(styles)(Site);
