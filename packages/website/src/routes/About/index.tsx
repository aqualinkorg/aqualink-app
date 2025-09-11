import React from 'react';
import { Typography, Theme, Button, CardMedia } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import classNames from 'classnames';

import NavBar from 'common/NavBar';
import Footer from 'common/Footer';

// --- Placeholders for your images ---
import dashboardAndReef from '../../assets/img/dashboard.jpg';
import mapOfSites from '../../assets/img/map.jpg';
import systemImage from '../../assets/img/system_image.jpg';
import mapLong from '../../assets/img/map_long.jpg';

// --- Team images ---
import peter from '../../assets/img/peter.jpg';
import caesar from '../../assets/img/caesar.jpg';
import ericb from '../../assets/img/ericb.jpg';

const About = ({ classes }: AboutProps) => {
  return (
    <>
      <NavBar searchLocation={false} />
      <div className={classes.root}>
        <div className="container bloc-md">
          {/* Section 1: About Us Intro */}
          <div className="row">
            <div className="col-12">
              <Typography variant="h4" className={classes.title}>
                About Us
              </Typography>
              <p>
                Aqualink is a free, open-source platform that provides a
                complete, real-time picture of marine health. We do this through
                two powerful, interconnected features: our integrated{' '}
                <b>Dashboards</b> and our global <b>Interactive Map</b>.
              </p>
              <p>
                Our mission is to give scientists, the public, and local
                communities the tools they need to understand and protect our
                oceans by weaving together all available data into one clear,
                accessible place.
              </p>
            </div>
          </div>
          {/* Section 2: Dashboard and Map Columns */}
          <div className={`row ${classes.sectionSpacer}`}>
            <div className="col-md-6">
              <a
                href="https://aqualink.org/sites/3197"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={dashboardAndReef}
                  alt="Dashboard and Coral Reef"
                  className={classes.responsiveImg}
                />
              </a>
              <Typography variant="h6" className={classes.columnTitle}>
                The Dashboard: A Complete View
              </Typography>
              <p className={classes.columnParagraph}>
                Our dashboards weave together satellite data, in-water sensors,
                and visual observations to tell the complete story of your reef.
                Interactive graphs are automatically created for all incoming
                data.
              </p>
            </div>
            <div className="col-md-6">
              <a
                href="https://aqualink.org/map"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={mapOfSites}
                  alt="Map of Aqualink sites"
                  className={classes.responsiveImg}
                />
              </a>
              <Typography variant="h6" className={classes.columnTitle}>
                The Map: Discover & Analyze
              </Typography>
              <p className={classes.columnParagraph}>
                Our interactive map allows you to explore over 6,000 sites,
                analyze global temperature trends, and filter data to find what
                matters.
              </p>
            </div>
          </div>
          {/* Section 3: The Aqualink Dashboard Foundation */}
          <div className={`row ${classes.sectionSpacer} align-items-center`}>
            <div className="col-12">
              <Typography variant="h4" className={classes.sectionTitle}>
                The Aqualink Dashboard: Unique Three-Part Foundation
              </Typography>
            </div>
            <div className="col-md-7">
              <Typography
                variant="h6"
                className={classes.subSectionTitle}
                style={{ marginTop: 0 }}
              >
                Satellite Data: The Big Picture, Automatically
              </Typography>
              <p>
                Every dashboard is automatically equipped with daily satellite
                data from&nbsp;
                <a
                  href="https://coralreefwatch.noaa.gov/product/5km/tutorial/welcome.php"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NOAA CRW
                </a>
                , providing essential context for your site. This includes:
              </p>
              <ul>
                <li>Daily Sea Surface Temperature (SST)</li>
                <li>Wind and Wave data (updated every 6 hours)</li>
                <li>
                  Built-in Heat Stress Analysis: We automatically calculate and
                  display the current heat stress level, 7-day temperature
                  trends, historical temperature maximums, and bleaching alert
                  levels.
                </li>
              </ul>

              <Typography variant="h6" className={classes.subSectionTitle}>
                In-Water Sensor Data: The On-Site Reality
              </Typography>
              <p>
                By connecting data from virtually any marine sensor, we can get
                a detailed analysis of the site&apos;s condition and stressors.
                The dashboard automatically produces graphs when data is
                uploaded.
              </p>
              <ul>
                <li>
                  Supports both continuous, real-time streams (e.g., from Sofar
                  Spotters) and periodic batch uploads (e.g., from water quality
                  sensors).
                </li>
                <li>
                  Integrates temperature, water quality, wind, and wave data.
                </li>
              </ul>

              <Typography variant="h6" className={classes.subSectionTitle}>
                Visual Observations: Surveys from the Reef
              </Typography>
              <p>
                Document what’s actually happening below the surface. Visual
                observations bring the sensor and satellite data to life by
                confirming how the marine life is reacting to the conditions
                they are facing.
              </p>
              <ul>
                <li>
                  Aqualink Surveys: Use our simple survey feature to quickly
                  upload images and comments from the field.
                </li>
                <li>
                  Reef Check Surveys: For in-depth analysis, conduct a
                  standardized Reef Check survey. All data on reef composition,
                  species, bleaching, disease, and human impacts is
                  automatically uploaded to your Aqualink dashboard, creating
                  the most comprehensive view possible.
                </li>
              </ul>
            </div>
            <div className="col-md-5">
              <img
                src={systemImage}
                alt="Aqualink System. Displaying the unique three-part foundation with satellite, in-situ sensors, and reef surfveys."
                className={classes.responsiveImg}
              />
            </div>
          </div>
          <div className={classes.buttonGroup}>
            <a
              href="https://www.reefcheck.org/tropical-program/courses-products/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="contained" color="primary">
                Become a Reef Check Diver
              </Button>
            </a>
            <a
              href="https://aqualink.org/register"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="contained" color="primary">
                Create Free Aqualink Dashboards
              </Button>
            </a>
          </div>
          {/* Section 4: The Interactive Map */}
          <div className={`row ${classes.sectionSpacer}`}>
            <div className="col-12">
              <Typography variant="h4" className={classes.sectionTitle}>
                The Interactive Map: Discover, Compare, and Analyze
              </Typography>
              <p>
                Our map is more than just a collection of dots; it&apos;s a
                powerful tool for global analysis. With over 6,000 sites, you
                can explore local ecosystems worldwide and understand how they
                fit into the bigger picture.
              </p>
            </div>
            <div className="col-md-6">
              <Typography variant="h6" className={classes.subSectionTitle}>
                Global Trends with Satellite Powered Map Layers
              </Typography>
              <p>
                The map is powered by the same live NOAA satellite data as our
                dashboards, allowing you to visualize global trends in:
              </p>
              <ul>
                <li>Sea Surface Temperature</li>
                <li>Coral Bleaching Heat Stress</li>
                <li>Sea Surface Temperature Anomaly</li>
              </ul>
            </div>
            <div className="col-md-6">
              <Typography variant="h6" className={classes.subSectionTitle}>
                Filter and Find What Matters
              </Typography>
              <p>
                Our advanced filtering system sets the Aqualink map apart. Go
                beyond just finding a location and actively analyze the state of
                the world&apos;s reefs. You can filter our 6,000+ sites by:
              </p>
              <ul>
                <li>Current heat stress level</li>
                <li>Type of in-situ sensors and data available</li>
                <li>
                  Species, reef composition, and anthropogenic impacts (from
                  integrated Reef Check data)
                </li>
              </ul>
            </div>
            <div>
              <a
                href="https://aqualink.org/map"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={mapLong}
                  alt="Aqualink map where you can explore dashboards worldwide and measure heatstress, ocean temperatures, and coral bleaching levels."
                  className={classes.responsiveImg}
                />
              </a>
            </div>
          </div>
          <div className={`row ${classes.sectionSpacer}`}>
            <div className="col-12">
              <Typography variant="h4" className={classes.sectionTitle}>
                See It in Action
              </Typography>
              <p>
                Watch a short overview to see the Aqualink platform in action.
              </p>
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
          </div>
          {/* Section 5: Want to Monitor? & Field Guide */}
          <div className={`row ${classes.sectionSpacer}`}>
            <div className="col-12">
              <Typography variant="h4" className={classes.sectionTitle}>
                Want To Monitor Your Local Marine Ecosystems?
              </Typography>
            </div>
            <div className="col-md-4 text-center">
              <Typography
                variant="h6"
                className={classes.subSectionTitle}
                style={{ marginTop: 0 }}
              >
                Contribute your own observations!
              </Typography>
              <p>
                Our animated field guide below provides an overview of best
                practices for conducting a survey with the Aqualink system.
              </p>
            </div>
            <div className="col-md-4 text-center">
              <Typography
                variant="h6"
                className={classes.subSectionTitle}
                style={{ marginTop: 0 }}
              >
                Get your own dashboards!
              </Typography>
              <p>
                Sign up for an Aqualink account and go to&nbsp;
                <a
                  href="https://aqualink.org/register"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register A Site
                </a>
                . It&apos;s free!
              </p>
            </div>
            <div className="col-md-4 text-center">
              <Typography
                variant="h6"
                className={classes.subSectionTitle}
                style={{ marginTop: 0 }}
              >
                No sensors or surveys?
              </Typography>
              <p>
                You can find a lot of value in only using the wind, wave, and
                temperature satellite data with the built-in Heat Stress
                Analysis. Surveys and in-situ sensor data can be added later,
                but are not a requirement.
              </p>
            </div>
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
          {/* Section 6: The Team */}
          <div className={`row ${classes.sectionSpacer}`}>
            <div className="centered col">
              <Typography variant="h4" className={classes.sectionTitle}>
                The Team
              </Typography>
              <p>
                We have been working in rapid development and entrepreneurial
                businesses that scale and hope to bring a similar mindset to
                ocean conservation. We have an extended team of engineering
                contractors in a variety of disciplines, all of whom embrace
                open source philosophies and want to help build ocean
                conservation tools.&nbsp;
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
                    alt="Peter Rive"
                  />
                  <h5 className="text-center mg-sm">Peter Rive</h5>
                  <p className="text-lg-center">
                    Co-founder of SolarCity, a pioneer in making solar energy an
                    affordable alternative to fossil fuels for homeowners.
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
                    alt="Caesar Hjerten"
                  />
                  <h5 className="text-center mg-sm">Caesar Hjerten</h5>
                  <p className="text-lg-center">
                    Swedish-born, University of Hawaii-based Business graduate,
                    ex-collegiate soccer player, and a passionate contributor to
                    saving our ocean. Aqualink&apos;s point of contact for
                    customer relations.
                    <br />
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 mt-3 mt-md-0">
              <div className="card border-0">
                <div className="card-body team-card">
                  <img
                    src={ericb}
                    className="rounded-circle mx-auto d-block mt-5 img-3-style lazyload"
                    width={100}
                    alt="Eric Boucher"
                  />
                  <h5 className="text-center mg-sm">
                    <a
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      href="https://www.linkedin.com/in/ericpboucher/"
                    >
                      Eric Boucher
                    </a>
                  </h5>
                  <p className="text-lg-center">
                    Entrepreneur and software engineer, passionate about open
                    source and social impact. Loves sailing and exploring the
                    ocean.
                  </p>
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

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: '1rem',
      marginBottom: '2rem',
    },
    sectionSpacer: {
      marginTop: theme.spacing(6),
    },
    title: {
      marginBottom: '1rem',
    },
    subtitle: {
      textAlign: 'left',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(3),
      color: theme.palette.text.secondary,
    },
    sectionTitle: {
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    subSectionTitle: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1),
      fontWeight: 'bold',
    },
    responsiveImg: {
      width: '80%',
      height: 'auto',
      display: 'block',
      margin: '0 auto',
      borderRadius: '2px',
    },
    columnTitle: {
      fontWeight: 'bold',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      textAlign: 'center',
    },
    columnParagraph: {
      textAlign: 'center',
    },
    buttonGroup: {
      marginTop: theme.spacing(3),
      display: 'flex',
      justifyContent: 'center', // Centers buttons horizontally on desktop
      flexWrap: 'wrap', // Allows buttons to wrap if needed
      gap: theme.spacing(2), // Adds a consistent 16px gap between items
      [theme.breakpoints.down(745)]: {
        flexDirection: 'column',
        alignItems: 'center',
      },
    },
    videoWrapper: {
      position: 'relative',
      paddingBottom: '56.25%', // 16:9 aspect ratio
      height: 0,
      overflow: 'hidden',
      width: '100%',
      margin: '1rem 0',
      border: '1px solid #ddd',
      borderRadius: '8px',
    },
    video: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
  });

interface AboutProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(About);
