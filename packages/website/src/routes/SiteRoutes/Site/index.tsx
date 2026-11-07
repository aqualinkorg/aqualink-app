import React, { useEffect } from 'react';
import { Alert, Container, Box } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { Link, useLocation, useParams } from 'react-router-dom';
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
} from 'store/Sites/selectedSiteSlice';
import {
  selectedDateSelector,
  setSelectedDate,
} from 'store/Sites/sitesListSlice';
import {
  readHistoricalDateFromUrl,
  writeHistoricalDateToUrl,
} from 'store/Sites/historicalDateHelpers';
import {
  surveysRequest,
  surveyListSelector,
} from 'store/Survey/surveyListSlice';
import { userInfoSelector } from 'store/User/userSlice';
import { User } from 'store/User/types';
import { SurveyListItem } from 'store/Survey/types';
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
import HistoricalDatePicker from 'common/HistoricalDatePicker';
import { localizedEndOfDay } from 'common/Chart/MultipleSensorsCharts/helpers';
import LoadingSkeleton from 'common/LoadingSkeleton';
import { DateTime } from 'luxon-extensions';
import { reefCheckSurveysRequest } from 'store/ReefCheckSurveys';
import SiteInfo from './SiteInfo';
import NotFoundPage from '../../NotFound/index';

interface AlertMessageContext {
  user: User | null;
  siteId: string;
  hasDailyData: boolean;
}

interface SiteAuxiliaryEffectContext {
  siteId: string;
  siteDetails: SiteType | null | undefined;
  selectedSurveyPointId?: string;
  today: string;
}

interface NoDataAlertFlags {
  hasSpotterData: boolean;
  isLoading: boolean;
  hasDailyData: boolean;
}

const DEFAULT_NO_BUOY_MESSAGE =
  'Currently no Smart Buoy deployed at this site location. Real-time values are derived from a combination of NOAA satellite readings and weather models.';

const renderPendingDailyDataMessage = () => (
  <div>
    Welcome to your virtual site, data is loading, please come back in a few
    hours. This site will be visible publicly as soon as it has been approved by
    the Aqualink team. If your site is not located in the ocean or sea, please
    click on &quot;EDIT SITE DETAILS&quot; to place it correctly. For any
    questions, contact <a href="mailto:info@aqualink.org">info@aqualink.org</a>.
    To learn more, watch this{' '}
    <a href="https://www.youtube.com/watch?v=EQZ3HiPevTY">5-minute video</a> to
    see what you can do with Aqualink.
  </div>
);

const renderApplicationStatusMessage = (
  siteId: string,
  status?: string | null,
) => {
  if (status === 'in_review') {
    return (
      <div>
        {DEFAULT_NO_BUOY_MESSAGE} Your application for an Aqualink Smart Buoy is
        being reviewed. You can check your application<span> </span>
        <Link to={`/sites/${siteId}/apply`}>here</Link>.
      </div>
    );
  }
  if (status === 'approved') {
    return 'Your application for an Aqualink Smart Buoy has been approved.';
  }
  if (status === 'shipped') {
    return "Your Smart Buoy is on its way! Mark it as 'deployed' once it's installed to access its data.";
  }
  if (status === 'rejected') {
    return (
      <div>
        Your application for an Aqualink Smart Buoy was not approved at this
        time. For more information, you can contact<span> </span>
        <a href="mailto:info@aqualink.org">info@aqualink.org</a>
      </div>
    );
  }
  return DEFAULT_NO_BUOY_MESSAGE;
};

/**
 * Determines the informational banner displayed on sites without an active Spotter buoy,
 * differentiating between newly created sites awaiting satellite backfill and admin buoy applications.
 */
