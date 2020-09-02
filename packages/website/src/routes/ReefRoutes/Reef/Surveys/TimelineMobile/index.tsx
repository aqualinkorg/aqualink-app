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

const TimelineMobile = ({ reefId, addNew, classes }: TimelineMobileProps) => {
  const dispatch = useDispatch();
  const surveyList = useSelector(surveyListSelector);

  useEffect(() => {
    dispatch(surveysRequest(`${reefId}`));
  }, [dispatch, reefId]);

  return (
    <Grid container justify="flex-start" item xs={12}>
      {addNew && (
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
        surveyList.map((survey) => (
          <Grid key={survey.id} container justify="center" item xs={12}>
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
                  item
                  xs={12}
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
                        image={survey.featuredSurveyMedia?.url}
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.infoWrapper}
                    container
                    alignItems="center"
                    justify="center"
                    item
                    xs={12}
                    md={7}
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
    addNewButton: {
      color: "#979797",
      height: "2rem",
      width: "2rem",
    },
    dates: {
      fontWeight: 500,
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 0.81,
      letterSpacing: "normal",
      color: "#757575",
    },
    surveyCard: {
      width: "100%",
      backgroundColor: theme.palette.primary.light,
      border: 1,
      borderStyle: "solid",
      borderColor: "#dddddd",
      borderRadius: 2,
      height: "14rem",
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
    cardImage: {
      height: "100%",
      width: "100%",
    },
    infoWrapper: {
      [theme.breakpoints.down("sm")]: {
        height: "50%",
      },
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

interface TimelineMobileIncomingProps {
  reefId: number;
  addNew: boolean;
}

type TimelineMobileProps = TimelineMobileIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(TimelineMobile);
