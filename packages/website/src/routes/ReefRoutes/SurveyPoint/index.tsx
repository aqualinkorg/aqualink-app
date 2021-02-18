import React, { useEffect } from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "../../../common/NavBar";
import BackButton from "./BackButton";
import {
  reefDetailsSelector,
  reefRequest,
} from "../../../store/Reefs/selectedReefSlice";

const SurveyPoint = ({ match }: SurveyPointProps) => {
  const { id } = match.params;
  const dispatch = useDispatch();
  const reef = useSelector(reefDetailsSelector);

  useEffect(() => {
    if (!reef || reef.id !== parseInt(id, 10)) {
      dispatch(reefRequest(id));
    }
  });

  return (
    <>
      <NavBar searchLocation />
      <BackButton reefId={id} />
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
