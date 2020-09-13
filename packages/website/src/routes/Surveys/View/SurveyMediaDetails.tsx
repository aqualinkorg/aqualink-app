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
  Box,
} from "@material-ui/core";
import PermMediaIcon from "@material-ui/icons/PermMedia";
import VideoLibraryIcon from "@material-ui/icons/VideoLibrary";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { SurveyPoint } from "../../../store/Survey/types";
import { findOption } from "../../../constants/uploadDropdowns";
import {
  getNumberOfImages,
  getNumberOfVideos,
} from "../../../helpers/surveyMedia";

const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        arrows: false,
      },
    },
  ],
};

const SurveyMediaDetails = ({ points, classes }: SurveyMediaDetailsProps) => {
  return (
    <>
      {points &&
        points.map((point) => {
          const images = getNumberOfImages([point]);
          const videos = getNumberOfVideos([point]);

          return (
            <div key={point.name}>
              <Grid
                className={classes.title}
                container
                justify="flex-start"
                item
                xs={12}
              >
                <Grid
                  container
                  item
                  alignItems="baseline"
                  xs={12}
                  md={6}
                  lg={4}
                  spacing={2}
                >
                  <Grid item>
                    <Typography variant="h6">Survey Point: </Typography>
                  </Grid>
                  <Grid item>
                    <Typography className={classes.titleName} variant="h6">
                      {point.name}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container item xs={12} md={6} lg={2} spacing={2}>
                  {images > 0 && (
                    <Grid item xs={6} className={classes.imageLabel}>
                      <Typography variant="subtitle1">
                        {`${images} images`}
                      </Typography>
                      <Box pl={2}>
                        <PermMediaIcon />
                      </Box>
                    </Grid>
                  )}
                  {videos > 0 && (
                    <Grid container item xs={6} spacing={1}>
                      <Grid item>
                        <Typography variant="subtitle1">
                          {`${videos} videos`}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <VideoLibraryIcon />
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Slider className={classes.carousel} {...carouselSettings}>
                {point.surveyMedia.map((media) => {
                  return (
                    <Card
                      key={media.url}
                      elevation={3}
                      className={classes.shadowBox}
                    >
                      <Grid style={{ height: "100%" }} container>
                        <Grid style={{ width: "100%" }} item xs={6}>
                          <CardMedia
                            className={classes.cardImage}
                            image={media.url}
                          />
                        </Grid>
                        <Grid
                          style={{ height: "100%", overflowY: "auto" }}
                          container
                          justify="center"
                          item
                          xs={6}
                        >
                          <Grid
                            container
                            item
                            xs={11}
                            justify="space-around"
                            direction="column"
                            alignItems="flex-start"
                          >
                            <Grid item>
                              <Typography variant="h6">
                                Image Observation
                              </Typography>
                              <Typography variant="subtitle1">
                                {findOption(media.observations)}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography variant="h6">
                                Image Comments
                              </Typography>
                              <Typography variant="subtitle1">
                                {media.comments}
                              </Typography>
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
                      </Grid>
                    </Card>
                  );
                })}
              </Slider>
            </div>
          );
        })}
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    shadowBox: {
      backgroundColor: "#f5f6f6",
      color: theme.palette.text.secondary,
      marginBottom: "4rem",
      height: "28rem",
      [theme.breakpoints.down("xs")]: {
        height: "14rem",
      },
    },
    title: {
      marginBottom: "0.5rem",
      marginLeft: "1rem",
    },
    titleName: {
      fontSize: 18,
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.56,
      letterSpacing: "normal",
    },
    imageLabel: {
      display: "flex",
      whiteSpace: "pre",
    },
    cardImage: {
      width: "100%",
      height: "100%",
    },
    button: {
      marginTop: "1rem",
      textTransform: "none",
      fontWeight: "bold",
      border: "2px solid",
      "&:hover": {
        border: "2px solid",
      },
    },
    carousel: {
      marginBottom: "2rem",
    },
  });

interface SurveyMediaDetailsIncomingProps {
  points?: SurveyPoint[] | null;
}

SurveyMediaDetails.defaultProps = {
  points: null,
};

type SurveyMediaDetailsProps = SurveyMediaDetailsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyMediaDetails);
