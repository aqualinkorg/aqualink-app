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

import SiteNavBar from "../../../common/NavBar";
import SiteFooter from "../../../common/Footer";
import SiteDetails from "../../../common/SiteDetails";
import SiteInfo from "./SiteInfo";
import {
  siteDetailsSelector,
  siteLoadingSelector,
  siteErrorSelector,
  siteRequest,
  siteTimeSeriesDataRangeRequest,
  clearTimeSeriesData,
  clearTimeSeriesDataRange,
  siteOceanSenseDataRequest,
  clearOceanSenseData,
} from "../../../store/Sites/selectedSiteSlice";
import {
  surveysRequest,
  surveyListSelector,
} from "../../../store/Survey/surveyListSlice";
import { sortByDate } from "../../../helpers/sortDailyData";
import { userInfoSelector } from "../../../store/User/userSlice";
import { isAdmin } from "../../../helpers/user";
import { findAdministeredSite } from "../../../helpers/findAdministeredSite";
import { User } from "../../../store/User/types";
import { localizedEndOfDay } from "../../../common/Chart/MultipleSensorsCharts/helpers";
import { subtractFromDate } from "../../../helpers/dates";
import { oceanSenseConfig } from "../../../constants/oceanSenseConfig";
import { useQueryParams } from "../../../hooks/useQueryParams";
import { findSurveyPointFromList } from "../../../helpers/siteUtils";

const getAlertMessage = (
  user: User | null,
  siteId: string,
  hasDailyData: boolean
) => {
  const userSite = findAdministeredSite(user, parseInt(siteId, 10));
  const { applied, status } = userSite || {};
  const isSiteAdmin = isAdmin(user, parseInt(siteId, 10));

  const defaultMessage =
    "Currently no Smart Buoy deployed at this site location. Real-time values are derived from a combination of NOAA satellite readings and weather models.";

  switch (true) {
    case !isSiteAdmin:
      return defaultMessage;

    case !hasDailyData:
      return "Welcome to your virtual site, data is loading, please come back in a few hours. This site will be visible publicly as soon as it has been approved by the Aqualink team.";

    case !applied:
      return (
        <div>
          {defaultMessage} Apply for an Aqualink Smart Buoy
          <span> </span> <Link to={`/sites/${siteId}/apply`}>here</Link>.
        </div>
      );

    case status === "in_review":
      return (
        <div>
          {defaultMessage} Your application for an Aqualink Smart Buoy is being
          reviewed. You can check your application<span> </span>
          <Link to={`/sites/${siteId}/apply`}>here</Link>.
        </div>
      );

    case status === "approved":
      return "Your application for an Aqualink Smart Buoy has been approved.";

    case status === "shipped":
      return "Your Smart Buoy is on its way! Mark it as 'deployed' once it's installed to access its data.";

    case status === "rejected":
      return (
        <div>
          Your application for an Aqualink Smart Buoy was not approved at this
          time. For more information, you can contact<span> </span>
          <a href="mailto:info@aqualink.org">info@aqualink.org</a>
        </div>
      );

    default:
      return defaultMessage;
  }
};

const Site = ({ match, classes }: SiteProps) => {
  const siteDetails = useSelector(siteDetailsSelector);
  const user = useSelector(userInfoSelector);
  const loading = useSelector(siteLoadingSelector);
  const error = useSelector(siteErrorSelector);
  const surveyList = useSelector(surveyListSelector);
  const dispatch = useDispatch();
  const getQueryParam = useQueryParams();
  const siteId = match.params.id;
  const { id, liveData, dailyData, surveyPoints, timezone } = siteDetails || {};
  const querySurveyPointId = getQueryParam("surveyPoint");
  const { id: selectedSurveyPointId } =
    findSurveyPointFromList(querySurveyPointId, surveyPoints) || {};

  const featuredMedia = sortByDate(surveyList, "diveDate", "desc").find(
    (survey) =>
      survey.featuredSurveyMedia && survey.featuredSurveyMedia.type === "image"
  );

  const {
    id: featuredSurveyId,
    featuredSurveyMedia,
    diveDate,
  } = featuredMedia || {};
  const { surveyPoint: featuredSurveyPoint, url } = featuredSurveyMedia || {};

  const hasSpotterData = Boolean(liveData?.topTemperature);

  const hasDailyData = Boolean(dailyData && dailyData.length > 0);

  const today = localizedEndOfDay(undefined, timezone);

  // Fetch site and surveys
  useEffect(() => {
    dispatch(siteRequest(siteId));
    dispatch(surveysRequest(siteId));

    return () => {
      dispatch(clearTimeSeriesDataRange());
      dispatch(clearTimeSeriesData());
      dispatch(clearOceanSenseData());
    };
  }, [dispatch, siteId]);

  // Fetch time series data range for the site's closest survey point
  // once the survey points are successfully fetched
  useEffect(() => {
    if (siteId === id?.toString()) {
      dispatch(
        siteTimeSeriesDataRangeRequest({
          siteId,
          pointId: selectedSurveyPointId,
        })
      );
    }
  }, [dispatch, id, selectedSurveyPointId, siteId]);

  useEffect(() => {
    if (id && oceanSenseConfig?.[id] && siteId === id.toString()) {
      dispatch(
        siteOceanSenseDataRequest({
          sensorID: "oceansense-2",
          startDate: subtractFromDate(today, "month", 6),
          endDate: today,
          latest: true,
        })
      );
    }
  }, [dispatch, id, siteId, today]);

  if (loading || (!siteDetails && !error)) {
    return (
      <>
        <SiteNavBar searchLocation={false} />
        <LinearProgress />
      </>
    );
  }

  return (
    <>
      <SiteNavBar searchLocation />
      <Container className={!hasDailyData ? classes.noDataWrapper : ""}>
        {siteDetails && liveData && !error ? (
          <>
            <SiteInfo
              hasDailyData={hasDailyData}
              site={siteDetails}
              lastSurvey={surveyList[surveyList.length - 1]?.diveDate}
              isAdmin={isAdmin(user, parseInt(siteId, 10))}
            />
            {!hasSpotterData && (
              <Box mt="1.3rem">
                <Alert severity="info">
                  {getAlertMessage(user, siteId, hasDailyData)}
                </Alert>
              </Box>
            )}
            <SiteDetails
              site={{
                ...siteDetails,
                featuredImage: url,
              }}
              selectedSurveyPointId={selectedSurveyPointId}
              featuredSurveyId={featuredSurveyId}
              hasDailyData={hasDailyData}
              surveys={surveyList}
              featuredSurveyPoint={featuredSurveyPoint}
              surveyDiveDate={diveDate}
            />
          </>
        ) : (
          <Container className={classes.noData}>
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <Typography gutterBottom color="primary" variant="h2">
                  No Data Found
                </Typography>
              </Grid>
            </Grid>
          </Container>
        )}
      </Container>
      <SiteFooter />
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

type SiteProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Site);
