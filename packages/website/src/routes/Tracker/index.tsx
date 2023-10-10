import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  Container,
  Grid,
  Typography,
  createStyles,
  Theme,
  makeStyles,
} from '@material-ui/core';
import { Link } from 'react-router-dom';

import { useImageAspectRatio } from 'hooks/useImageAspectRatio';
import { isPositiveNumber } from 'helpers/numberUtils';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import FootPrintImage from './FootPrintImage';

import hero from '../../assets/img/tracker-page/hero.png';
import image1 from '../../assets/img/tracker-page/image1.png';
import image2 from '../../assets/img/tracker-page/image2.png';
import image3 from '../../assets/img/tracker-page/image3.png';
import image4 from '../../assets/img/tracker-page/image4.png';

interface StyleProps {
  heroAspectRatio?: number;
  image1AspectRatio?: number;
  image2AspectRatio?: number;
  image3AspectRatio?: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginTop: theme.spacing(),
    },
    hero: ({ heroAspectRatio }: StyleProps) => ({
      width: '100%',
      paddingTop: isPositiveNumber(heroAspectRatio)
        ? `calc(100% / ${heroAspectRatio})`
        : 0,
      position: 'relative',
    }),
    heroTitle: {
      fontWeight: 700,
    },
    header: {
      margin: theme.spacing(7, 0, 5),
      [theme.breakpoints.down('xs')]: {
        margin: theme.spacing(4, 0, 2),
      },
    },
    titleWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 48,
      [theme.breakpoints.down('xs')]: {
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
      },
    },
    title: {
      fontWeight: 700,
      fontSize: 24,
      [theme.breakpoints.up('md')]: {
        fontSize: 32,
      },
    },
    card1: ({ image1AspectRatio }: StyleProps) => ({
      width: '100%',
      paddingTop: isPositiveNumber(image1AspectRatio)
        ? `calc(100% / ${image1AspectRatio})`
        : 0,
      position: 'relative',
      borderRadius: 10,
    }),
    card2: ({ image2AspectRatio }: StyleProps) => ({
      width: '100%',
      paddingTop: isPositiveNumber(image2AspectRatio)
        ? `calc(100% / ${image2AspectRatio})`
        : 0,
      position: 'relative',
      borderRadius: 10,
    }),
    card3: ({ image3AspectRatio }: StyleProps) => ({
      width: '100%',
      paddingTop: isPositiveNumber(image3AspectRatio)
        ? `calc(100% / ${image3AspectRatio})`
        : 0,
      position: 'relative',
      borderRadius: 10,
    }),
    image: {
      height: '100%',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
    },
    link: {
      color: theme.palette.primary.main,
      '&:hover': {
        color: theme.palette.primary.main,
        textDecoration: 'none',
      },
    },
    footPrintImageWrapper: {
      [theme.breakpoints.down('xs')]: {
        marginTop: theme.spacing(2),
      },
    },
    globalStressWrapper: {
      marginBottom: theme.spacing(2),
    },
  }),
);

interface TrackerProps {
  shouldShowNav?: boolean;
  shouldShowFooter?: boolean;
}

