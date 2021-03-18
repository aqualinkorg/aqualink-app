import React, { useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "../../../common/NavBar";
import Footer from "../../../common/Footer";
import BackButton from "./BackButton";
import InfoCard from "./InfoCard";
import ChartWithCard from "../../../common/Chart/ChartWithCard";
import SurveyHistory from "./SurveyHistory";
import {
  reefDetailsSelector,
  reefRequest,
  reefLoadingSelector,
  reefHoboDataRangeRequest,
  reefHoboDataRangeSelector,
  reefHoboDataRequest,
  clearHoboDataRange,
  clearHoboData,
  reefHoboDataRangeLoadingSelector,
} from "../../../store/Reefs/selectedReefSlice";
import {
  surveysRequest,
  surveyListLoadingSelector,
} from "../../../store/Survey/surveyListSlice";
import { subtractFromDate } from "../../../helpers/dates";

const BG_COLOR = "rgb(245, 246, 246)";

const SurveyPoint = ({ match }: SurveyPointProps) => {
  const { id, pointId } = match.params;
  const reefIdNumber = parseInt(id, 10);
  const pointIdNumber = parseInt(pointId, 10);

  const dispatch = useDispatch();
  const reef = useSelector(reefDetailsSelector);
  const reefLoading = useSelector(reefLoadingSelector);
  const surveysLoading = useSelector(surveyListLoadingSelector);
  const hoboRangeLoading = useSelector(reefHoboDataRangeLoadingSelector);
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefHoboDataRangeSelector) || {};
  const loading = reefLoading || surveysLoading || hoboRangeLoading;

  const hasSpotterData = Boolean(reef?.liveData?.surfaceTemperature);
  const hasRange = !!(
    hoboBottomTemperatureRange && hoboBottomTemperatureRange.length > 0
  );
  const showChart = hasSpotterData || hasRange;

  // Always scroll to top on first render
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      dispatch(clearHoboDataRange());
      dispatch(clearHoboData());
    };
  }, [dispatch]);

  // Get HOBO data range
  useEffect(() => {
    dispatch(reefHoboDataRangeRequest({ reefId: id, pointId }));
  }, [dispatch, id, pointId]);

  // Get HOBO data
  useEffect(() => {
    if (hoboBottomTemperatureRange?.[0]) {
      const { maxDate } = hoboBottomTemperatureRange[0];
      const pastThreeMonths = subtractFromDate(maxDate, "month", 3);
      dispatch(
        reefHoboDataRequest({
          reefId: id,
          pointId,
          start: pastThreeMonths,
          end: maxDate,
          metrics: ["bottom_temperature"],
        })
      );
    }
  }, [dispatch, hoboBottomTemperatureRange, id, pointId]);

  useEffect(() => {
    if (!reef || reef.id !== reefIdNumber) {
      dispatch(reefRequest(id));
      dispatch(surveysRequest(id));
    }
  }, [dispatch, id, pointId, reef, reefIdNumber]);

  return (
    <>
      <NavBar searchLocation />
      {loading && <LinearProgress />}
      {!loading && reef && (
        <>
          <BackButton reefId={id} bgColor={BG_COLOR} />
          <InfoCard reef={reef} pointId={pointIdNumber} bgColor={BG_COLOR} />
          {showChart && <ChartWithCard reef={reef} pointId={pointId} />}
          <SurveyHistory
            reef={reef}
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
