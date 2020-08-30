import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Button,
  Grid,
  Typography,
} from "@material-ui/core";
import { SurveyPoint } from "../../../store/Survey/types";

const SurveyMediaDetails = ({ points, classes }: SurveyMediaDetailsProps) => {
  return (
    <>
      {points &&
        points.map((point) => (
          <Box boxShadow={3} className={classes.shadowBox}>
            <Grid container justify="space-between">
              <Grid item xs={6}>
                <img
                  className={classes.image}
                  src={point.surveyMedia[0].url}
                  alt="reef"
                />
              </Grid>
              <Grid
                container
                item
                direction="column"
                xs={6}
                justify="space-between"
                className={classes.mediaInfo}
              >
                <Grid container item direction="column" spacing={1}>
                  <Grid container item direction="column">
                    <Typography variant="h6">Image Observation</Typography>
                    <Typography>{point.surveyMedia[0].observations}</Typography>
                  </Grid>
                  <Grid container item direction="column">
                    <Typography variant="h6">Image Comments</Typography>
                    <Typography>{point.surveyMedia[0].comments}</Typography>
                  </Grid>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                  >
                    All Photos From Survey Point
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        ))}
    </>
  );
};

const styles = () =>
  createStyles({
    shadowBox: {
      backgroundColor: "#f5f6f6",
      flexGrow: 1,
    },
    image: {
      width: "100%",
      height: "20rem",
      objectFit: "cover",
    },
    mediaInfo: {
      padding: "3rem 3rem 3rem 5rem",
    },
    button: {
      textTransform: "none",
      fontWeight: "bold",
      border: "2px solid",
      "&:hover": {
        border: "2px solid",
      },
    },
  });

interface SurveyMediaDetailsIncomingProps {
  points?: SurveyPoint[];
}

type SurveyMediaDetailsProps = SurveyMediaDetailsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyMediaDetails);
