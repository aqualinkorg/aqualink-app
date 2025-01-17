import React from 'react';
import { Typography, CardMedia } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import NavBar from 'common/NavBar';
import Footer from 'common/Footer';

const Faq = ({ classes }: FaqProps) => {
  return (
    <>
      <NavBar searchLocation={false} />
      <div>
        {/* Main container */}
        <div className="page-container">
          {/* bloc-11 */}
          <div className="bloc l-bloc" id="bloc-11">
            <div className="container bloc-lg">
              <div className="row">
                <div className="col">
                  <Typography className={classes.title} variant="h4">
                    Frequently Asked Questions
                  </Typography>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    What can you do with Aqualink?
                  </Typography>
                  <p>
                    We&apos;ve put together a video to showcase the capabilities
                    of the Aqualink platform. Designed to support your
                    monitoring efforts, it provides an instant view of your reef
                    with free, publicly available data. This opens up access to
                    valuable information for everyone, from enthusiasts to
                    scientists, anywhere in the world.
                    <br />
                    <br />
                  </p>
                  <div className={classes.videoWrapper}>
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
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    Overview of the Aqualink system and Survey guide
                  </Typography>
                  <p>
                    We have created an animated field guide that will describe
                    the best practices for conducting a survey and using the
                    Aqualink system.
                    <br />
                    <br />
                  </p>
                  <div className={classes.videoWrapper}>
                    <CardMedia
                      className={classes.video}
                      src="https://www.youtube.com/embed/E_nXCl612lg"
                      title="field_guide"
                      component="iframe"
                      allow="fullscreen"
                    />
                  </div>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How are you measuring temperature?
                  </Typography>
                  <p>
                    We collect temperature through satellite observations or
                    spotter (a Smart Buoy). Satellite measurements collect
                    temperature information from the very top layer of the
                    surface (skin temperature) based on a 5km grid. NOAA
                    publishes observed temperatures on a daily basis and makes
                    that available in their &quot;Daily Global 5km Satellite
                    Coral Bleaching Heat Stress Monitoring&quot;. Sofar Ocean
                    imports this data into their servers and Aqualink uses their
                    API to render the data in our web application. When a Smart
                    Buoy is deployed we collect temperature information every
                    hour from a depth of 1 meter as well as the moored depth
                    which is at the sea floor.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How do I connect my Sofar Spotter to Aqualink?
                  </Typography>
                  <p>
                    You can easily connect your buoy by going to EDIT SITE
                    DETAILS on your Aqualink dashboard. Click on Add custom API
                    token and add the Spotter ID and the API. Then Click on
                    Status and select deployed. Then press save. You can visit
                    your Sofar Ocean account at&nbsp;
                    <a
                      href="https://spotter.sofarocean.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://spotter.sofarocean.com/
                    </a>
                    &nbsp;to find your Spotter ID and API. You can also find
                    your Spotter ID on your buoy. You can also view this
                    tutorial video.&nbsp;
                    <a
                      href="https://www.youtube.com/watch?v=ytIOdhSzddY"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://www.youtube.com/watch?v=ytIOdhSzddY
                    </a>
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    What is heat stress?
                  </Typography>
                  <p>
                    Heat stress is a measure of the amount of time above the 20
                    year historical maximum temperature. The unit of measure for
                    heat stress is degree heating weeks. Many marine
                    environments, like coral sites, degrade after prolonged heat
                    exposure which is why this is an important metric.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How do I upload surveys?
                  </Typography>
                  <p>
                    Scroll to the bottom of your dashboard for your site and
                    click on &quot;ADD NEW SURVEY&quot;. Follow the steps and
                    add comments and pictures to your survey session.
                    <br />
                    <br />
                    Watch this video on how to upload surveys and best
                    practices.&nbsp;
                    <a
                      href="https://youtu.be/ov64mc2Da_k"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://youtu.be/ov64mc2Da_k
                    </a>
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    What happens if I upload the same file?
                  </Typography>
                  <p>
                    The upload process will update any row that has changed and
                    will also include any new rows inserted.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How can I best conduct surveys using Aqualink?
                  </Typography>
                  <p>
                    Aqualink allows you to conduct surveys in many different
                    ways depending on what your goal is with your monitoring
                    efforts. First, choose your survey site. Then select survey
                    points, which are multiple points within your survey site.
                    Depending on your methods, this can look different. Examples
                    of survey methods that work well in Aqualink are photo
                    quadrant in a transect, quadrant intercept in a transect,
                    point intersect (with quadrant or transect), or simply using
                    known locations within your survey site that you can
                    continuously monitor. For transects, each quadrant or point
                    will be a survey point. The entire transect will be the
                    survey site.
                    <br />
                    <br />
                    Add comments to the survey and each survey point. The
                    comments can include all the observations and data that you
                    have from that survey session. Write the details of the
                    corals that appeared based on your goals with your
                    monitoring efforts. For example, you can display if the
                    corals were healthy, bleached, or what percent of coral
                    cover they had. You can also add information such as Crown
                    of Thorns Starfish culled.
                    <br />
                    <br />
                    If your survey method is taking pictures of corals in known
                    locations, for example, we recommend that you take the image
                    from the exact same angles and distance. This provides the
                    best comparison between survey sessions. One good example of
                    this is:&nbsp;
                    <a
                      href="https://aqualink.org/sites/2943/points/558"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://aqualink.org/sites/2943/points/558
                    </a>
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How are the surveys structured?
                  </Typography>
                  <p>
                    The surveys will be lined up at the bottom of your dashboard
                    page in chronological order. Each survey includes all of the
                    survey points that you have added. When clicking on a survey
                    point, you&apos;ll see all the surveys conducted at that
                    survey point chronologically. This enables you to monitor a
                    single point in your reef over a longer period.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    What water quality data can I upload?
                  </Typography>
                  <p>
                    We allow HOBO data (HOBO data loggers), meteorological data,
                    and overall water quality data that can be gathered by any
                    sonde or method. For the overall water quality data, we have
                    two types of dashboard cards, and they are named Sonde data
                    and HUI data on Aqualink. Sonde data includes dissolved
                    oxygen concentration, chlorophyll concentration, acidity
                    (pH), salinity, and turbidity. You can use all of these five
                    parameters or just some of them when uploading data.
                    <br />
                    <br />
                    The HUI card includes turbidity, Nitrate Nitrite Nitrogen
                    (NNN), pH, and Salinity. This card will display watch,
                    warning, and alert levels once you have determined what
                    those levels are. Please let us know what the levels are,
                    and we&apos;ll help you display your data.
                    <br />
                    <br />
                    <a
                      href="https://drive.google.com/file/d/1FbogDt1ChmeMXjNWSZFK0EiUc88UEY28/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Video tutorial on how to upload Sonde data.
                    </a>
                    <br />
                    <br />
                    <a
                      href="https://drive.google.com/file/d/1IU0UUY0mRaCXxwEQ-k6WTgPiCfHK3-Q8/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Video tutorial on how to upload HUI data.
                    </a>
                    <br />
                    <br />
                    Please view&nbsp;
                    <a
                      href="https://docs.google.com/document/d/14MfB5iDZqzArZ-MAWuzWnnNs0XsRYK3bchotL-hRMUs/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      this document
                    </a>{' '}
                    to see all the parameters and values that we currently
                    allow. Note that you can upload a few extra parameters that
                    won&apos;t be shown on the dashboard card, but these will be
                    included when you download the CSV file of your site&apos;s
                    combined dashboard data.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    Can I follow a template for uploading water-quality data?
                  </Typography>
                  <p>
                    Please follow the templates below depending on what data you
                    want to upload.
                    <br />
                    <br />
                    <a
                      href="https://drive.google.com/file/d/1Gh0Ld8Kna_XP88Fpm-gJjxVsXixgNFLE/view?usp=share_link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      HOBO data
                    </a>
                    ,&nbsp;
                    <a
                      href="https://drive.google.com/file/d/1GA0xnbjB52bISo7iUJh84MQePcQ6M0nX/view?usp=share_link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      meteorological data
                    </a>
                    ,&nbsp;
                    <a
                      href="https://docs.google.com/spreadsheets/d/1C1oqhLKE-6vhx5n6XGV2O8JtDs7ZVEdl/edit?usp=share_link&ouid=101543162312822485121&rtpof=true&sd=true"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Sonde data
                    </a>
                    ,&nbsp;
                    <a
                      href="https://drive.google.com/file/d/1nKos1AcZofr7kEJ5cNllkeonH0bWN9h-/view?usp=share_link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      HUI data
                    </a>
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How can I upload temperature data to Aqualink?
                  </Typography>
                  <p>
                    When uploading temperature data to Aqualink, please use the
                    &quot;HOBO data&quot; sensor type. If you are using a HOBO
                    temperature logger, you can upload the raw data file. If
                    you&apos;re using any other type of temperature logger, add
                    a column for time and date and another column for
                    temperature. Please use this&nbsp;
                    <a
                      href="https://docs.google.com/spreadsheets/d/17txhvReJynwC3V9TmQeUJ6dWGTk3jjgs/edit?usp=share_link&ouid=101543162312822485121&rtpof=true&sd=true"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      template
                    </a>
                    , and watch this&nbsp;
                    <a
                      href="https://youtu.be/6wiRd6UFhE4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      video tutorial
                    </a>
                    &nbsp;on how to upload temperature data.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How can I track a heatwave?
                  </Typography>
                  <ol>
                    <li>
                      <p>
                        Add multiple sites to your personal&nbsp;
                        <a
                          href="https://aqualink.org/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          dashboard.
                        </a>
                        &nbsp;You can add sites by clicking on the bookmark
                        symbol on each individual site.
                      </p>
                    </li>
                    <li>
                      <p>
                        Change the view on the&nbsp;
                        <a
                          href="https://aqualink.org/map"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          map
                        </a>
                        &nbsp;to heat stress. You can do this by clicking on the
                        &quot;layer&quot; symbol on the map and selecting
                        &quot;Heat Stress&quot;.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    I&apos;m collecting water quality data. How can I upload it
                    to my dashboard?
                  </Typography>
                  <p>
                    Go to your dashboard and click on &quot;UPLOAD DATA&quot; in
                    the top right corner. Select your survey point and sensor
                    type. If you have a .xls, .csv, or .xlsx file with your data
                    but aren&apos;t using any of the selected sensors, please
                    select Sonde data and continue to upload files.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    Where can a site be placed?
                  </Typography>
                  <p>
                    A site can be placed almost anywhere in the world as long as
                    it is placed in the ocean or sea. This is a requirement for
                    satellite data to work.
                  </p>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    How many sites can I have?
                  </Typography>
                  <p>You can have an unlimited amount of sites.</p>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <Typography className={classes.title} variant="h4">
                    Aqualink Smart Buoy FAQ
                  </Typography>
                </div>
              </div>
              <div className="row faqq">
                <div className="col">
                  <Typography className={classes.question} variant="h5">
                    Does Aqualink still give away Smart Buoys?
                  </Typography>
                  <p>
                    Aqualink is no longer giving away Smart Mooring buoys
                    worldwide. However, you can still create new Aqualink sites
                    and get dashboards just like before. If you&apos;re
                    interested in purchasing Smart Mooring Buoys, please
                    visit&nbsp;
                    <a
                      href="https://www.sofarocean.com/products/spotter#s-subsurface"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Sofar Ocean
                    </a>
                    . If you have a particularly threatened reef or interesting
                    project around coral reefs, please email us and we&apos;ll
                    try to help you as best as we can. If you have purchased
                    your own Sofar Smart Mooring buoy, feel free to connect it
                    to Aqualink. Read more about that on this page or contact us
                    at&nbsp;
                    <a
                      href="mailto:admin@aqualink.org"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      admin@aqualink.org
                    </a>
                    .
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <Typography className={classes.title} variant="h4">
                    If you have any questions or comments, feel free to
                    contact&nbsp;
                    <a
                      href="mailto:admin@aqualink.org?subject=Questions%20or%20Comments"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      admin@aqualink.org
                    </a>
                    .
                  </Typography>
                </div>
              </div>
            </div>
          </div>
          {/* bloc-11 END */}
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
    question: {
      marginTop: '1rem',
      marginBottom: '1rem',
      fontWeight: 'bold',
    },
    root: {
      top: 10,
      height: '100%',
    },
    map: {
      height: '100%',
    },
    siteTable: {
      height: 'calc(100vh - 64px)',
      overflowY: 'auto',
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

type FaqProps = WithStyles<typeof styles>;

export default withStyles(styles)(Faq);
