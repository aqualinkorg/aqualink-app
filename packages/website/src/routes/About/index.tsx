import React from "react";
import ReactPlayer from "react-player";
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
} from "@material-ui/core";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";

import peter from "../../assets/img/peter.jpg";
import lyndon from "../../assets/img/LYNDON1.jpg";
import drew from "../../assets/img/drew.jpg";

const About = ({ classes }: AboutProps) => {
  return (
    <>
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
                      application in our press release:{" "}
                      <a href="https://medium.com/aqualink/introducing-aqualink-dd1023393b8">
                        Introducing Aqualink
                      </a>
                      <br />
                      <br />
                      We have also created an animated field guide to give an
                      overview to the system and outline the best practices for
                      taking a survey and using the Aqualink system.
                    </p>
                  </div>
                  <div className="offset-lg-0 col-lg-12 order-lg-1">
                    <ReactPlayer
                      url="https://www.youtube.com/embed/E_nXCl612lg"
                      width="100%"
                      title="field_guide"
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
                          src={lyndon}
                          className="rounded-circle mx-auto d-block mt-5 img-placeholder-us-style lazyload"
                          width={100}
                          alt="placeholder user"
                        />
                        <h5 className="text-center mg-sm">Lyndon Rive</h5>
                        <p className="text-lg-center">
                          Also a co-founder of SolarCity, current National
                          Geographic board member, and member of the USA
                          underwater hockey team.
                          <br />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 mt-3 mt-md-0">
                    <div className="card border-0">
                      <div className="card-body team-card">
                        <img
                          src={drew}
                          className="rounded-circle mx-auto d-block mt-5 img-3-style lazyload"
                          width={100}
                          alt="placeholder user"
                        />
                        <h5 className="text-center mg-sm">
                          <a href="https://www.linkedin.com/in/drewjgray/">
                            Drew Gray
                          </a>
                        </h5>
                        <p className="text-lg-center">
                          Computer-vision/AI software engineer, PhD in robotics,
                          and experience building autonomous systems at Tesla,
                          Cruise, and Uber.
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
      marginTop: "1rem",
      marginBottom: "1rem",
    },
  });

type AboutProps = WithStyles<typeof styles>;

export default withStyles(styles)(About);
