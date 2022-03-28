import React from "react";
import {
  Theme,
  Paper,
  Grid,
  CardMedia,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import { formatNumber } from "../../../../helpers/numberUtils";
import DeleteButton from "../DeleteButton";
import { SurveyListItem } from "../../../../store/Survey/types";
import incomingStyles from "../styles";
import CustomLink from "../../../Link";
import LoadingSkeleton from "../../../LoadingSkeleton";
import pointImageSkeleton from "../../../../assets/img/loading-image.png";

const SurveyCard = ({
  pointId,
  pointName,
  isAdmin,
  siteId,
  survey,
  loading,
}: SurveyCardProps) => {
  const classes = useStyles();
  const isShowingFeatured = pointId === -1;
  const displayDeleteButton = isAdmin && typeof siteId === "number";

  return (
    <Paper elevation={0} className={classes.surveyCard}>
      <Grid style={{ height: "100%" }} container justify="space-between">
        <Grid className={classes.cardImageWrapper} item xs={12} md={5}>
          <LoadingSkeleton
            loading={loading}
            variant="rect"
            height="100%"
            width="100%"
            image={pointImageSkeleton}
          >
            {survey && (
              <Link to={`/sites/${siteId}/survey_details/${survey.id}`}>
                <CardMedia
                  className={classes.cardImage}
                  image={
                    isShowingFeatured
                      ? survey.featuredSurveyMedia?.url
                      : survey.surveyPointImage?.[pointId]?.[0]
                  }
                />
              </Link>
            )}
          </LoadingSkeleton>
        </Grid>
        <Grid className={classes.infoWrapper} container item xs={12} md={7}>
          <Grid
            className={classes.info}
            container
            item
            xs={12}
            direction={loading ? "column" : "row"}
            justify={loading ? "center" : "flex-start"}
          >
            <LoadingSkeleton
              loading={loading}
              variant="text"
              lines={8}
              longText
            >
              {survey && (
                <>
                  {survey.user?.fullName && (
                    <Grid container alignItems="center" item xs={12}>
                      <Typography className={classes.cardFields} variant="h6">
                        User:
                      </Typography>
                      <Typography
                        className={`${classes.cardValues} ${classes.valuesWithMargin}`}
                        variant="h6"
                      >
                        {survey.user.fullName}
                      </Typography>
                    </Grid>
                  )}
                  {survey.featuredSurveyMedia?.surveyPoint?.name && (
                    <Grid container alignItems="center" item xs={12}>
                      <Typography className={classes.cardFields} variant="h6">
                        Survey Point:
                      </Typography>
                      <Typography
                        className={`${classes.cardValues} ${classes.valuesWithMargin} ${classes.blueText}`}
                        variant="h6"
                        title={survey.featuredSurveyMedia.surveyPoint.name}
                      >
                        <CustomLink
                          to={`/sites/${siteId}/points/${
                            isShowingFeatured
                              ? survey.featuredSurveyMedia.surveyPoint.id
                              : pointId
                          }`}
                          isIcon={false}
                          tooltipTitle=""
                          content={
                            pointName === "All"
                              ? survey.featuredSurveyMedia.surveyPoint.name
                              : pointName
                          }
                        />
                      </Typography>
                    </Grid>
                  )}
                  {survey.comments && (
                    <Grid
                      className={classes.commentsWrapper}
                      container
                      alignItems="flex-start"
                      item
                      xs={12}
                    >
                      <Grid style={{ height: "80%" }} item xs={12}>
                        <Typography className={classes.cardFields} variant="h6">
                          Comments:
                        </Typography>
                        <Typography
                          className={`${classes.cardValues} ${classes.comments}`}
                          variant="h6"
                        >
                          {survey.comments}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                  {survey.temperature && (
                    <Grid container alignItems="center" item xs={12}>
                      <Typography className={classes.cardFields} variant="h6">
                        Temp:
                      </Typography>
                      <Typography
                        className={`${classes.cardValues} ${classes.valuesWithMargin}`}
                        variant="h6"
                      >
                        {`${formatNumber(survey.temperature, 1)} °C`}
                      </Typography>
                    </Grid>
                  )}
                  <Grid
                    container
                    alignItems="center"
                    justify="space-between"
                    item
                    xs={12}
                  >
                    <Grid item xs={10}>
                      <Link
                        style={{ color: "inherit", textDecoration: "none" }}
                        to={`/sites/${siteId}/survey_details/${survey.id}`}
                      >
                        <Button size="small" variant="outlined" color="primary">
                          VIEW DETAILS
                        </Button>
                      </Link>
                    </Grid>
                    {displayDeleteButton && (
                      <Grid container justify="flex-end" item xs={2}>
                        <DeleteButton
                          siteId={siteId}
                          surveyId={survey.id}
                          diveDate={survey.diveDate}
                        />
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </LoadingSkeleton>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  ...incomingStyles,
  cardImageWrapper: {
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      height: "50%",
    },
  },
  infoWrapper: {
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      height: "50%",
    },
  },
  commentsWrapper: {
    maxHeight: "51%",
  },
  comments: {
    height: "100%",
    overflowY: "auto",
  },
  valuesWithMargin: {
    marginLeft: "1rem",
    maxWidth: "60%",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  blueText: {
    color: theme.palette.primary.main,
  },
  info: {
    height: "100%",
    padding: "0.5rem 0.5rem 0.5rem 1rem",
  },
}));

interface SurveyCardProps {
  pointId: number;
  pointName: string | null;
  isAdmin: boolean;
  siteId?: number;
  survey?: SurveyListItem | null;
  loading?: boolean;
}

SurveyCard.defaultProps = {
  loading: false,
  survey: null,
  siteId: undefined,
};

export default SurveyCard;
