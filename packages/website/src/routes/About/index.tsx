import React from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  CardMedia,
} from '@material-ui/core';
import classNames from 'classnames';
import { Helmet } from 'react-helmet-async';

import NavBar from 'common/NavBar';
import Footer from 'common/Footer';

import Startpage from '../../assets/img/helmet/Startpage.jpg';
import peter from '../../assets/img/peter.jpg';
import caesar from '../../assets/img/caesar.jpg';
import eric from '../../assets/img/eric.jpg';

const About = ({ classes }: AboutProps) => {
  return (
    <>
      <Helmet>
        <title>About Us - Aqualink</title>
        <meta
          name="description"
          content="Learn about Aqualink's mission, our team,
         and our efforts in ocean conservation technology."
        />
        <meta property="og:image" content={Startpage} />
        <meta
          property="og:image:alt"
          content="This image displays the interactive 
        Aqualink map and the Aqualink dashboard, which are the main two parts of 
        the Aqualink platform for coastal ocean monitoring. You can explore all of 
        the Aqualink sites around the globe in the interactive map. The map has four 
        layers where you can toggle between standard view, heat stress, sea surface 
        temperature, and SST Anomaly. Each site has a dashboard that allows you to 
        monitor your reef. It includes a map, survey feature, satellite data with 
        wind, wave, and temperature data, heat stress alerts for coral bleaching, 
        and graphs. "
        />
      </Helmet>
      <NavBar searchLocation={false} />
      <div>
        <div className="page-container">
          <div className="bloc l-bloc" id="bloc-0">
            {/* bloc-1 */}
            <div className="bloc l-bloc" id="bloc-1">
              <div className="container bloc-md mobilecentered">
                <div className="row">
                  <div className="centered order-lg-0 order-1 order-md-0 order-sm-0 col">
                    <Typography className={classes.title} variant="h4">
                      About Us
                    </Typography>
                    <p>
                      Aqualink is a philanthropic engineering organization
                      working on building ocean conservation technology. Read
                      more about our inspiration, smart buoy, and web
                      application in our press release:{' '}
                      <a href="https://medium.com/aqualink/introducing-aqualink-dd1023393b8">
                        Introducing Aqualink
                      </a>
                      <br />
                      <br />
                      We&apos;ve put together a video to showcase the
                      capabilities of the Aqualink platform. Designed to support
                      your monitoring efforts, it provides an instant view of
                      your reef with free, publicly available data. This opens
                      up access to valuable information for everyone, from
                      enthusiasts to scientists, anywhere in the world.
                    </p>
                  </div>
                  <div
                    className={classNames('offset-lg-0 col-lg-12 order-lg-1', [
                      classes.videoWrapper,
                    ])}
                  >
                    <CardMedia
                      className={classes.video}
                      src="https://www.youtube.com/embed/EQZ3HiPevTY?si=dKTi4Mdv_Z9e9n-P"
                      title="What can you do with Aqualink?"
                      component="iframe"
                      allow="fullscreen"
                    />
                  </div>
                </div>
                <br />
                <div className="row">
                  <div className="centered order-lg-0 order-1 order-md-0 order-sm-0 col">
                    <p>
                      We have also created an animated field guide to give an
                      overview to the system and outline the best practices for
                      taking a survey and using the Aqualink system.
                    </p>
                  </div>
                  <div
                    className={classNames('offset-lg-0 col-lg-12 order-lg-1', [
                      classes.videoWrapper,
                    ])}
                  >
                    <CardMedia
                      className={classes.video}
                      src="https://www.youtube.com/embed/E_nXCl612lg"
                      title="field_guide"
                      component="iframe"
                      allow="fullscreen"
                    />
                  </div>
                </div>
                <br />
                <div className="row voffset-lg">
                  <div className="centered order-lg-0 order-1 order-md-0 order-sm-0 col">
                    <Typography className={classes.title} variant="h4">
                      The Team
                    </Typography>
                    <p>
                      We have been working in rapid development and
                      entrepreneurial businesses that scale and hope to bring a
                      similar mindset to ocean conservation. We have an extended
                      team of engineering contractors in a variety of
                      disciplines, all of whom embrace open source philosophies
                      and want to help build ocean conservation tools.&nbsp;
                      <br />
                    </p>
                  </div>
                </div>
                <div className="row voffset-md">
                  <div className="col-lg-4 col-md-4">
                    <div className="card border-0">
                      <div className="card-body team-card">
                        <img
                          src={peter}
                          className="rounded-circle mx-auto d-block mt-5 img-style lazyload"
                          width={100}
                          alt="placeholder user"
                        />
                        <h5 className="text-center mg-sm">Peter Rive</h5>
                        <p className="text-lg-center">
                          Co-founder of SolarCity, a pioneer in making solar
                          energy an affordable alternative to fossil fuels for
                          homeowners.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 mt-3 mt-md-0">
                    <div className="card border-0">
                      <div className="card-body team-card">
                        <img
                          src={caesar}
                          className="rounded-circle mx-auto d-block mt-5 img-placeholder-us-style lazyload"
                          width={100}
                          alt="placeholder user"
                        />
                        <h5 className="text-center mg-sm">Caesar Hjerten</h5>
                        <p className="text-lg-center">
                          Swedish-born, University of Hawaii-based Business
                          graduate, ex-collegiate soccer player, and a
                          passionate contributor to saving our ocean.
                          Aqualink&apos;s point of contact for customer
                          relations.
                          <br />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 mt-3 mt-md-0">
                    <div className="card border-0">
                      <div className="card-body team-card">
                        <img
                          src={eric}
                          className="rounded-circle mx-auto d-block mt-5 img-3-style lazyload"
                          width={100}
                          alt="placeholder user"
                        />
                        <h5 className="text-center mg-sm">
                          <a
                            style={{ color: 'inherit' }}
                            href="https://www.linkedin.com/in/ericpboucher/"
                          >
                            Eric Boucher
                          </a>
                        </h5>
                        <p className="text-lg-center">
                          Entrepreneur and software engineer, passionate about
                          open source and social impact. Loves sailing and
                          exploring the ocean.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = () =>
  createStyles({
    title: {
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    videoWrapper: {
      position: 'relative',
      paddingTop: 'calc(100% / 16 * 9)',
    },
    video: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
  });

type AboutProps = WithStyles<typeof styles>;

export default withStyles(styles)(About);
