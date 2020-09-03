import React, { useEffect } from "react";
import moment from "moment";
import { useHistory } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  IconButton,
  Theme,
  Paper,
  Typography,
  CardMedia,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { getFeaturedMedia } from "../../../helpers/surveyMedia";

import {
  surveyDetailsSelector,
  surveyGetRequest,
} from "../../../store/Survey/surveySlice";
import SurveyDetails from "./SurveyDetails";
import SurveyMediaDetails from "./SurveyMediaDetails";

import Map from "../../ReefRoutes/Reef/Map";
import Charts from "./Charts";
import type { Reef } from "../../../store/Reefs/types";

const SurveyViewPage = ({ reef, surveyId, classes }: SurveyViewPageProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const surveyDetails = useSelector(surveyDetailsSelector);

  useEffect(() => {
    dispatch(surveyGetRequest(surveyId));
  }, [dispatch, surveyId]);

  return (
    <>
      <Grid
        style={{ backgroundColor: "#f5f6f6" }}
        container
        justify="center"
        item
        xs={12}
      >
        <Grid
          style={{ margin: "4rem 0 1rem 0" }}
          container
          alignItems="center"
          item
          xs={11}
        >
          <IconButton
            edge="start"
            onClick={history.goBack}
            color="primary"
            aria-label="menu"
          >
            <ArrowBack />
          </IconButton>
          <Typography color="primary" variant="h5">
            All Surveys
          </Typography>
        </Grid>
        <Grid style={{ marginBottom: "6rem" }} item xs={11}>
          <Paper elevation={3} className={classes.surveyDetailsCard}>
            <Grid
              style={{ height: "100%" }}
              container
              justify="space-between"
              item
              xs={12}
            >
              <Grid container justify="center" item md={9}>
                <Grid container item xs={11}>
                  <SurveyDetails reef={reef} survey={surveyDetails} />
                </Grid>
                <Grid container alignItems="center" item xs={11}>
                  <Typography variant="subtitle2">
                    {`MEAN DAILY WATER TEMPERATURE AT ${reef.depth}M (°C)`}
                  </Typography>
                </Grid>
                <Grid container justify="center" item xs={12}>
                  <Charts
                    dailyData={reef.dailyData}
                    depth={reef.depth}
                    // TODO - Remove default
                    temperatureThreshold={(reef.maxMonthlyMean || 20) + 1}
                  />
                </Grid>
              </Grid>
              <Grid container item md={3}>
                <Grid item md={12} xs={6}>
                  <Map polygon={reef.polygon} />
                </Grid>
                <Grid item md={12} xs={6}>
                  {surveyDetails && surveyDetails.surveyPoints && (
                    <CardMedia
                      style={{ height: "100%" }}
                      image={getFeaturedMedia(surveyDetails.surveyPoints)}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid container justify="center" item xs={12}>
        <Grid container item xs={11}>
          <Grid style={{ margin: "5rem 0 5rem 0" }} item>
            <Typography style={{ fontSize: 18 }}>
              {`${moment(surveyDetails?.diveDate).format(
                "MM/DD/YYYY"
              )} Survey Media`}
            </Typography>
          </Grid>
          <Grid style={{ width: "100%" }} item>
            <SurveyMediaDetails points={surveyDetails?.surveyPoints} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    surveyDetailsCard: {
      width: "100%",
      height: "35rem",
      color: theme.palette.text.secondary,
      [theme.breakpoints.down("md")]: {
        height: "40rem",
      },
      [theme.breakpoints.down("sm")]: {
        height: "70rem",
      },
    },
  });

interface SurveyViewPageIncomingProps {
  reef: Reef;
  surveyId: string;
}

type SurveyViewPageProps = SurveyViewPageIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyViewPage);
