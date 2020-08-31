import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Card,
  Button,
  Grid,
  Typography,
  CardMedia,
} from "@material-ui/core";
import Carousel from "react-material-ui-carousel";
import { SurveyPoint } from "../../../store/Survey/types";

const SurveyMediaDetails = ({ points, classes }: SurveyMediaDetailsProps) => {
  return (
    <>
      {points &&
        points.map((point, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <Grid
              className={classes.title}
              container
              justify="flex-start"
              item
              xs={12}
            >
              <Grid container alignItems="baseline" item>
                <Typography variant="h6">Survey Point: </Typography>
                <Typography className={classes.titleName} variant="h6">
                  {point.name}
                </Typography>
              </Grid>
            </Grid>
            <Carousel autoPlay={false} navButtonsAlwaysVisible>
              {point.surveyMedia.map((media) => {
                return (
                  <Card
                    key={media.url}
                    elevation={3}
                    className={classes.shadowBox}
                  >
                    <Grid container justify="space-between">
                      <Grid style={{ width: "100%" }} item xs={6}>
                        <CardMedia
                          className={classes.cardImage}
                          image={point.surveyMedia[0].url}
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
                            <Typography variant="h6">
                              Image Observation
                            </Typography>
                            <Typography variant="subtitle1">
                              {point.surveyMedia[0].observations}
                            </Typography>
                          </Grid>
                          <Grid container item direction="column">
                            <Typography variant="h6">Image Comments</Typography>
                            <Typography variant="subtitle1">
                              {point.surveyMedia[0].comments}
                            </Typography>
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
                  </Card>
                );
              })}
            </Carousel>
          </div>
        ))}
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    shadowBox: {
      backgroundColor: "#f5f6f6",
      color: theme.palette.text.secondary,
      marginBottom: "4rem",
    },
    title: {
      marginBottom: "0.5rem",
      marginLeft: "1rem",
    },
    titleName: {
      marginLeft: "1.5rem",
      fontSize: 18,
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.56,
      letterSpacing: "normal",
    },
    cardImage: {
      width: "100%",
      height: "100%",
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
