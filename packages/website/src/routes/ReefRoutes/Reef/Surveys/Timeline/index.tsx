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
import {
  surveyListSelector,
  surveysRequest,
} from "../../../../../store/Survey/surveyListSlice";

const SurveyTimeline = ({ addNew, reefId, classes }: SurveyTimelineProps) => {
  const dispatch = useDispatch();
  const surveyList = useSelector(surveyListSelector);

  useEffect(() => {
    dispatch(surveysRequest(`${reefId}`));
  }, [dispatch, reefId]);

  return (
    <div className={classes.root}>
      <Timeline>
        {addNew && (
          <TimelineItem>
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
          surveyList.map((survey) => (
            <TimelineItem key={survey.id} className={classes.timelineItem}>
              {survey.diveDate && (
                <TimelineOppositeContent>
                  <Typography variant="h6" className={classes.dates}>
                    {moment.parseZone(survey.diveDate).format("MM/DD/YYYY")}
                  </Typography>
                </TimelineOppositeContent>
              )}
              <TimelineSeparator>
                <hr className={classes.connector} />
                <TimelineDot variant="outlined" className={classes.dot} />
                <hr className={classes.connector} />
              </TimelineSeparator>
              <TimelineContent>
                <Grid container item xs={12}>
                  <Paper elevation={0} className={classes.surveyCard}>
                    <Grid
                      style={{ height: "100%" }}
                      container
                      alignItems="center"
                      justify="space-between"
                      item
                      xs={12}
                    >
                      <Grid style={{ height: "100%" }} item xs={4}>
                        {survey.featuredSurveyMedia && (
                          <CardMedia
                            className={classes.cardImage}
                            image={survey.featuredSurveyMedia?.url}
                          />
                        )}
                      </Grid>
                      <Grid container item xs={7} spacing={1}>
                        {survey.userId!.fullName && (
                          <Grid container alignItems="center" item xs={12}>
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
                          <Grid container alignItems="center" item xs={12}>
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
                                {`${survey.temperature} \u2103`}
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
                  </Paper>
                </Grid>
              </TimelineContent>
            </TimelineItem>
          ))}
      </Timeline>
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
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
    dates: {
      fontWeight: 500,
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 0.81,
      letterSpacing: "normal",
      color: "#757575",
    },
    addNewButton: {
      color: "#979797",
      height: "2rem",
      width: "2rem",
    },
    dot: {
      border: "solid 1px #979797",
      backgroundColor: theme.palette.primary.light,
      height: "1rem",
      width: "1rem",
      padding: 0,
      margin: 0,
    },
    surveyCard: {
      width: "100%",
      backgroundColor: theme.palette.primary.light,
      border: 1,
      borderStyle: "solid",
      borderColor: "#dddddd",
      borderRadius: 2,
      height: "14rem",
    },
    cardImage: {
      height: "100%",
      width: "100%",
    },
    cardFields: {
      fontWeight: 500,
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 2,
      letterSpacing: "normal",
      color: "#9ea6aa",
    },
    cardValues: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 2,
      letterSpacing: "normal",
      color: "#2f2f2f",
    },
  });

interface SurveyTimelineIncomingProps {
  reefId: number;
  addNew: boolean;
}

type SurveyTimelineProps = SurveyTimelineIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyTimeline);
