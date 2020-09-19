import React, { useEffect } from "react";
import {
  createStyles,
  WithStyles,
  withStyles,
  Theme,
  Grid,
  IconButton,
  Typography,
  Paper,
  CardMedia,
  Button,
} from "@material-ui/core";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { Link } from "react-router-dom";

import {
  surveyListSelector,
  surveysRequest,
} from "../../../../../store/Survey/surveyListSlice";
import DeleteButton from "../DeleteButton";
import incomingStyles from "../styles";
import { formatNumber } from "../../../../../helpers/numberUtils";
import { TimelineProps } from "../types";
import filterSurveys from "../helpers";

const TimelineMobile = ({
  reefId,
  isAdmin,
  point,
  observation,
  classes,
}: TimelineMobileProps) => {
  const dispatch = useDispatch();
  const surveyList = useSelector(surveyListSelector);

  useEffect(() => {
    dispatch(surveysRequest(`${reefId}`));
  }, [dispatch, reefId]);

  return (
    <Grid container justify="flex-start" item xs={12}>
      {isAdmin && !(window && window.location.pathname.includes("new_survey")) && (
        <Grid
          style={{ marginBottom: "1rem" }}
          container
          alignItems="center"
          justify="flex-start"
          item
          xs={12}
        >
          <Link
            style={{ color: "inherit", textDecoration: "none" }}
            to={`/reefs/${reefId}/new_survey`}
          >
            <IconButton>
              <AddCircleOutlineIcon className={classes.addNewButton} />
            </IconButton>
          </Link>
          <Typography className={classes.cardFields} variant="h6">
            ADD NEW SURVEY
          </Typography>
        </Grid>
      )}
      {surveyList &&
        filterSurveys(surveyList, observation, point).map((survey) => (
          <Grid
            key={survey.id}
            className={classes.surveyWrapper}
            container
            justify="center"
            item
            xs={12}
          >
            <Grid style={{ marginBottom: "1rem" }} item xs={11}>
              <Typography variant="h6" className={classes.dates}>
                {moment.parseZone(survey.diveDate).format("MM/DD/YYYY")}
              </Typography>
            </Grid>
            <Grid style={{ marginBottom: "2rem" }} container item xs={12}>
              <Paper elevation={0} className={classes.surveyCard}>
                <Grid
                  style={{ height: "100%" }}
                  container
                  alignItems="center"
                  justify="space-between"
                >
                  <Grid
                    className={classes.cardImageWrapper}
                    item
                    xs={12}
                    md={4}
                  >
                    {survey.featuredSurveyMedia && (
                      <CardMedia
                        className={classes.cardImage}
                        image={survey.featuredSurveyMedia.url}
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.infoWrapper}
                    container
                    alignItems="center"
                    justify="center"
                    item
                    xs={11}
                    md={6}
                    spacing={1}
                  >
                    <Grid container alignItems="center" item xs={11}>
                      {survey.userId!.fullName && (
                        <Grid container alignItems="flex-start" item xs={12}>
                          <Grid item xs={5}>
                            <Typography
                              className={classes.cardFields}
                              variant="h6"
                            >
                              User:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              className={classes.cardValues}
                              variant="h6"
                            >
                              {survey.userId!.fullName}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                      {survey.comments && (
                        <Grid container alignItems="flex-start" item xs={12}>
                          <Grid item xs={5}>
                            <Typography
                              className={classes.cardFields}
                              variant="h6"
                            >
                              Comments:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              className={classes.cardValues}
                              variant="h6"
                            >
                              {survey.comments}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                      {survey.temperature && (
                        <Grid container alignItems="center" item xs={12}>
                          <Grid item xs={5}>
                            <Typography
                              className={classes.cardFields}
                              variant="h6"
                            >
                              Temp:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              className={classes.cardValues}
                              variant="h6"
                            >
                              {`${formatNumber(survey.temperature, 1)} °C`}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                      <Grid item xs={5}>
                        <Link
                          style={{ color: "inherit", textDecoration: "none" }}
                          to={`/reefs/${reefId}/survey_details/${survey.id}`}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                          >
                            VIEW DETAILS
                          </Button>
                        </Link>
                      </Grid>
                    </Grid>
                  </Grid>
                  {isAdmin && (
                    <Grid className={classes.buttonContainer} item xs={1}>
                      <DeleteButton
                        reefId={reefId}
                        surveyId={survey.id}
                        diveDate={survey.diveDate}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        ))}
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    ...incomingStyles,
    surveyWrapper: {
      marginTop: "2rem",
    },
    surveyCard: {
      ...incomingStyles.surveyCard,
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        height: "25rem",
      },
    },
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
      overflowY: "auto",
    },
    cardValues: {
      ...incomingStyles.cardValues,
      fontWeight: "normal",
    },
    buttonContainer: {
      ...incomingStyles.buttonContainer,
      [theme.breakpoints.down("sm")]: {
        height: "50%",
      },
    },
  });

type TimelineMobileProps = TimelineProps & WithStyles<typeof styles>;

export default withStyles(styles)(TimelineMobile);
