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
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect } from "react-router-dom";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import Obligations from "./Obligations";
import Agreements from "./Agreements";
import Form from "./Form";
import { userInfoSelector, getSelf } from "../../store/User/userSlice";
import { reefDetailsSelector } from "../../store/Reefs/selectedReefSlice";
import { AgreementsChecked } from "./types";
import { ReefApplication, ReefApplyParams } from "../../store/Reefs/types";
import reefServices from "../../services/reefServices";

const Apply = ({ classes }: ApplyProps) => {
  const dispatch = useDispatch();
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
          if (data.length > 0) {
            setReefApplication(data[0]);
          } else {
            setMessage("No application found");
          }
        })
        .catch(() => setMessage("There was an error getting the application"))
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
    (siteName: string, data: ReefApplyParams) => {
      if (user?.token && reef && reefApplication) {
        setLoading(true);
        reefServices
          .applyReef(reef.id, reefApplication.appId, data, user.token)
          // eslint-disable-next-line consistent-return
          .then(() => {
            if (!reef?.name && user?.token) {
              return reefServices.updateReef(
                reef.id,
                { name: siteName },
                user.token
              );
            }
          })
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
        <Container fixed className={classes.thankYouMessage}>
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
                  <Button
                    onClick={() => {
                      if (user?.token) {
                        dispatch(getSelf(user.token));
                      }
                    }}
                    color="primary"
                    variant="contained"
                  >
                    Back to reef
                  </Button>
                </Link>
              )}
            </Grid>
          </Grid>
        </Container>
      ) : reefApplication ? (
        <>
          <Container fixed className={classes.welcomeMessage}>
            <Grid container>
              <Grid item xs={12} md={7}>
                <Typography variant="h3" gutterBottom>
                  Apply for a Smart Buoy
                </Typography>
                <Typography>
                  Please take a moment to fill out this form for each site you
                  like to manage with an Aqualink Smart Buoy. If you have any
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
              <Grid item xs={11} md={5}>
                <Form
                  reefName={reef?.name}
                  application={reefApplication}
                  agreed={agreed()}
                  handleFormSubmit={handleFormSubmit}
                />
              </Grid>
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
