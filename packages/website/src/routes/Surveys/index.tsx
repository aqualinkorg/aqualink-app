import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  reefDetailsSelector,
  reefLoadingSelector,
  reefErrorSelector,
  reefRequest,
} from "../../store/Reefs/selectedReefSlice";
import NavBar from "../../common/NavBar";
import NewSurvey from "./New";

const Surveys = ({ match, classes }: SurveysProps) => {
  const reefDetails = useSelector(reefDetailsSelector);
  const loading = useSelector(reefLoadingSelector);
  const error = useSelector(reefErrorSelector);
  const dispatch = useDispatch();
  const reefId = match.params.id;

  useEffect(() => {
    if (!reefDetails) {
      dispatch(reefRequest(reefId));
    }
  }, [dispatch, reefId, reefDetails]);

  return (
    <>
      <NavBar searchLocation={false} />
      {/* eslint-disable-next-line no-nested-ternary */}
      {loading ? (
        <LinearProgress />
      ) : reefDetails && !error ? (
        <NewSurvey reef={reefDetails} />
      ) : (
        <div className={classes.noData}>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
          >
            <Grid item>
              <Typography gutterBottom color="primary" variant="h2">
                No Data Found
              </Typography>
            </Grid>
          </Grid>
        </div>
      )}
    </>
  );
};

const styles = () =>
  createStyles({
    noData: {
      display: "flex",
      alignItems: "center",
      height: "100%",
    },
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type SurveysProps = MatchProps & WithStyles<typeof styles>;

export default withStyles(styles)(Surveys);
