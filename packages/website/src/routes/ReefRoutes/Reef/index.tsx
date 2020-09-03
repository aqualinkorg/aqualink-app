import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useSelector, useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import ReefNavBar from "../../../common/NavBar";
import ReefFooter from "../../../common/Footer";
import ReefInfo from "./ReefInfo";

import {
  reefDetailsSelector,
  reefLoadingSelector,
  reefErrorSelector,
  reefRequest,
} from "../../../store/Reefs/selectedReefSlice";
import {
  surveysRequest,
  surveyListSelector,
} from "../../../store/Survey/surveyListSlice";
import { sortDailyData } from "../../../helpers/sortDailyData";
import ReefDetails from "./ReefDetails";

const Reef = ({ match, classes }: ReefProps) => {
  const reefDetails = useSelector(reefDetailsSelector);
  const loading = useSelector(reefLoadingSelector);
  const error = useSelector(reefErrorSelector);
  const surveyList = useSelector(surveyListSelector);
  const dispatch = useDispatch();
  const reefId = match.params.id;

  const latestDailyData =
    reefDetails && reefDetails.dailyData.length > 0
      ? sortDailyData(reefDetails.dailyData)[reefDetails.dailyData.length - 1]
      : undefined;

  const hasSpotter =
    latestDailyData && latestDailyData.surfaceTemperature !== undefined;

  useEffect(() => {
    dispatch(reefRequest(reefId));
    dispatch(surveysRequest(reefId));
  }, [dispatch, reefId]);

  return (
    <>
      <ReefNavBar searchLocation={false} />
      {/* eslint-disable-next-line no-nested-ternary */}
      {loading ? (
        <LinearProgress />
      ) : reefDetails && latestDailyData && !error ? (
        <>
          <ReefInfo
            reefName={reefDetails?.name || ""}
            lastDailyDataDate={latestDailyData?.date}
            lastSurvey={surveyList[surveyList.length - 1]?.diveDate}
            managerName={reefDetails?.admin || ""}
          />
          {!hasSpotter && (
            <Grid className={classes.spotterAlert} container justify="center">
              <Grid item xs={11}>
                <Alert severity="info">
                  Currently no spotter deployed at this reef location. All data
                  values are derived from a combination of NOAA satellite
                  readings and weather models.
                </Alert>
              </Grid>
            </Grid>
          )}
          <ReefDetails reef={{ ...reefDetails, latestDailyData }} />
          <ReefFooter />
        </>
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
    spotterAlert: {
      marginTop: "1rem",
    },
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
