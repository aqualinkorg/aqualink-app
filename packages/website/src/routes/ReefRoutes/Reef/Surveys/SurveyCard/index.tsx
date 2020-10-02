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
      <Grid
        style={{ height: "100%" }}
        container
        alignItems="center"
        justify="space-between"
      >
        <Grid className={classes.cardImageWrapper} item xs={12} md={4}>
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
          <Grid
            className={classes.info}
            container
            alignItems="center"
            item
            xs={11}
          >
            {survey.userId!.fullName && (
              <Grid container alignItems="flex-start" item xs={12}>
                <Grid item xs={5}>
                  <Typography className={classes.cardFields} variant="h6">
                    User:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography className={classes.cardValues} variant="h6">
                    {survey.userId!.fullName}
                  </Typography>
                </Grid>
              </Grid>
            )}
            {survey.comments && (
              <Grid container alignItems="flex-start" item xs={12}>
                <Grid item xs={5}>
                  <Typography className={classes.cardFields} variant="h6">
                    Comments:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography className={classes.cardValues} variant="h6">
                    {survey.comments}
                  </Typography>
                </Grid>
              </Grid>
            )}
            {survey.temperature && (
              <Grid container alignItems="center" item xs={12}>
                <Grid item xs={5}>
                  <Typography className={classes.cardFields} variant="h6">
                    Temp:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography className={classes.cardValues} variant="h6">
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
    info: {
      height: "100%",
    },
    buttonContainer: {
      ...incomingStyles.buttonContainer,
      [theme.breakpoints.down("sm")]: {
        height: "50%",
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
