import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import NavBar from "../../common/NavBar";

import fullDiagramBuoy from "../../assets/img/fulldiag3_1.svg";
import fullDiagramInfra from "../../assets/img/fulldiag3.svg";
import reefdetailpage from "../../assets/img/reefdetailpage.jpg";

import "../../assets/css/bootstrap.css";
import "../../assets/css/font-awesome.min.css";
import "../../assets/css/leaflet.css";

const Buoy = ({ classes }: BuoyProps) => {
  return (
    <>
      <NavBar searchLocation />
      <div className="bloc l-bloc" id="bloc-6">
        <div className="container bloc-md">
          <div className="row align-items-center">
            <div className="lcolpad col-12 col">
              <h4 className="mg-md">Monitoring System</h4>
              <p className="text-lg-left">
                Current global ocean temperature monitoring systems are
                restricted to satellite-derived surface temperatures which only
                capture the skin temperature of the water. The temperatures at
                greater depths, where coral reefs can be found, are mostly
                unknown. Scientists will study those temperatures by installing
                local data loggers which have to be physically retrieved from
                the reef to have their data accessed. Once the loggers have been
                retrieved the findings will be published in a paper but it’s
                rare to get continuous real-time readings of those temperatures.
                The monitoring system we are deploying includes a solar-powered
                smart buoy that relays temperature information in real-time,
                giving us some of the needed data to detect potential coral
                bleaching events early and put response plans in place.
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
          <div className="row align-items-center">
            <div className="lcolpad col-12 col">
              <h4 className="mg-md">Web Application</h4>
              <p className="text-lg-left">
                An essential component of the monitoring system is the website
                where data and imagery can be accessed and uploaded. The website
                is designed as a tool to help you understand and manage heat
                stress on your local reef and make collaboration with other
                conservation scientists easier. A sample screen is below which
                shows all of the critical information for a particular reef.
                We’d love to get your feedback on this so please email&nbsp;
                <a href="mailto:info@aqualink.org">info@aqualink.org</a>
                &nbsp;and let us know what you think.
                <br />
              </p>
            </div>
            <div className="col-lg-12 offset-lg-0">
              <div className="row">
                <div className="order-1 col-12 col-lg-8">
                  <img
                    src={reefdetailpage}
                    className="img-fluid mg-lg mx-auto d-block img-responsive diagram lazyload"
                    alt="bouydiagram2"
                  />
                </div>
                <div className="col-lg-4 callouts">
                  <div className="row scroll-fx-left-in-fade">
                    <div className="col calloutboxes">
                      <h5 className="mg-clear">
                        <strong>1</strong>
                      </h5>
                      <p>
                        A quick video captured during a survey that provides a
                        broad overview of the reef.
                      </p>
                    </div>
                  </div>
                  <div className="row scroll-fx-left-in-fade">
                    <div className="col calloutboxes">
                      <h5 className="mg-clear">
                        <strong>2</strong>
                      </h5>
                      <p>
                        Real-time conditions and a summary of the past 7 days at
                        the surface and underwater temperature sensors. Degree
                        heating days is an important measure of prolonged heat
                        stress and is the primary way the application creates
                        alert levels for a reef.
                      </p>
                    </div>
                  </div>
                  <div className="row scroll-fx-left-in-fade">
                    <div className="col calloutboxes">
                      <h5 className="mg-clear">
                        <strong>3</strong>
                      </h5>
                      <p>
                        Historical information on temperatures, wind, and waves
                        are displayed and easily downloadable for a more
                        detailed analysis.
                      </p>
                    </div>
                  </div>
                  <div className="row scroll-fx-left-in-fade">
                    <div className="col calloutboxes">
                      <h5 className="mg-clear">
                        <strong>4</strong>
                      </h5>
                      <p>
                        Multiple points of interest on the reef can be
                        configured and the associated survey images give you the
                        ability to understand changes to the reef over time and
                        at different temperature profiles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row voffset-lg">
            <div className="col-lg-12">
              <h4 className="mg-md">System Architecture</h4>
              <p className="text-lg-left">
                The real-time temperature information is transmitted to our
                servers where a monitoring system combines that data with survey
                imagery to help understand the cause-and-effect of increasing
                temperatures on the local marine ecosystem. We are working with
                coral scientists to create easy-to-use instruction manuals for
                conducting reef surveys and implementing response plans, all of
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
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      top: 10,
      height: "100%",
    },
  });

type BuoyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Buoy);
