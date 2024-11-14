import React from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  Theme,
} from '@material-ui/core';
import { Helmet } from 'react-helmet-async';

import NavBar from 'common/NavBar';
import Footer from 'common/Footer';

import fullDiagramBuoy from '../../assets/img/fulldiag3_1.svg';
import fullDiagramInfra from '../../assets/img/fulldiag3.svg';
import buoy from '../../assets/img/landing-page/buoy.jpg';

const Buoy = ({ classes }: BuoyProps) => {
  return (
    <>
      <Helmet>
        <title>
          Aqualink Smart Buoy | Real-time seafloor &amp; sea surface temperature
          &amp; sea surface temperature
        </title>
        <meta
          name="description"
          content="Aqualink's solar-powered smart 
        buoys collect temperature, wind & wave. Measuring real-time data from 
        seafloor and sea surface. Monitor marine ecosystems."
        />
        <meta property="og:image" content={buoy} />
        <meta
          property="og:image:alt"
          content="This image displays the 
        Aqualink Smart Buoy which is also known as Smart Mooring Spotter. This 
        Smart buoy is powered by solar panels and transmits data in real-time over 
        the air. It collects wind, wave, barometric pressure and temperature 
        from seafloor and sea surface."
        />
      </Helmet>
      <NavBar searchLocation={false} />
      <div className={classes.root} id="bloc-6">
        <div className="container bloc-md">
          <div className="row align-items-center">
            <div className="lcolpad col-12 col">
              <Typography className={classes.title} variant="h4">
                The Aqualink Buoy
              </Typography>
              <p className="text-lg-left">
                Current global ocean temperature monitoring systems are
                restricted to satellite-derived surface temperatures, which only
                capture the skin temperature of the water. The temperatures at
                greater depths, where coral sites can be found, are mostly
                unknown. Scientists will study those temperatures by installing
                local data loggers, which have to be physically retrieved from
                the site to have their data accessed. Once the loggers have been
                retrieved the findings will be published in a paper, but it’s
                rare to get continuous real-time readings of those temperatures.
                The monitoring system we are deploying includes a solar-powered
                smart buoy that relays temperature information in real-time,
                giving us some of the needed data to detect coral bleaching
                events early and put response plans in place.
                <br />
              </p>
            </div>
            <div className="col-lg-12 offset-lg-0">
              <img
                src={fullDiagramBuoy}
                className="img-fluid mg-lg mx-auto d-block img-responsive diagram lazyload"
                alt="bouydiagram2"
              />
            </div>
          </div>
          <div className="row voffset-lg">
            <div className="col-lg-12">
              <p className="text-lg-left">
                <br />
                The real-time temperature information is transmitted to our
                servers where a monitoring system combines that data with survey
                imagery to help understand the cause-and-effect of increasing
                temperatures on the local marine ecosystem. We are working with
                coral scientists to create easy-to-use instruction manuals for
                conducting site surveys and implementing response plans, all of
                which will be facilitated through our monitoring system.
                <br />
              </p>
            </div>
            <div className="col-lg-12">
              <img
                src={fullDiagramInfra}
                className="img-fluid mx-auto d-block img-responsive diagram lazyload"
                alt="Asset%204"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    title: {
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    root: {
      marginTop: '1rem',
    },

    listItem: {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(3),

      [theme.breakpoints.down('md')]: {
        margin: theme.spacing(3, 0),
      },
    },
  });

type BuoyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Buoy);