const getAlertMessage = ({
  user,
  siteId,
  hasDailyData,
}: AlertMessageContext) => {
  if (!hasDailyData) {
    return renderPendingDailyDataMessage();
  }
  const numericSiteId = parseInt(siteId, 10);
  if (!isAdmin(user, numericSiteId)) {
    return DEFAULT_NO_BUOY_MESSAGE;
  }
  const userSite = findAdministeredSite(user, numericSiteId);
  if (!userSite?.applied) {
    return (
      <div>
        {DEFAULT_NO_BUOY_MESSAGE} Apply for an Aqualink Smart Buoy
        <span> </span> <Link to={`/sites/${siteId}/apply`}>here</Link>.
      </div>
    );
  }
  return renderApplicationStatusMessage(siteId, userSite.status);
};

const selectFeaturedSurveyMedia = (surveyList: SurveyListItem[]) => {
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

  return {
    featuredSurveyId,
    featuredSurveyPoint,
    featuredImageUrl: thumbnailUrl || url,
    diveDate,
  };
};

const buildSiteRequestArg = (siteId: string, selectedDate?: string | null) =>
  selectedDate ? { id: siteId, date: selectedDate } : siteId;

const matchesRouteSite = (
  siteId: string,
  siteDetails?: SiteType | null,
): siteDetails is SiteType => {
  if (!siteDetails) {
    return false;
  }
  if (!siteId) {
    return true;
  }
  return siteId === siteDetails.id.toString();
};

const attachFeaturedImage = (
  siteId: string,
  siteDetails: SiteType | null | undefined,
): ((featuredImage?: string) => SiteType | undefined) => {
  if (!matchesRouteSite(siteId, siteDetails)) {
    return () => undefined;
  }
  return (featuredImage?: string) => ({ ...siteDetails, featuredImage });
};

const hasOceanSenseSensor = (siteId: string, detailsId?: number): boolean => {
  if (!detailsId || !oceanSenseConfig?.[detailsId]) {
    return false;
  }
  return siteId === detailsId.toString();
};

const shouldDisplayNoDataAlert = ({
  hasSpotterData,
  isLoading,
  hasDailyData,
}: NoDataAlertFlags): boolean => {
  if (hasSpotterData || isLoading) {
    return false;
  }
  return !hasDailyData;
};

function useSiteHistoricalDateSync(
  search: string,
  selectedDate?: string | null,
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const urlDate = readHistoricalDateFromUrl(search);
    if (urlDate) {
      dispatch(setSelectedDate(urlDate));
      return;
    }
    if (selectedDate) {
      writeHistoricalDateToUrl(selectedDate);
    }
    // Synchronize only when route search string changes so manual date resets are preserved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search]);
}

