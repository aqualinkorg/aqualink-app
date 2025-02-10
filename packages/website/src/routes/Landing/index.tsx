'use client';

import { useState, useEffect, useRef } from 'react';
import {
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
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Link from 'next/link';

import classNames from 'classnames';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import { GaAction, GaCategory, trackButtonClick } from 'utils/google-analytics';
import Card from './Card';
import landingPageImage from '../../assets/img/landing-page/header.jpg';
import { cardTitles } from './titles';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
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
                          href={to}
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
      backgroundImage: `url("${landingPageImage.src}")`,
      backgroundSize: 'cover',
      left: 160,
      minHeight: 864,
      height: 'calc(100vh - 64px)', // subtract height of the navbar
      [theme.breakpoints.down('sm')]: {
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
      [theme.breakpoints.down('sm')]: {
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
