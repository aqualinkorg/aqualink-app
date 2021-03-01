import React, { useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "../../../common/NavBar";
import Footer from "../../../common/Footer";
import BackButton from "./BackButton";
import InfoCard from "./InfoCard";
import ChartWithCard from "./Chart";
import SurveyHistory from "./SurveyHistory";
import {
  reefDetailsSelector,
  reefRequest,
  reefLoadingSelector,
} from "../../../store/Reefs/selectedReefSlice";
import {
  surveysRequest,
  surveyListLoadingSelector,
} from "../../../store/Survey/surveyListSlice";

const SurveyPoint = ({ match }: SurveyPointProps) => {
  const { id, pointId } = match.params;
  const reefIdNumber = parseInt(id, 10);
  const pointIdNumber = parseInt(pointId, 10);
  const bgColor = "rgb(245, 246, 246)";

  const dispatch = useDispatch();
  const reef = useSelector(reefDetailsSelector);
  const reefLoading = useSelector(reefLoadingSelector);
  const surveysLoading = useSelector(surveyListLoadingSelector);

  // Always scroll to top on first render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!reef || reef.id !== reefIdNumber) {
      dispatch(reefRequest(id));
      dispatch(surveysRequest(id));
    }
  }, [dispatch, id, reef, reefIdNumber]);

  return (
    <>
      <NavBar searchLocation />
      {(reefLoading || surveysLoading) && <LinearProgress />}
      {reef && (
        <>
          <BackButton reefId={id} bgColor={bgColor} />
          <InfoCard reef={reef} pointId={pointIdNumber} bgColor={bgColor} />
          <ChartWithCard reef={reef} pointId={pointId} />
          <SurveyHistory
            reef={reef}
            pointId={pointIdNumber}
            bgColor={bgColor}
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
