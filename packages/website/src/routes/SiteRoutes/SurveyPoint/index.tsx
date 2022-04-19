import React, { useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import NavBar from "../../../common/NavBar";
import Footer from "../../../common/Footer";
import BackButton from "./BackButton";
import InfoCard from "./InfoCard";
import MultipleSensorsCharts from "../../../common/Chart/MultipleSensorsCharts";
import SurveyHistory from "./SurveyHistory";
import {
  clearTimeSeriesData,
  clearTimeSeriesDataRange,
  liveDataRequest,
  liveDataSelector,
  siteDetailsSelector,
  siteLoadingSelector,
  siteRequest,
  siteTimeSeriesDataRangeLoadingSelector,
  siteTimeSeriesDataRangeRequest,
  siteTimeSeriesDataRangeSelector,
} from "../../../store/Sites/selectedSiteSlice";
import {
  surveyListLoadingSelector,
  surveysRequest,
} from "../../../store/Survey/surveyListSlice";

const BG_COLOR = "rgb(245, 246, 246)";

const SurveyPoint = ({ match }: SurveyPointProps) => {
  const { id, pointId } = match.params;
  const siteIdNumber = parseInt(id, 10);
  const pointIdNumber = parseInt(pointId, 10);

  const dispatch = useDispatch();
  const site = useSelector(siteDetailsSelector);
  const liveData = useSelector(liveDataSelector);
  const siteLoading = useSelector(siteLoadingSelector);
  const surveysLoading = useSelector(surveyListLoadingSelector);
  const timeSeriesRangeLoading = useSelector(
    siteTimeSeriesDataRangeLoadingSelector
  );
  const { hobo: hoboBottomTemperatureRange } =
    useSelector(siteTimeSeriesDataRangeSelector)?.bottomTemperature || {};
  const loading = siteLoading || surveysLoading || timeSeriesRangeLoading;

  const hasSpotterData = Boolean(liveData?.topTemperature);
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
      dispatch(liveDataRequest(id));
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

interface MatchProps
  extends RouteComponentProps<{ id: string; pointId: string }> {}

interface SurveyPointIncomingProps {}

type SurveyPointProps = MatchProps & SurveyPointIncomingProps;

export default SurveyPoint;
