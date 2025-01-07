import { useEffect } from 'react';
import { LinearProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  clearTimeSeriesData,
  clearTimeSeriesDataRange,
  spotterPositionRequest,
  spotterPositionSelector,
  siteDetailsSelector,
  siteLoadingSelector,
  siteRequest,
  siteTimeSeriesDataRangeLoadingSelector,
  siteTimeSeriesDataRangeRequest,
  siteTimeSeriesDataRangeSelector,
} from 'store/Sites/selectedSiteSlice';
import {
  surveyListLoadingSelector,
  surveysRequest,
} from 'store/Survey/surveyListSlice';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import MultipleSensorsCharts from 'common/Chart/MultipleSensorsCharts';
import BackButton from './BackButton';
import InfoCard from './InfoCard';
import SurveyHistory from './SurveyHistory';

const BG_COLOR = 'rgb(245, 246, 246)';

const SurveyPoint = () => {
  const { id = '', pointId = '' } =
    useParams<{ id: string; pointId: string }>();
  const siteIdNumber = parseInt(id, 10);
  const pointIdNumber = parseInt(pointId, 10);

  const dispatch = useDispatch();
  const site = useSelector(siteDetailsSelector);
  const spotterPosition = useSelector(spotterPositionSelector);
  const siteLoading = useSelector(siteLoadingSelector);
  const surveysLoading = useSelector(surveyListLoadingSelector);
  const timeSeriesRangeLoading = useSelector(
    siteTimeSeriesDataRangeLoadingSelector,
  );
  const hoboBottomTemperatureRange = useSelector(
    siteTimeSeriesDataRangeSelector,
  )?.bottomTemperature?.find((x) => x.type === 'hobo');
  const loading = siteLoading || surveysLoading || timeSeriesRangeLoading;

  const hasSpotterData = Boolean(spotterPosition?.isDeployed);
  const hasRange = !!(
    hoboBottomTemperatureRange?.data &&
    hoboBottomTemperatureRange.data.length > 0
  );
  const showChart = hasSpotterData || hasRange;

  // Always scroll to top on first render
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      dispatch(clearTimeSeriesDataRange());
      dispatch(clearTimeSeriesData());
    };
  }, [dispatch]);

  // Get HOBO data range
  useEffect(() => {
    dispatch(siteTimeSeriesDataRangeRequest({ siteId: id, pointId }));
  }, [dispatch, id, pointId]);

  useEffect(() => {
    if (!site || site.id !== siteIdNumber) {
      dispatch(siteRequest(id));
      dispatch(spotterPositionRequest(id));
      dispatch(surveysRequest(id));
    }
  }, [dispatch, id, pointId, site, siteIdNumber]);

  return (
    <>
      <NavBar searchLocation />
      {loading && <LinearProgress />}
      {!loading && site && (
        <>
          <BackButton siteId={id} bgColor={BG_COLOR} />
          <InfoCard site={site} pointId={pointIdNumber} bgColor={BG_COLOR} />
          {showChart && (
            <MultipleSensorsCharts
              disableGutters={false}
              site={site}
              pointId={pointId}
              surveysFiltered
              displayOceanSenseCharts={false}
              hasAdditionalSensorData={false}
            />
          )}
          <SurveyHistory
            site={site}
            pointId={pointIdNumber}
            bgColor={BG_COLOR}
          />
          <Footer />
        </>
      )}
    </>
  );
};

export default SurveyPoint;
