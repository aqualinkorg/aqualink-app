import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "../../../common/NavBar";
import Footer from "../../../common/Footer";
import BackButton from "./BackButton";
import InfoCard from "./InfoCard";
import SurveyHistory from "./SurveyHistory";
import {
  reefDetailsSelector,
  reefRequest,
  reefLoadingSelector,
} from "../../../store/Reefs/selectedReefSlice";
import {
  surveysRequest,
  surveyListLoadingSelector,
  surveyListSelector,
} from "../../../store/Survey/surveyListSlice";
import { isAdmin } from "../../../helpers/user";
import { userInfoSelector } from "../../../store/User/userSlice";
import { filterSurveys } from "../../../helpers/surveys";

const SurveyPoint = ({ match }: SurveyPointProps) => {
  const { id, pointId } = match.params;
  const reefIdNumber = parseInt(id, 10);
  const pointIdNumber = parseInt(pointId, 10);

  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const reef = useSelector(reefDetailsSelector);
  const reefLoading = useSelector(reefLoadingSelector);
  const surveys = filterSurveys(
    useSelector(surveyListSelector),
    "any",
    pointIdNumber
  );
  const surveysLoading = useSelector(surveyListLoadingSelector);

  const { name: pointName } =
    reef?.surveyPoints.filter((point) => point.id === pointIdNumber)[0] || {};

  const nSurveys = surveys.length;

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
      {reef && pointName && (
        <>
          <BackButton reefId={id} />
          <InfoCard
            reef={reef}
            points={reef.surveyPoints}
            pointName={pointName}
            nSurveys={nSurveys}
          />
          <SurveyHistory
            isAdmin={isAdmin(user, reefIdNumber)}
            pointName={pointName}
            pointId={pointIdNumber}
            reefId={reefIdNumber}
            timeZone={reef?.timezone}
          />
          <Footer />
        </>
      )}
    </>
  );
};

const styles = () =>
  createStyles({
    root: {},
  });

interface MatchProps
  extends RouteComponentProps<{ id: string; pointId: string }> {}

interface SurveyPointIncomingProps {}

type SurveyPointProps = MatchProps &
  SurveyPointIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPoint);
