import { useState } from 'react';
import { Theme, Grid } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { useDispatch, useSelector } from 'react-redux';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { SurveyMediaUpdateRequestData } from 'store/Survey/types';
import {
  selectedSurveyPointSelector,
  surveyMediaEditRequest,
} from 'store/Survey/surveySlice';
import { userInfoSelector } from 'store/User/userSlice';
import {
  getNumberOfImages,
  getNumberOfVideos,
  getSurveyPointsByName,
} from 'helpers/surveyMedia';
import { isAdmin } from 'helpers/user';
import { ArrayElement } from 'utils/types';
import SliderCard from './SliderCard';
import MediaCount from './MediaCount';
import MediaPointName from './MediaPointName';

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

const MediaDetails = ({ siteId, point, classes }: MediaDetailsProps) => {
  const [editing, setEditing] = useState(false);
  const [editSurveyPointId, setEditSurveyPointId] = useState<
    number | undefined
  >(point.pointId);
  const user = useSelector(userInfoSelector);
  const selectedPoi = useSelector(selectedSurveyPointSelector);
  const dispatch = useDispatch();

  const onSurveyMediaUpdate = (
    mediaId: number,
    data: Partial<SurveyMediaUpdateRequestData>,
  ) => {
    if (user && user.token) {
      dispatch(
        surveyMediaEditRequest({ siteId, mediaId, data, token: user.token }),
      );
    }
  };

  const images = getNumberOfImages(point.surveyMedia);
  const videos = getNumberOfVideos(point.surveyMedia);

  return (
    <div key={point.name}>
      <Grid className={classes.title} container spacing={1} alignItems="center">
        <Grid className={classes.surveyPointNameWrapper} item>
          <MediaPointName
            siteId={siteId}
            pointName={point.name}
            pointId={point.pointId}
            selectedPoint={selectedPoi}
            editing={editing}
            editSurveyPointId={editSurveyPointId}
            setEditSurveyPointId={setEditSurveyPointId}
          />
        </Grid>
        <Grid item>
          <MediaCount images={images} videos={videos} />
        </Grid>
      </Grid>
      <Slider
        className={classes.carousel}
        {...carouselSettings}
        beforeChange={() => setEditing(false)}
      >
        {point.surveyMedia.map((media) => (
          <SliderCard
            key={media.url}
            media={media}
            editing={editing}
            editSurveyPointId={editSurveyPointId}
            setEditing={setEditing}
            isSiteAdmin={isAdmin(user, siteId)}
            onSurveyMediaUpdate={onSurveyMediaUpdate}
          />
        ))}
      </Slider>
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    title: {
      margin: theme.spacing(0, 1),
    },
    surveyPointNameWrapper: {
      width: '70%',
      [theme.breakpoints.down('md')]: {
        width: '90%',
      },
    },
    carousel: {
      marginBottom: '2rem',
    },
  });

interface MediaDetailsIncomingProps {
  siteId: number;
  point: ArrayElement<ReturnType<typeof getSurveyPointsByName>>;
}

type MediaDetailsProps = MediaDetailsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaDetails);