function useSiteCoreRequests(siteId: string, selectedDate?: string | null) {
  const dispatch = useAppDispatch();
  const [refresh, setRefresh] = useQueryParam('refresh');

  useEffect(() => {
    if (refresh === 'true') {
      setRefresh(undefined);
      dispatch(clearTimeSeriesDataRange());
      dispatch(clearTimeSeriesData());
      dispatch(clearOceanSenseData());
      dispatch(siteRequest(buildSiteRequestArg(siteId, selectedDate)));
      dispatch(spotterPositionRequest(siteId));
      dispatch(surveysRequest(siteId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    dispatch(siteRequest(buildSiteRequestArg(siteId, selectedDate)));
  }, [dispatch, selectedDate, siteId]);

  useEffect(() => {
    dispatch(spotterPositionRequest(siteId));
    dispatch(surveysRequest(siteId));

    return () => {
      dispatch(clearTimeSeriesDataRange());
      dispatch(clearTimeSeriesData());
      dispatch(clearOceanSenseData());
    };
  }, [dispatch, siteId]);
}

function useSiteAuxiliaryRequests({
  siteId,
  siteDetails,
  selectedSurveyPointId,
  today,
}: SiteAuxiliaryEffectContext) {
  const dispatch = useAppDispatch();
  const detailsId = siteDetails?.id;
  const reefCheckCount = siteDetails?.reefCheckSites?.length ?? 0;

  useEffect(() => {
    if (detailsId && reefCheckCount > 0) {
      dispatch(reefCheckSurveysRequest(detailsId));
    }
  }, [detailsId, dispatch, reefCheckCount]);

  useEffect(() => {
    if (siteId === detailsId?.toString()) {
      dispatch(
        siteTimeSeriesDataRangeRequest({
          siteId,
          pointId: selectedSurveyPointId,
        }),
      );
    }
  }, [detailsId, dispatch, selectedSurveyPointId, siteId]);

  useEffect(() => {
    if (hasOceanSenseSensor(siteId, detailsId)) {
      dispatch(
        siteOceanSenseDataRequest({
          sensorID: 'oceansense-2',
          startDate: DateTime.fromISO(today).minus({ months: 6 }).toISOString(),
          endDate: today,
          latest: true,
        }),
      );
    }
  }, [detailsId, dispatch, siteId, today]);
}

function useSelectedSurveyPointId(siteDetails?: SiteType | null) {
  const [querySurveyPointId] = useQueryParam('surveyPoint');
  const matchedPoint = findSurveyPointFromList(
    querySurveyPointId,
    siteDetails?.surveyPoints,
  );
  return matchedPoint?.id;
}

function useSitePageState(siteId: string) {
  const siteDetails = useSelector(siteDetailsSelector);
  const siteLoading = useSelector(siteLoadingSelector);
  const selectedDate = useSelector(selectedDateSelector);
  const user = useSelector(userInfoSelector);
  const surveyList = useSelector(surveyListSelector);
  const spotterPosition = useSelector(spotterPositionSelector);
  const selectedSurveyPointId = useSelectedSurveyPointId(siteDetails);
  const featuredMedia = selectFeaturedSurveyMedia(surveyList);
  const hasSpotterData = Boolean(spotterPosition?.isDeployed);
  const hasDailyData = Boolean((siteDetails?.dailyData?.length ?? 0) > 0);
  const today = localizedEndOfDay(
    selectedDate || undefined,
    siteDetails?.timezone,
  );
  const siteWithFeaturedImage = attachFeaturedImage(
    siteId,
    siteDetails,
  )(featuredMedia.featuredImageUrl);
  const isLoading = !siteWithFeaturedImage;
  const showNoDataAlert = shouldDisplayNoDataAlert({
    hasSpotterData,
    isLoading,
    hasDailyData,
  });

  return {
    siteDetails,
    siteLoading,
    selectedDate,
    user,
    surveyList,
    selectedSurveyPointId,
    featuredMedia,
    hasDailyData,
    today,
    siteWithFeaturedImage,
    isLoading,
    showNoDataAlert,
  };
}

function Site({ classes }: SiteProps) {
  const { search } = useLocation();
  const { id: routeSiteId } = useParams<{ id: string }>();
  const siteId = routeSiteId ?? '';
  const {
    siteDetails,
    siteLoading,
    selectedDate,
    user,
    surveyList,
    selectedSurveyPointId,
    featuredMedia,
    hasDailyData,
    today,
    siteWithFeaturedImage,
    isLoading,
    showNoDataAlert,
  } = useSitePageState(siteId);

  useSiteHistoricalDateSync(search, selectedDate);
  useSiteCoreRequests(siteId, selectedDate);
  useSiteAuxiliaryRequests({
    siteId,
    siteDetails,
    selectedSurveyPointId,
    today,
  });

  if (!siteLoading && !siteDetails) {
    return (
      <>
        <SiteNavBar searchLocation />
        <NotFoundPage />
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteNavBar searchLocation />
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
        <HistoricalDatePicker variant="site" />
        {showNoDataAlert && (
          <Box mt="1.3rem">
            <Alert severity="info">
              {getAlertMessage({ user, siteId, hasDailyData })}
            </Alert>
          </Box>
        )}
        <div key={siteId}>
          <SiteDetails
            site={siteWithFeaturedImage}
            selectedSurveyPointId={selectedSurveyPointId}
            featuredSurveyId={featuredMedia.featuredSurveyId}
            surveys={surveyList}
            featuredSurveyPoint={featuredMedia.featuredSurveyPoint}
            surveyDiveDate={featuredMedia.diveDate}
          />
        </div>
      </Container>
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
