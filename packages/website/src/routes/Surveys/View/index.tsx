import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  IconButton,
  Box,
  Typography,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";

import {
  surveyDetailsSelector,
  surveyGetRequest,
} from "../../../store/Survey/surveySlice";
import SurveyDetails from "./SurveyDetails";

import Map from "../../ReefRoutes/Reef/Map";
import Charts from "./Charts";
import type { Reef } from "../../../store/Reefs/types";
import reefImage from "../../../assets/reef-image.jpg";

const SurveyViewPage = ({ reef, surveyId, classes }: SurveyViewPageProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const surveyDetails = useSelector(surveyDetailsSelector);

  useEffect(() => {
    if (!surveyDetails) {
      dispatch(surveyGetRequest(surveyId));
    }
  }, [dispatch, surveyId, surveyDetails]);

  return (
    <div className={classes.outerDiv}>
      <Grid alignItems="flex-start" container direction="column" spacing={1}>
        <Grid alignItems="center" container direction="row">
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
      </Grid>
      <Box boxShadow={3} className={classes.shadowBox}>
        <Grid container>
          <Grid
            container
            item
            direction="column"
            xs={10}
            className={classes.surveyDetails}
          >
            <SurveyDetails reef={reef} survey={surveyDetails} />
            <Typography variant="body2">
              {`MEAN DAILY WATER TEMPERATURE AT ${reef.depth}M (C°)`}
            </Typography>
            <Grid item xs={12}>
              <Charts
                dailyData={reef.dailyData}
                depth={reef.depth}
                // TODO - Remove default
                temperatureThreshold={(reef.maxMonthlyMean || 20) + 1}
              />
            </Grid>
          </Grid>
          {/* The grid breakpoints have no effect on items of a container with direction column and
           this is why they must not be added. 
           See corresponding material ui documentation:
            https://material-ui.com/components/grid/#direction-column-column-reverse */}
          <Grid
            container
            alignItems="flex-end"
            item
            direction="column"
            md={12}
            lg={2}
          >
            <Grid item className={classes.imageContainer}>
              <Map polygon={reef.polygon} />
            </Grid>
            <Grid item className={classes.imageContainer}>
              <img className={classes.image} src={reefImage} alt="reef" />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

const styles = () =>
  createStyles({
    outerDiv: {
      backgroundColor: "#f5f6f6",
      height: "auto",
      padding: "3rem 3.2rem 2rem 1rem",
    },
    shadowBox: {
      backgroundColor: "white",
      width: "100%",
      padding: "0rem 0rem 0rem 2rem",
      flexGrow: 1,
    },
    surveyDetails: {
      marginTop: "2rem",
    },
    image: {
      height: "100%",
      width: "100%",
      objectFit: "cover",
    },
    imageContainer: {
      flex: "1 0 auto",
      width: "100%",
      height: "50%",
    },
  });

interface SurveyViewPageIncomingProps {
  reef: Reef;
  surveyId: string;
}

type SurveyViewPageProps = SurveyViewPageIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyViewPage);
