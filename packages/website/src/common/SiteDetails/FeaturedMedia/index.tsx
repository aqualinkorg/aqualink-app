/* eslint-disable no-nested-ternary */
import {
  Card,
  CardMedia,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Theme,
  Box,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import { userInfoSelector } from 'store/User/userSlice';
import { isAdmin } from 'helpers/user';
import { convertOptionsToQueryParams } from 'helpers/video';
import { reefCheckSurveyListSelector } from 'store/ReefCheckSurveys';
import reefImage from '../../../assets/reef-image.jpg';
import uploadIcon from '../../../assets/icon_upload.svg';
import reefCheckLogo from '../../../assets/img/reef-check-logo.png';

const playerOptions = {
  autoplay: 1,
  mute: 1,
  modestbranding: 1,
  playsinline: 1,
};

const FeaturedMedia = ({
  siteId,
  url = null,
  featuredImage = null,
  surveyId = null,
  classes,
}: FeaturedMediaProps) => {
  const user = useSelector(userInfoSelector);
  const { list: reefCheckSurveyList } = useSelector(
    reefCheckSurveyListSelector,
  );
  const hasReefCheckSurveys = reefCheckSurveyList.length > 0;
  const isSiteAdmin = isAdmin(user, siteId);

  if (url) {
    const paramsPrefix = url.includes('?') ? '&' : '?';
    return (
      <Card className={classes.card}>
        <CardContent className={classes.content}>
          <iframe
            className={classes.fullHeightAndWidth}
            title="live-video-stream"
            src={`${url}${paramsPrefix}${convertOptionsToQueryParams(
              playerOptions,
            )}`}
            allowFullScreen
          />
        </CardContent>
      </Card>
    );
  }

  if (featuredImage && surveyId) {
    return (
      <Link href={`/sites/${siteId}/survey_details/${surveyId}`}>
        <CardMedia
          className={classes.card}
          style={{ height: '100%' }}
          image={featuredImage}
        />
      </Link>
    );
  }

  return (
    <Card className={classes.card}>
      <div className={classes.noVideoCardHeader}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          {hasReefCheckSurveys ? (
            <Box
              component={Link}
              href={`/sites/${siteId}#surveys`}
              display="flex"
              alignItems="center"
              gap={1}
              className={classes.noVideoCardHeaderText}
            >
              <img src={reefCheckLogo.src} alt="Reef Check" width={50} />
              <Typography variant="h5">REEF CHECK DATA AVAILABLE</Typography>
              <KeyboardDoubleArrowDown />
            </Box>
          ) : isSiteAdmin ? (
            <>
              <Grid item>
                <Typography
                  className={classes.noVideoCardHeaderText}
                  variant="h5"
                >
                  ADD YOUR FIRST SURVEY
                </Typography>
              </Grid>
              <Grid item>
                <IconButton
                  component={Link}
                  href={`/sites/${siteId}/new_survey`}
                  size="large"
                >
                  <img src={uploadIcon.src} alt="upload" />
                </IconButton>
              </Grid>
            </>
          ) : (
            <Typography className={classes.noVideoCardHeaderText} variant="h5">
              SURVEY TO BE UPLOADED
            </Typography>
          )}
        </Grid>
      </div>
      <div className={classes.noVideoCardContent} />
    </Card>
  );
};

const styles = (theme: Theme) => {
  return createStyles({
    card: {
      height: '100%',
      width: '100%',
      display: 'flex',
      borderRadius: 4,
      position: 'relative',
    },
    content: {
      height: '100%',
      width: '100%',
      padding: '0',
    },
    noVideoCardHeader: {
      backgroundColor: '#033042',
      opacity: 0.75,
      position: 'absolute',
      top: 0,
      width: '100%',
      padding: '2rem 0',
      zIndex: 1,
    },
    noVideoCardHeaderText: {
      color: 'white',
      [theme.breakpoints.between('md', 1350)]: {
        fontSize: 15,
      },
    },
    noVideoCardContent: {
      width: '100%',
      height: '100%',
      backgroundImage: `url(${reefImage.src})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      filter: 'blur(2px)',
    },

    fullHeightAndWidth: {
      height: '100%',
      width: '100%',
    },
  });
};

interface FeaturedMediaIncomingProps {
  siteId: number;
  url?: string | null;
  featuredImage?: string | null;
  surveyId?: number | null;
}

type FeaturedMediaProps = WithStyles<typeof styles> &
  FeaturedMediaIncomingProps;

export default withStyles(styles)(FeaturedMedia);
