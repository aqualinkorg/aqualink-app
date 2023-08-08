import React from 'react';
import {
  Theme,
  Paper,
  Grid,
  CardMedia,
  Typography,
  Button,
  makeStyles,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SurveyListItem } from 'store/Survey/types';
import { userInfoSelector } from 'store/User/userSlice';
import { surveysRequest } from 'store/Survey/surveyListSlice';
import { formatNumber } from 'helpers/numberUtils';
import surveyServices from 'services/surveyServices';
import { DateTime } from 'luxon';
import incomingStyles from '../styles';
import CustomLink from '../../../Link';
import LoadingSkeleton from '../../../LoadingSkeleton';
import pointImageSkeleton from '../../../../assets/img/loading-image.svg';
import DeleteButton from '../../../DeleteButton';

const SurveyCard = ({
  pointId,
  pointName,
  isAdmin,
  siteId,
  survey = null,
  loading = false,
}: SurveyCardProps) => {
  const classes = useStyles();
  const isShowingFeatured = pointId === -1;
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();

  const onSurveyDelete = async () => {
    if (survey?.id && siteId && user && user.token) {
      return surveyServices.deleteSurvey(siteId, survey.id, user.token);
    }
    return new Promise<void>((resolve) => resolve());
  };

  const onSurveyDeleteSuccess = () => dispatch(surveysRequest(`${siteId}`));

  const firstImage =
    survey?.surveyPointImage?.[pointId]?.[0].thumbnailUrl ||
    survey?.surveyPointImage?.[pointId]?.[0].url;
  const featuredImage =
    survey?.featuredSurveyMedia?.thumbnailUrl ||
    survey?.featuredSurveyMedia?.url;

  return (
    <Paper elevation={0} className={classes.surveyCard}>
      <Grid style={{ height: '100%' }} container justify="space-between">
        <Grid className={classes.cardImageWrapper} item xs={12} md={5}>
          <LoadingSkeleton
            loading={loading}
            variant="rect"
            height="100%"
            width="100%"
            image={pointImageSkeleton}
          >
            {survey && (
              <Link to={`/sites/${siteId}/survey_details/${survey.id}`}>
                <CardMedia
                  className={classes.cardImage}
                  image={
                    isShowingFeatured && featuredImage
                      ? featuredImage
                      : firstImage
                  }
                />
              </Link>
            )}
          </LoadingSkeleton>
        </Grid>
        <Grid className={classes.infoWrapper} container item xs={12} md={7}>
          <Grid
            className={classes.info}
            container
            item
            xs={12}
            direction={loading ? 'column' : 'row'}
            justify={loading ? 'center' : 'flex-start'}
          >
            <LoadingSkeleton
              loading={loading}
              variant="text"
              lines={8}
              longText
            >
              {survey && (
                <>
                  {survey.user?.fullName && (
                    <Grid container alignItems="center" item xs={12}>
                      <Typography className={classes.cardFields} variant="h6">
                        User:
                      </Typography>
                      <Typography
                        className={`${classes.cardValues} ${classes.valuesWithMargin}`}
                        variant="h6"
                      >
                        {survey.user.fullName}
                      </Typography>
                    </Grid>
                  )}
                  {survey.featuredSurveyMedia?.surveyPoint?.name && (
                    <Grid container alignItems="center" item xs={12}>
                      <Typography className={classes.cardFields} variant="h6">
                        Survey Point:
                      </Typography>
                      <Typography
                        className={`${classes.cardValues} ${classes.valuesWithMargin} ${classes.blueText}`}
                        variant="h6"
                        title={survey.featuredSurveyMedia.surveyPoint.name}
                      >
                        <CustomLink
                          to={`/sites/${siteId}/points/${
                            isShowingFeatured
                              ? survey.featuredSurveyMedia.surveyPoint.id
                              : pointId
                          }`}
                          isIcon={false}
                          tooltipTitle=""
                          content={
                            pointName === 'All'
                              ? survey.featuredSurveyMedia.surveyPoint.name
                              : pointName
                          }
                        />
                      </Typography>
                    </Grid>
                  )}
                  {survey.comments && (
                    <Grid
                      className={classes.commentsWrapper}
                      container
                      alignItems="flex-start"
                      item
                      xs={12}
                    >
                      <Grid style={{ height: '80%' }} item xs={12}>
                        <Typography className={classes.cardFields} variant="h6">
                          Comments:
                        </Typography>
                        <Typography
                          className={`${classes.cardValues} ${classes.comments}`}
                          variant="h6"
                        >
                          {survey.comments}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                  {survey.satelliteTemperature && (
                    <Grid container alignItems="center" item xs={12}>
                      <Typography className={classes.cardFields} variant="h6">
                        Temp:
                      </Typography>
                      <Typography
                        className={`${classes.cardValues} ${classes.valuesWithMargin}`}
                        variant="h6"
                      >
                        {`${formatNumber(survey.satelliteTemperature, 1)} °C`}
                      </Typography>
                    </Grid>
                  )}
                  <Grid
                    container
                    alignItems="center"
                    justify="space-between"
                    item
                    xs={12}
                  >
                    <Grid item xs={10}>
                      <Link
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        to={`/sites/${siteId}/survey_details/${survey.id}`}
                      >
                        <Button size="small" variant="outlined" color="primary">
                          VIEW DETAILS
                        </Button>
                      </Link>
                    </Grid>
                    {isAdmin &&
                      typeof siteId === 'number' &&
                      typeof survey?.diveDate === 'string' && (
                        <Grid container justify="flex-end" item xs={2}>
                          <DeleteButton
                            content={
                              <Typography color="textSecondary">{`Are you sure you would like to delete the survey for ${DateTime.fromISO(
                                survey.diveDate,
                              ).toFormat(
                                'LL/dd/yyyy',
                              )}? It will delete all media associated with this survey.`}</Typography>
                            }
                            onConfirm={onSurveyDelete}
                            onSuccess={onSurveyDeleteSuccess}
                          />
                        </Grid>
                      )}
                  </Grid>
                </>
              )}
            </LoadingSkeleton>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  ...incomingStyles,
  cardImageWrapper: {
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      height: '50%',
    },
  },
  infoWrapper: {
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      height: '50%',
    },
  },
  commentsWrapper: {
    maxHeight: '51%',
  },
  comments: {
    height: '100%',
    overflowY: 'auto',
  },
  valuesWithMargin: {
    marginLeft: '1rem',
    maxWidth: '60%',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  blueText: {
    color: theme.palette.primary.main,
  },
  info: {
    height: '100%',
    padding: '0.5rem 0.5rem 0.5rem 1rem',
  },
}));

interface SurveyCardProps {
  pointId: number;
  pointName: string | null;
  isAdmin: boolean;
  siteId?: number;
  survey?: SurveyListItem | null;
  loading?: boolean;
}

export default SurveyCard;
