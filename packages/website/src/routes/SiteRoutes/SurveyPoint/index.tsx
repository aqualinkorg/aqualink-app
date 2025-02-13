'use client';

import { useEffect } from 'react';
import { LinearProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
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

interface SurveyPointProps {
  siteId: string;
  pointId: string;
}

const SurveyPoint = ({ siteId, pointId }: SurveyPointProps) => {
  const siteIdNumber = parseInt(siteId, 10);
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
    dispatch(siteTimeSeriesDataRangeRequest({ siteId, pointId }));
  }, [dispatch, siteId, pointId]);

  useEffect(() => {
    if (!site || site.id !== siteIdNumber) {
      dispatch(siteRequest(siteId));
      dispatch(spotterPositionRequest(siteId));
      dispatch(surveysRequest(siteId));
    }
  }, [dispatch, siteId, pointId, site, siteIdNumber]);

  return (
    <>
      <NavBar searchLocation />
      {loading && <LinearProgress />}
      {!loading && site && (
        <>
          <BackButton siteId={siteId} bgColor={BG_COLOR} />
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
