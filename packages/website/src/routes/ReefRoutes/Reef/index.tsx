/* eslint-disable no-nested-ternary */
import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Container,
  Grid,
  Box,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useSelector, useDispatch } from "react-redux";
import { Link, RouteComponentProps } from "react-router-dom";

import ReefNavBar from "../../../common/NavBar";
import ReefFooter from "../../../common/Footer";
import ReefInfo from "./ReefInfo";
import { getReefNameAndRegion } from "../../../store/Reefs/helpers";
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
import ReefDetails from "./ReefDetails";
import { sortByDate } from "../../../helpers/sortDailyData";
import { userInfoSelector } from "../../../store/User/userSlice";
import { isAdmin } from "../../../helpers/isAdmin";
import { findAdministeredReef } from "../../../helpers/findAdministeredReef";
import { User } from "../../../store/User/types";

const getAlertMessage = (
  user: User | null,
  reefId: string,
  hasDailyData: boolean
) => {
  const userReef = findAdministeredReef(user, parseInt(reefId, 10));
  const applied = Boolean(userReef?.applied);

  const defaultMessage =
    "Currently no spotter deployed at this reef location. All values are derived from a combination of NOAA satellite readings and weather models.";

  switch (true) {
    case isAdmin(user, parseInt(reefId, 10)) && !hasDailyData:
      return "Welcome to your virtual reef, data is loading, please come back in a few hours. Your site will be visible publicly as soon as it has been approved by the Aqualink team.";

    case applied:
      return defaultMessage;

    case isAdmin(user, parseInt(reefId, 10)):
      return (
        <div>
          {defaultMessage} Apply for an Aqualink spotter
          <Link to="/apply"> here</Link>.
        </div>
      );
    default:
      return defaultMessage;
  }
};

const Reef = ({ match, classes }: ReefProps) => {
  const reefDetails = useSelector(reefDetailsSelector);
  const user = useSelector(userInfoSelector);
  const loading = useSelector(reefLoadingSelector);
  const error = useSelector(reefErrorSelector);
  const surveyList = useSelector(surveyListSelector);
  const dispatch = useDispatch();
  const reefId = match.params.id;

  const featuredMedia = sortByDate(surveyList, "diveDate", "desc").find(
    (survey) =>
      survey.featuredSurveyMedia && survey.featuredSurveyMedia.type === "image"
  );

  const { featuredSurveyMedia, diveDate } = featuredMedia || {};
  const { poiId, url } = featuredSurveyMedia || {};

  const { liveData, dailyData } = reefDetails || {};

  const hasSpotter = Boolean(liveData?.surfaceTemperature);

  const hasDailyData = Boolean(dailyData && dailyData.length > 0);

  useEffect(() => {
    dispatch(reefRequest(reefId));
    dispatch(surveysRequest(reefId));
  }, [dispatch, reefId]);

  if (loading) {
    return (
      <>
        <ReefNavBar searchLocation={false} />
        <LinearProgress />
      </>
    );
  }

  return (
    <>
      <ReefNavBar searchLocation={false} />
      <Container className={!hasDailyData ? classes.noDataWrapper : ""}>
        {reefDetails && liveData && !error ? (
          <>
            <ReefInfo
              hasDailyData={hasDailyData}
              reefName={getReefNameAndRegion(reefDetails).name || ""}
              lastSurvey={surveyList[surveyList.length - 1]?.diveDate}
              managerName={reefDetails?.admin || ""}
            />
            {!hasSpotter && (
              <Box mt="1rem">
                <Alert severity="info">
                  {getAlertMessage(user, reefId, hasDailyData)}
                </Alert>
              </Box>
            )}
            <ReefDetails
              reef={{
                ...reefDetails,
                featuredImage: url,
              }}
              hasDailyData={hasDailyData}
              surveys={surveyList}
              point={poiId}
              diveDate={diveDate}
            />
          </>
        ) : (
          <Container className={classes.noData}>
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
          </Container>
        )}
      </Container>
      <ReefFooter />
    </>
  );
};

const styles = () =>
  createStyles({
    noData: {
      display: "flex",
      alignItems: "center",
      height: "80vh",
    },
    noDataWrapper: {
      height: "100%",
    },
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
