import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import NavBar from "../../common/NavBar";

import reemimage from "../../assets/img/reemimage.jpg";

const Apply = ({ classes }: ApplyProps) => {
  return (
    <>
      <NavBar />

      <div>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <link rel="shortcut icon" type="image/png" href="../favicon.png" />
        <link
          rel="stylesheet"
          type="text/css"
          href="../css/bootstrap.css?8692"
        />
        <link rel="stylesheet" type="text/css" href="../style.css?1685" />
        <link rel="stylesheet" type="text/css" href="../css/custom.css?9549" />
        <link rel="stylesheet" type="text/css" href="../css/leaflet.css?3998" />
        <link
          rel="stylesheet"
          type="text/css"
          href="../css/font-awesome.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:400,400i,500,500i,600,600i,700,700i,800,800i,900,900i&display=swap&subset=latin,latin-ext"
          rel="stylesheet"
          type="text/css"
        />
        <title>Apply</title>
        {/* Main container */}
        <div className="page-container">
          {/* bloc-3 */}
          <div className="bloc l-bloc" id="bloc-3">
            <div className="container bloc-md">
              <div className="row no-gutters">
                <div className="lcolpad col-lg-6">
                  <h4 className="mg-md">Manage your local reef</h4>
                  <p className="mg-lg">
                    We will be starting with our deployments in August and would
                    love to have you apply to get free access to our system.
                    We'll have more information coming shortly. Submitting the
                    application form doesn't obligate you, if you have questions
                    please first take a look at our&nbsp;
                    <a className="ltc-blue-green" href="../faq/">
                      FAQ&nbsp;
                    </a>
                    &nbsp;page and if you don't get the answer you're looking
                    for then email&nbsp;
                    <a
                      className="ltc-blue-green"
                      href="mailto:info@aqualink.org"
                    >
                      info@aqualink.org
                    </a>
                    .<br />
                  </p>
                  <img
                    src={reemimage}
                    className="img-fluid mx-auto d-block lazyload"
                    alt="reemimage"
                  />
                </div>
                <div className="offset-lg-1 col-lg-5">
                  <div className="detailsbox">
                    <h5 className="mg-md">Your Obligations</h5>
                    <p>
                      You will be given a free smart buoy but there are some
                      things you will be expected to do or provide:
                    </p>
                    <ol>
                      <li>
                        <p>
                          Pay for shipping and any applicable duties
                          <br />
                        </p>
                      </li>
                      <li>
                        <p>
                          Obtain any necessary permits (if applicable)
                          <br />
                        </p>
                      </li>
                      <li>
                        <p>
                          Provide and attach a ballast (e.g. 60lb kettlebell){" "}
                          <br />
                        </p>
                      </li>
                      <li>
                        <p>
                          Deploy spotter with mooring weight (can be done from a
                          kayak)
                          <br />
                        </p>
                      </li>
                      <li>
                        <p>
                          Maintain spotter (inspect and clean every 6 months)
                          <br />
                        </p>
                      </li>
                      <li>
                        <p>
                          Conduct initial and periodic photographic surveys and
                          upload imagery to our website <br />
                        </p>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* bloc-3 END */}
          {/* bloc-3 */}
          <div
            className="bloc bgc-white-smoke l-bloc none applyblock "
            id="bloc-3"
          >
            <div className="container bloc-xl">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <div className="row no-gutters">
                      <div className="col-lg-9">
                        <input
                          id="search-input"
                          className="form-control field-style"
                        />
                      </div>
                      <div className="offset-lg-1 col-lg-2">
                        <a
                          id="search"
                          className="btn btn-d btn-sq btn-lg searchbttn btn-outline-primary"
                        >
                          Search
                          <br />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="map">
                    <div
                      id="be-mapid"
                      className="osm-map"
                      data-iconsrc="../img/lazyload-ph.png"
                      data-src
                      data-positionlat={49}
                      data-positionlng={6}
                      data-icontext="Some info"
                      data-height="350px"
                      data-enableinfobox={1}
                      data-setownicon={0}
                      data-zoom={13}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-5 offset-lg-1 formcard">
                  <form
                    data-clean-url-used="true"
                    id="form_1"
                    data-form-type="blocs-form"
                    noValidate
                    data-success-msg="Your application has been submitted."
                    data-fail-msg="Sorry it seems that our server is not responding."
                  >
                    <h4 className="mg-md">Application Form</h4>
                    <div className="form-group">
                      <label>Name</label>
                      <input id="name" className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label>Organization</label>
                      <input id="org" className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        id="email"
                        className="form-control"
                        type="email"
                        data-error-validation-msg="Not a valid email address"
                        required
                      />
                    </div>
                    <div className="clm">
                      <label className="label-style">
                        Location: Select point on map
                      </label>
                      <div className="form-group shortform">
                        <label>Latitude</label>
                        <input id="lat" className="form-control" />
                      </div>
                      <div className="form-group shortform">
                        <label>Longitude</label>
                        <input id="lng" className="form-control" />
                      </div>
                      <div className="form-group shortform">
                        <label>Depth (m)</label>
                        <input id="depth" className="form-control" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label-style">Agree to:</label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="shipping"
                          data-validation-minchecked-message="You must agree to this before we can take your information."
                          data-validation-minchecked-minchecked={1}
                          name="optin"
                        />
                        <label className="form-check-label">
                          Handle any shipping and permitting charges
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="mooring"
                          data-validation-minchecked-message="You must agree to this before we can take your information."
                          data-validation-minchecked-minchecked={1}
                          name="optin"
                        />
                        <label className="form-check-label">
                          Provide mooring and deploy buoy
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="survey"
                          data-validation-minchecked-message="You must agree to this before we can take your information."
                          data-validation-minchecked-minchecked={1}
                          name="optin"
                        />
                        <label className="form-check-label">
                          Conduct initial survey
                        </label>
                      </div>
                      <button
                        id="submit"
                        className="bloc-button btn-d btn-lg cta"
                        type="submit"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
    map: {
      height: "100%",
    },
    reefTable: {
      height: "calc(100vh - 64px)",
      overflowY: "auto",
    },
  });

type ApplyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Apply);
