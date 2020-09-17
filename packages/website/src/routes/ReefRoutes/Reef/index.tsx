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

  const featuredMedia = surveyList.find(
    (survey) =>
      survey.featuredSurveyMedia && survey.featuredSurveyMedia.type === "image"
  )?.featuredSurveyMedia;

  const latestDailyData =
    reefDetails && reefDetails.dailyData.length > 0
      ? sortDailyData(reefDetails.dailyData)[reefDetails.dailyData.length - 1]
      : undefined;

  const hasSpotter = Boolean(
    latestDailyData && latestDailyData.surfaceTemperature
  );

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
      <Container>
        {reefDetails && latestDailyData && !error ? (
          <>
            <ReefInfo
              reefName={reefDetails?.name || ""}
              lastDailyDataDate={latestDailyData?.date}
              lastSurvey={surveyList[surveyList.length - 1]?.diveDate}
              managerName={reefDetails?.admin || ""}
            />
            {!hasSpotter && (
              <Box mt="1rem">
                <Alert severity="info">
                  Currently no spotter deployed at this reef location. All
                  values are derived from a combination of NOAA satellite
                  readings and weather models.
                </Alert>
              </Box>
            )}
            <ReefDetails
              reef={{
                ...reefDetails,
                latestDailyData,
                featuredImage: featuredMedia?.url,
              }}
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
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
