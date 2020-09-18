import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  Theme,
  Grid,
  CardMedia,
  Button,
  Paper,
  IconButton,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineContent,
  TimelineOppositeContent,
} from "@material-ui/lab";
import { Link } from "react-router-dom";

import DeleteButton from "../DeleteButton";
import {
  surveyListSelector,
  surveysRequest,
} from "../../../../../store/Survey/surveyListSlice";
import incomingStyles from "../styles";
import { formatNumber } from "../../../../../helpers/numberUtils";
import { TimelineProps } from "../types";
import filterSurveys from "../helpers";

const SurveyTimeline = ({
  isAdmin,
  reefId,
  observation,
  point,
  classes,
}: SurveyTimelineProps) => {
  const dispatch = useDispatch();
  const surveyList = useSelector(surveyListSelector);

  useEffect(() => {
    dispatch(surveysRequest(`${reefId}`));
  }, [dispatch, reefId]);

  return (
    <div className={classes.root}>
      <Timeline>
        {isAdmin &&
          !(window && window.location.pathname.includes("new_survey")) && (
            <TimelineItem className={classes.timelineItem}>
              <TimelineOppositeContent
                className={classes.timelineOppositeContent}
                // Modify padding to center the Add survey symbol.
                style={{ padding: "0 10px" }}
              />
              <TimelineSeparator>
                <Link
                  style={{ color: "inherit", textDecoration: "none" }}
                  to={`/reefs/${reefId}/new_survey`}
                >
                  <IconButton>
                    <AddCircleOutlineIcon className={classes.addNewButton} />
                  </IconButton>
                </Link>
              </TimelineSeparator>
              <TimelineContent style={{ padding: "12px 16px" }}>
                <Typography className={classes.cardFields} variant="h6">
                  ADD NEW SURVEY
                </Typography>
              </TimelineContent>
            </TimelineItem>
          )}
        {surveyList &&
          filterSurveys(surveyList, observation, point).map((survey) => (
            <TimelineItem key={survey.id} className={classes.timelineItem}>
              {survey.diveDate && (
                <TimelineOppositeContent
                  className={classes.timelineOppositeContent}
                >
                  <Typography variant="h6" className={classes.dates}>
                    {moment(survey.diveDate).format("MM/DD/YYYY")}
                  </Typography>
                </TimelineOppositeContent>
              )}
              <TimelineSeparator>
                <hr className={classes.connector} />
                <TimelineDot variant="outlined" className={classes.dot} />
                <hr className={classes.connector} />
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={0} className={classes.surveyCard}>
                  <Grid
                    style={{ height: "100%" }}
                    container
                    alignItems="center"
                    justify="space-between"
                  >
                    <Grid style={{ height: "100%" }} item xs={4}>
                      {survey.featuredSurveyMedia && (
                        <CardMedia
                          className={classes.cardImage}
                          image={survey.featuredSurveyMedia.url}
                        />
                      )}
                    </Grid>
                    <Grid
                      className={classes.surveyInfo}
                      container
                      item
                      xs={6}
                      spacing={1}
                    >
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
                      <Grid item xs={6}>
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
              </TimelineContent>
            </TimelineItem>
          ))}
      </Timeline>
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    ...incomingStyles,
    root: {
      marginTop: "3rem",
      width: "100%",
    },
    connector: {
      height: "9rem",
      borderLeft: "2px dashed #8f8f8f",
      marginTop: 0,
      marginBottom: 0,
    },
    timelineItem: {
      alignItems: "center",
    },
    timelineOppositeContent: {
      flex: 0.5,
    },
    dot: {
      border: "solid 1px #979797",
      backgroundColor: theme.palette.primary.light,
      height: "1rem",
      width: "1rem",
      padding: 0,
      margin: 0,
    },
    surveyInfo: {
      height: "12rem",
      overflowY: "auto",
    },
    cardValues: {
      ...incomingStyles.cardValues,
      fontWeight: "normal",
    },
  });

type SurveyTimelineProps = TimelineProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyTimeline);
