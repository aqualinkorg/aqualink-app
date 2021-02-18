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
import BackButton from "./BackButton";
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

  const dispatch = useDispatch();
  const reef = useSelector(reefDetailsSelector);
  const reefLoading = useSelector(reefLoadingSelector);
  const surveysLoading = useSelector(surveyListLoadingSelector);

  const { name: pointName } =
    reef?.surveyPoints.filter((point) => point.id === pointIdNumber)[0] || {};

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
      {pointName && (
        <>
          <BackButton reefId={id} />
          <SurveyHistory
            pointName={pointName}
            pointId={pointIdNumber}
            reefId={reefIdNumber}
            timeZone={reef?.timezone}
          />
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
