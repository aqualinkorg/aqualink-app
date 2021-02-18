import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Container,
  Box,
  LinearProgress,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "../../../common/NavBar";
import TimeLine from "../../../common/SiteDetails/Surveys/Timeline";
import BackButton from "./BackButton";
import {
  reefDetailsSelector,
  reefRequest,
  reefLoadingSelector,
} from "../../../store/Reefs/selectedReefSlice";
import {
  surveysRequest,
  surveyListLoadingSelector,
} from "../../../store/Survey/surveyListSlice";

const SurveyPoint = ({ match, classes }: SurveyPointProps) => {
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
          <Box className={classes.timelineWrapper}>
            <Container>
              <TimeLine
                isAdmin
                addNewButton={false}
                observation="any"
                pointName={pointName}
                pointId={pointIdNumber}
                reefId={reefIdNumber}
                timeZone={reef?.timezone}
              />
            </Container>
          </Box>
        </>
      )}
    </>
  );
};

const styles = () =>
  createStyles({
    timelineWrapper: {
      backgroundColor: "rgb(245, 246, 246)",
    },
  });

interface MatchProps
  extends RouteComponentProps<{ id: string; pointId: string }> {}

interface SurveyPointIncomingProps {}

type SurveyPointProps = MatchProps &
  SurveyPointIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPoint);
