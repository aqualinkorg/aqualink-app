import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Card,
  Grid,
  Typography,
  CardMedia,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import PermMediaIcon from "@material-ui/icons/PermMedia";
import VideoLibraryIcon from "@material-ui/icons/VideoLibrary";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { SurveyMedia } from "../../../store/Survey/types";
import { findOption } from "../../../constants/uploadDropdowns";
import {
  getNumberOfImages,
  getNumberOfVideos,
  getSurveyPointsByName,
} from "../../../helpers/surveyMedia";
import { surveyLoadingSelector } from "../../../store/Survey/surveySlice";

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

const SurveyMediaDetails = ({
  isAdmin,
  onSurveyMediaUpdate,
  surveyMedia,
  classes,
}: SurveyMediaDetailsProps) => {
  const loading = useSelector(surveyLoadingSelector);

  return (
    <>
      {surveyMedia &&
        getSurveyPointsByName(surveyMedia).map((point) => {
          const images = getNumberOfImages(point.surveyMedia);
          const videos = getNumberOfVideos(point.surveyMedia);

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
                  <Grid item xs={6} className={classes.imageLabel}>
                    <Typography variant="subtitle1">
                      {`${images} image`}
                      {images === 1 ? "" : "s"}
                    </Typography>
                    <Box pl={2}>
                      <PermMediaIcon />
                    </Box>
                  </Grid>
                  {videos > 0 && (
                    <Grid container item xs={6} spacing={1}>
                      <Grid item>
                        <Typography variant="subtitle1">
                          {`${videos} video`}
                          {videos === 1 ? "" : "s"}
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
                      {loading ? (
                        <Grid
                          className={classes.loading}
                          container
                          justify="center"
                          alignItems="center"
                          item
                          xs={12}
                        >
                          <CircularProgress size="10rem" thickness={1} />
                        </Grid>
                      ) : (
                        <Grid style={{ height: "100%" }} container>
                          <Grid style={{ width: "100%" }} item xs={6}>
                            <CardMedia
                              className={classes.cardImage}
                              image={media.url}
                            />
                          </Grid>
                          <Grid
                            className={classes.mediaInfo}
                            container
                            justify="flex-start"
                            item
                            xs={6}
                          >
                            <Grid
                              container
                              item
                              xs={10}
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
                            </Grid>
                            {isAdmin && (
                              <Grid container justify="flex-end" item xs={2}>
                                {media.featured ? (
                                  <Tooltip title="Featured image">
                                    <IconButton
                                      className={classes.featuredIcon}
                                    >
                                      <StarIcon color="primary" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Set as featured image">
                                    <IconButton
                                      onClick={() => onSurveyMediaUpdate(media)}
                                      className={classes.featuredIcon}
                                    >
                                      <StarBorderIcon color="primary" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      )}
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
    mediaInfo: {
      height: "100%",
      overflowY: "auto",
      padding: "1rem 1rem 1rem 1.5rem",
    },
    featuredIcon: {
      height: "3rem",
      width: "3rem",
    },
    loading: {
      height: "100%",
    },
  });

interface SurveyMediaDetailsIncomingProps {
  isAdmin: boolean;
  onSurveyMediaUpdate: (media: SurveyMedia) => void;
  surveyMedia?: SurveyMedia[] | null;
}

SurveyMediaDetails.defaultProps = {
  surveyMedia: null,
};

type SurveyMediaDetailsProps = SurveyMediaDetailsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyMediaDetails);
