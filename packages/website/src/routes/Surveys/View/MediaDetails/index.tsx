import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { SurveyMedia } from "../../../../store/Survey/types";
import {
  getNumberOfImages,
  getNumberOfVideos,
  getSurveyPointsByName,
} from "../../../../helpers/surveyMedia";
import {
  surveyLoadingSelector,
  selectedSurveyPointSelector,
  setFeaturedImage,
} from "../../../../store/Survey/surveySlice";
import { userInfoSelector } from "../../../../store/User/userSlice";
import surveyServices from "../../../../services/surveyServices";
import { isAdmin } from "../../../../helpers/user";
import SliderCard from "./SliderCard";
import MediaCount from "./MediaCount";
import MediaPointName from "./MediaPointName";

const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 960,
      settings: {
        arrows: false,
      },
    },
  ],
};

const MediaDetails = ({ siteId, surveyMedia, classes }: MediaDetailsProps) => {
  const user = useSelector(userInfoSelector);
  const loading = useSelector(surveyLoadingSelector);
  const selectedPoi = useSelector(selectedSurveyPointSelector);
  const dispatch = useDispatch();

  const onSurveyMediaUpdate = (mediaId: number) => {
    if (user && user.token) {
      surveyServices
        .editSurveyMedia(siteId, mediaId, { featured: true }, user.token)
        .then(() => {
          dispatch(setFeaturedImage(mediaId));
        })
        .catch(console.error);
    }
  };

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
                spacing={1}
                alignItems="center"
              >
                <Grid className={classes.surveyPointNameWrapper} item>
                  <MediaPointName
                    siteId={siteId}
                    pointName={point.name}
                    pointId={point.pointId}
                    selectedPoint={selectedPoi}
                  />
                </Grid>
                <Grid item>
                  <MediaCount images={images} videos={videos} />
                </Grid>
              </Grid>
              <Slider className={classes.carousel} {...carouselSettings}>
                {point.surveyMedia.map((media) => (
                  <SliderCard
                    key={media.originalUrl}
                    media={media}
                    loading={loading}
                    isSiteAdmin={isAdmin(user, siteId)}
                    onSurveyMediaUpdate={onSurveyMediaUpdate}
                  />
                ))}
              </Slider>
            </div>
          );
        })}
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    title: {
      margin: theme.spacing(0, 1),
    },
    surveyPointNameWrapper: {
      width: "70%",
      [theme.breakpoints.down("sm")]: {
        width: "90%",
      },
    },
    carousel: {
      marginBottom: "2rem",
    },
  });

interface MediaDetailsIncomingProps {
  siteId: number;
  surveyMedia?: SurveyMedia[] | null;
}

MediaDetails.defaultProps = {
  surveyMedia: null,
};

type MediaDetailsProps = MediaDetailsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaDetails);