const Tracker = ({
  shouldShowNav = true,
  shouldShowFooter = true,
}: TrackerProps) => {
  const heroAspectRatio = useImageAspectRatio(hero);
  const image1AspectRatio = useImageAspectRatio(image1);
  const image2AspectRatio = useImageAspectRatio(image2);
  const image3AspectRatio = useImageAspectRatio(image3);

  const classes = useStyles({
    heroAspectRatio,
    image1AspectRatio,
    image2AspectRatio,
    image3AspectRatio,
  });

  return (
    <>
      {shouldShowNav && <NavBar searchLocation={false} />}
      <Box className={classes.hero}>
        <CardMedia className={classes.image} image={hero} />
        <Container className={classes.titleWrapper}>
          <Typography
            className={classes.heroTitle}
            variant="h1"
            color="textPrimary"
          >
            Tracking Heatwaves
          </Typography>
        </Container>
      </Box>
      <Container className={classes.root}>
        <Box margin="72px 0 48px 0">
          <Typography className={classes.title} variant="h2">
            Florida Heatwave Tracking
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={8}>
            <Card className={classes.card1} variant="outlined">
              <a
                className={classes.link}
                rel="noopener noreferrer"
                target="_blank"
                href="https://highlights.aqualink.org/florida-heatwave-tracking"
              >
                <CardMedia className={classes.image} image={image4} />
              </a>
            </Card>
          </Grid>
          <Grid item xs={12} md={5} lg={4}>
            <Typography variant="h6">
              Track the heatwave in Florida with Aqualink. Corals are very
              sensitive to temperature increases. An increase of just 1℃ can
              start a bleaching process, eventually killing the coral unless the
              temperature returns to normal. Aqualink is dedicated to sharing
              data and awareness publicly. On the{' '}
              <a
                className={classes.link}
                rel="noopener noreferrer"
                target="_blank"
                href="https://highlights.aqualink.org/florida-heatwave-tracking"
              >
                Florida Heatwave Tracking page
              </a>
              , you can see this site&apos;s data, live stream, and the
              devastating effects the heatwave has had on the corals in the past
              couple of weeks.
            </Typography>
          </Grid>
        </Grid>
        <Grid
          container
          className={classes.header}
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Grid item xs={12} sm={7} md={9}>
            <Typography className={classes.title}>
              Using Sensor Networks to Monitor Heat Waves in Real-time
            </Typography>
          </Grid>
          <Grid
            className={classes.footPrintImageWrapper}
            item
            xs={12}
            sm={5}
            md={3}
          >
            <FootPrintImage imageHeight={128} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
            <Typography variant="h6">
              The ability for sensors to be grouped for a particular event, such
              as a Heatwave, or a particular region, is important for users to
              get critical information at a glance. We have launched a new
              feature called Dashboards where anyone can create a customized
              collection of sensors to track this information. For example, the
              <a
                className={classes.link}
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.minderoo.org/"
              >
                {' '}
                Minderoo Foundation
              </a>{' '}
              worked with us and the{' '}
              <a
                className={classes.link}
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.uwa.edu.au"
              >
                University of Western Australila
              </a>{' '}
              to deploy Smart Buoys along the Western coast of Australia. This
              was done in a critical time for the region where an extreme
              heatwave, known as the{' '}
              <a
                className={classes.link}
                rel="noopener noreferrer"
                target="_blank"
                href="https://en.wikipedia.org/wiki/La_Ni%C3%B1a"
              >
                La Nina
              </a>
              , was exptected to come through the area, potentially bringing
              devastating affects to the local ecosystems. They created a
              dashboard{' '}
              <Link className={classes.link} to="/collections/minderoo">
                here
              </Link>{' '}
              that aggregrates all the sensors involved in tracking this event
              to get a real-time view of the severity. Scientists, media, and
              the general public can use this feature to get a holistic view of
              regional and event-based information, and we hope to enable a
              better understanding of how to protect the ecosystems during such
              times as the La Nina Heatwave.
            </Typography>
          </Grid>
          <Grid item xs={12} md={7} lg={8}>
            <Card className={classes.card1} variant="outlined">
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="/collections/minderoo"
              >
                <CardMedia className={classes.image} image={image1} />
              </a>
            </Card>
          </Grid>
        </Grid>
        <Box margin="72px 0 48px 0">
          <Typography className={classes.title} variant="h2">
            Create Your Dashboard
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={8}>
            <Card className={classes.card2} variant="outlined">
              <CardMedia className={classes.image} image={image2} />
            </Card>
          </Grid>
          <Grid item xs={12} md={5} lg={4}>
            <Typography variant="h6">
              To get started, head over to one of the sites you are interested
              in adding to your Dashboard. A bookmark icon will appear next to
              the site name in the heading. Clicking this will add the site. To
              remove it, simply click the bookmark icon again. Your dashboard
              page will aggregate all the sites that you add this way, and the
              name of the collection can be customized to reflect the region,
              event, or other interest.
            </Typography>
          </Grid>
        </Grid>
        <Box margin="48px 0 72px 0">
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            spacing={3}
          >
            <Grid item xs={12} md={7} lg={9}>
              <Typography variant="h6">
                We worked closely with the Minderoo Foundation to build this
                feature. The funding for the Heatwave Tracker development was
                provided by the FootPrint Coalition and we would like to thank
                them for their support.
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box margin="72px 0 48px 0">
          <Typography className={classes.title} variant="h2">
            Track global heat stress at a glance
          </Typography>
        </Box>
        <Grid className={classes.globalStressWrapper} container spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
            <Typography variant="h6">
              Aqualink has developed a tracker that highlights all the sites
              under the most stress, at a glance. Use{' '}
              <Link className={classes.link} to="/collections/heat-stress">
                this page
              </Link>{' '}
              to see where the ocean is getting warmer and spot new heat waves.
            </Typography>
          </Grid>
          <Grid item xs={12} md={7} lg={8}>
            <Card className={classes.card3} variant="outlined">
              <Link to="/collections/heat-stress">
                <CardMedia className={classes.image} image={image3} />
              </Link>
            </Card>
          </Grid>
        </Grid>
      </Container>
      {shouldShowFooter && <Footer />}
    </>
  );
};

export default Tracker;
