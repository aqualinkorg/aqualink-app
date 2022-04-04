import React from "react";
import { Box, Card, Typography } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

import { siteDetailsSelector } from "../../../../store/Sites/selectedSiteSlice";
import { surveyListSelector } from "../../../../store/Survey/surveyListSlice";
import { sortByDate } from "../../../../helpers/dates";
import LoadingSkeleton from "../../../../common/LoadingSkeleton";
import SelectedSiteCardContent from "./CardContent";

const featuredSiteId = process.env.REACT_APP_FEATURED_SITE_ID || "";

const SelectedSiteCard = () => {
  const classes = useStyles();
  const site = useSelector(siteDetailsSelector);
  const surveyList = useSelector(surveyListSelector);

  const isFeatured = `${site?.id}` === featuredSiteId;

  const { featuredSurveyMedia } =
    sortByDate(surveyList, "diveDate", "desc").find(
      (survey) =>
        survey.featuredSurveyMedia &&
        survey.featuredSurveyMedia.type === "image"
    ) || {};

  const hasMedia = Boolean(featuredSurveyMedia?.url);

  return (
    <Box className={classes.card}>
      <Box mb={2}>
        <LoadingSkeleton
          loading={!site}
          variant="text"
          lines={1}
          textHeight={28}
        >
          <Typography variant="h5" color="textSecondary">
            {isFeatured ? "Featured Site" : "Selected Site"}
            {!hasMedia && (
              <Link to={`sites/${site?.id}`}>
                <LaunchIcon className={classes.launchIcon} />
              </Link>
            )}
          </Typography>
        </LoadingSkeleton>
      </Box>

      <Card>
        <SelectedSiteCardContent
          site={site}
          imageUrl={featuredSurveyMedia?.url}
        />
      </Card>
    </Box>
  );
};

const useStyles = makeStyles((theme) => ({
  card: {
    [theme.breakpoints.down("sm")]: {
      padding: 10,
    },
    padding: 20,
  },
  launchIcon: {
    fontSize: 20,
    marginLeft: "0.5rem",
    color: "#2f2f2f",
    "&:hover": {
      color: "#2f2f2f",
    },
  },
}));

export default SelectedSiteCard;
