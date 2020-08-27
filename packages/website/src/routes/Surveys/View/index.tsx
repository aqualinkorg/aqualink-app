import React from "react";
import { useHistory } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  IconButton,
  Box,
  CardMedia,
  Typography,
} from "@material-ui/core";
import SurveyDetails from "./SurveyDetails";

import Map from "../../ReefRoutes/Reef/Map";
import type { Reef } from "../../../store/Reefs/types";
import reefImage from "../../../assets/reef-image.jpg";

const SurveyViewPage = ({ reef, surveyId, classes }: SurveyViewPageProps) => {
  const history = useHistory();
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
          <Grid item xs={10} className={classes.surveyDetails}>
            <SurveyDetails reef={reef} surveyId={surveyId} />
          </Grid>
          <Grid
            container
            direction="column"
            item
            className={classes.image}
            xs={2}
          >
            <Map polygon={reef.polygon} />
            <CardMedia className={classes.image} image={reefImage} />
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
      height: "45%",
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
    imageContainer: {},
    image: {
      height: "20rem",
    },
  });

interface SurveyViewPageIncomingProps {
  reef: Reef;
  surveyId?: string;
}

type SurveyViewPageProps = SurveyViewPageIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyViewPage);
