/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Typography,
  Container,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { Link, Redirect } from "react-router-dom";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import Obligations from "./Obligations";
import Agreements from "./Agreements";
import Form from "./Form";
import { userInfoSelector } from "../../store/User/userSlice";
import { reefDetailsSelector } from "../../store/Reefs/selectedReefSlice";
import { AgreementsChecked } from "./types";
import { ReefApplication, ReefApplyParams } from "../../store/Reefs/types";
import reefServices from "../../services/reefServices";

const Apply = ({ classes }: ApplyProps) => {
  const reef = useSelector(reefDetailsSelector);
  const user = useSelector(userInfoSelector);
  const [agreementsChecked, setAgreementsChecked] = useState<AgreementsChecked>(
    {
      shipping: false,
      buoy: false,
      survey: false,
    }
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reefApplication, setReefApplication] = useState<ReefApplication>();

  useEffect(() => {
    if (reef && user?.token) {
      setLoading(true);
      reefServices
        .getReefApplication(reef.id, user.token)
        .then(({ data }) => {
          setReefApplication(data[0]);
        })
        .finally(() => setLoading(false));
    }
  }, [user, reef]);

  const updateAgreement = useCallback(
    (label: keyof AgreementsChecked) => {
      setAgreementsChecked({
        ...agreementsChecked,
        [label]: !agreementsChecked[label],
      });
    },
    [agreementsChecked]
  );

  const agreed = (): boolean => {
    const checkedArray = Object.values(agreementsChecked);
    return checkedArray.every((item) => item);
  };

  const handleFormSubmit = useCallback(
    (data: ReefApplyParams) => {
      if (user?.token && reef && reefApplication) {
        setLoading(true);
        reefServices
          .applyReef(reef.id, reefApplication.appId, data, user.token)
          .then(() => setMessage("Thank you for applying"))
          .catch(() => setMessage("Something went wrong"))
          .finally(() => setLoading(false));
      }
    },
    [reef, user, reefApplication]
  );

  return (
    <>
      {(!reef || !user) && <Redirect to="/" />}
      <NavBar searchLocation={false} />
      {loading ? (
        <Container className={classes.thankYouMessage}>
          <Grid
            className={classes.thankYouMessage}
            container
            alignItems="center"
            justify="center"
          >
            <CircularProgress size="10rem" thickness={2} />
          </Grid>
        </Container>
      ) : message ? (
        <Container className={classes.thankYouMessage}>
          <Grid
            className={classes.thankYouMessage}
            container
            alignItems="center"
            justify="center"
            direction="column"
          >
            <Grid item>
              <Typography
                className={classes.coloredMessage}
                gutterBottom
                variant="h1"
              >
                {message}
              </Typography>
            </Grid>
            <Grid item>
              {reef && (
                <Link to={`reefs/${reef.id}`} className={classes.link}>
                  <Button color="primary" variant="contained">
                    Back to reef
                  </Button>
                </Link>
              )}
            </Grid>
          </Grid>
        </Container>
      ) : reefApplication ? (
        <>
          <Container className={classes.welcomeMessage}>
            <Grid container>
              <Grid item xs={12} md={7}>
                <Typography variant="h3" gutterBottom>
                  Apply for a spotter
                </Typography>
                <Typography>
                  Please take a moment to fill out this form for each site you
                  like to manage with an Aqualink spotter. If you have any
                  questions, don&apos;t hesitate to reach out to
                  <a className={classes.mail} href="mailto: info@aqualink.org">
                    info@aqualink.org
                  </a>
                </Typography>
              </Grid>
            </Grid>
          </Container>
          <Container>
            <Grid container justify="space-between">
              <Grid item xs={11} md={6}>
                <Obligations />
                <Agreements
                  agreementsChecked={agreementsChecked}
                  handleChange={updateAgreement}
                />
              </Grid>
              {reef?.name && (
                <Grid item xs={11} md={5}>
                  <Form
                    reefName={reef.name}
                    agreed={agreed()}
                    handleFormSubmit={handleFormSubmit}
                  />
                </Grid>
              )}
            </Grid>
          </Container>
        </>
      ) : null}
      <Footer />
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    welcomeMessage: {
      marginTop: "3rem",
      marginBottom: "5rem",
    },
    thankYouMessage: {
      height: "100%",
    },
    coloredMessage: {
      color: theme.palette.primary.main,
    },
    mail: {
      marginLeft: "0.2rem",
    },
    link: {
      textDecoration: "none",
      "&:hover": {
        textDecoration: "none",
      },
    },
  });

type ApplyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Apply);
