import React, { useState, useEffect, useRef } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  useMediaQuery,
  useTheme,
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Theme,
  Fab,
  ButtonProps,
} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import classNames from 'classnames';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import { GaAction, GaCategory, trackButtonClick } from 'utils/google-analytics';
import Card from './Card';
import landingPageImage from '../../assets/img/landing-page/header.jpg';
import { cardTitles } from './titles';

import Startpage from '../../assets/img/Startpage.jpg';

interface LandingPageButton {
  label: string;
  to: string;
  variant: ButtonProps['variant'];
  hasWhiteColor?: boolean;
}

const landingPageButtons: LandingPageButton[] = [
  {
    label: 'View The Map',
    to: '/map',
    variant: 'contained',
  },
  {
    label: 'Register Your Site',
    to: '/register',
    variant: 'outlined',
    hasWhiteColor: true,
  },
];

const LandingPage = ({ classes }: LandingPageProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const firstCard = useRef<HTMLDivElement>(null);

  const seeMore = () => {
    firstCard.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <title>Aqualink Ocean Monitoring for Marine Ecosystems. Free &amp; open</title>
        <meta name="description" content="Aqualink is a data management platform 
        for marine ecosystems. Integrate data from sensors and surveys to give 
        you an instant view of your ecosystem. Free" />
        <meta property="og:image" src={Startpage} />
        <meta property="og:image:alt" content="This image displays the interactive 
        Aqualink map and the Aqualink dashboard, which are the main two parts of 
        the Aqualink platform for coastal ocean monitoring. You can explore all of 
        the Aqualink sites around the globe in the interactive map. The map has 
        four layers where you can toggle between standard view, heat stress, sea 
        surface temperature, and SST Anomaly. Each site has a dashboard that allows 
        you to monitor your reef. It includes a map, survey feature, satellite data 
        with wind, wave, and temperature data, heat stress alerts for coral 
        bleaching, and graphs." />
      </Helmet>
      <NavBar routeButtons searchLocation={false} />
      {scrollPosition === 0 && isMobile && (
        <Box
          width="100%"
          display="flex"
          justifyContent="flex-end"
          position="fixed"
          bottom="10px"
          padding="0 10px"
        >
          <Fab onClick={seeMore} size="large">
            <ArrowDownwardIcon />
          </Fab>
        </Box>
      )}
      <div>
        <Box display="flex" alignItems="top" className={classes.landingImage}>
          <Container className={classes.container}>
            <Grid container item xs={9}>
              <Box display="flex">
                <Typography variant="h1" color="textPrimary">
                  Aqua
                </Typography>
                <Typography
                  className={classes.aqualinkSecondPart}
                  color="textPrimary"
                  variant="h1"
                >
                  link
                </Typography>
              </Box>
            </Grid>
            <Grid container item sm={11} md={7}>
              <Box mt="1.5rem" display="flex">
                <Typography variant="h1" color="textPrimary">
                  Monitoring for marine ecosystems
                </Typography>
              </Box>
            </Grid>
            <Grid container item sm={9} md={4}>
              <Box mt="4rem" display="flex">
                <Typography variant="h4" color="textPrimary">
                  A tool for people on the front lines of ocean conservation
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box mt="2rem">
                <Grid container spacing={2}>
                  {landingPageButtons.map(
                    ({ label, to, hasWhiteColor, variant }) => (
                      <Grid key={label} item xs={isTablet ? 12 : undefined}>
                        <Button
                          component={Link}
                          to={to}
                          className={classNames(classes.buttons, {
                            [classes.whiteColorButton]: hasWhiteColor,
                          })}
                          variant={variant}
                          color="primary"
                          onClick={() =>
                            trackButtonClick(
                              GaCategory.BUTTON_CLICK,
                              GaAction.LANDING_PAGE_BUTTON_CLICK,
                              label,
                            )
                          }
                        >
                          <Typography variant="h5">{label}</Typography>
                        </Button>
                      </Grid>
                    ),
                  )}
                </Grid>
              </Box>
            </Grid>
          </Container>
        </Box>
      </div>
      <Container className={classes.cardContainer}>
        {cardTitles.map((item, i) => (
          <Card
            ref={i === 0 ? firstCard : undefined}
            key={item.title}
            title={item.title}
            text={item.text}
            backgroundColor={item.backgroundColor}
            direction={item.direction}
            image={item.image}
            scaleDown={item.scaleDown}
          />
        ))}
      </Container>
      <Footer />
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    landingImage: {
      backgroundImage: `url("${landingPageImage}")`,
      backgroundSize: 'cover',
      left: 160,
      minHeight: 864,
      height: 'calc(100vh - 64px)', // subtract height of the navbar
      [theme.breakpoints.down('xs')]: {
        minHeight: 576,
      },
    },
    container: {
      [theme.breakpoints.up('sm')]: {
        paddingLeft: 60,
        paddingRight: 40,
      },
      paddingTop: 60,
    },
    aqualinkSecondPart: {
      opacity: 0.5,
    },
    cardContainer: {
      marginBottom: '1rem',
    },
    buttons: {
      height: 48,
      width: 208,
      textTransform: 'none',
      '&:hover': {
        color: 'white',
      },
      [theme.breakpoints.down('xs')]: {
        height: 40,
      },
    },
    whiteColorButton: {
      color: 'white',
      border: '2px solid white',
      '&:hover': {
        color: 'white',
        border: '2px solid white',
      },
    },
  });

type LandingPageProps = WithStyles<typeof styles>;

export default withStyles(styles)(LandingPage);
