import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Paper,
  Grid,
  CardMedia,
  Typography,
  Button,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import { formatNumber } from "../../../../../helpers/numberUtils";
import DeleteButton from "../DeleteButton";
import { SurveyListItem } from "../../../../../store/Survey/types";
import incomingStyles from "../styles";

const SurveyCard = ({ isAdmin, reefId, survey, classes }: SurveyCardProps) => {
  return (
    <Paper elevation={0} className={classes.surveyCard}>
      <Grid style={{ height: "100%" }} container justify="space-between">
        <Grid className={classes.cardImageWrapper} item xs={12} md={5}>
          {survey.featuredSurveyMedia && (
            <CardMedia
              className={classes.cardImage}
              image={survey.featuredSurveyMedia.url}
            />
          )}
        </Grid>
        <Grid className={classes.infoWrapper} container item xs={11} md={6}>
          <Grid className={classes.info} container item xs={12}>
            {survey.userId!.fullName && (
              <Grid item xs={12}>
                <Typography className={classes.cardFields} variant="h6">
                  User
                </Typography>
                <Typography className={classes.cardValues} variant="h6">
                  {survey.userId!.fullName}
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
                    Comments
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
                <Grid item xs={12}>
                  <Typography className={classes.cardFields} variant="h6">
                    Temp
                  </Typography>
                  <Typography className={classes.cardValues} variant="h6">
                    {`${formatNumber(survey.temperature, 1)} °C`}
                  </Typography>
                </Grid>
              </Grid>
            )}
            <Grid container alignItems="flex-end" item xs={12}>
              <Link
                style={{ color: "inherit", textDecoration: "none" }}
                to={`/reefs/${reefId}/survey_details/${survey.id}`}
              >
                <Button size="small" variant="outlined" color="primary">
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
  );
};

const styles = (theme: Theme) =>
  createStyles({
    ...incomingStyles,
    surveyCard: {
      ...incomingStyles.surveyCard,
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        height: "32rem",
      },
    },
    cardImageWrapper: {
      height: "100%",
      [theme.breakpoints.down("sm")]: {
        height: "40%",
      },
    },
    infoWrapper: {
      height: "100%",
      [theme.breakpoints.down("sm")]: {
        height: "60%",
      },
    },
    commentsWrapper: {
      height: "40%",
    },
    comments: {
      height: "100%",
      overflowY: "auto",
    },
    info: {
      height: "100%",
      padding: "0.5rem 0.5rem 0.5rem 1rem",
    },
    buttonContainer: {
      ...incomingStyles.buttonContainer,
      [theme.breakpoints.down("sm")]: {
        height: "60%",
      },
    },
  });

interface SurveyCardIncomingProps {
  isAdmin: boolean;
  reefId: number;
  survey: SurveyListItem;
}

type SurveyCardProps = SurveyCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyCard);
