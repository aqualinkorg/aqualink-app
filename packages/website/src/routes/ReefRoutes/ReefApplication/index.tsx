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
import { Link, RouteComponentProps } from "react-router-dom";

import { AgreementsChecked } from "./types";
import Obligations from "./Obligations";
import Agreements from "./Agreements";
import SignInDialog from "../../../common/SignInDialog";
import RegisterDialog from "../../../common/RegisterDialog";
import Form from "./Form";
import NavBar from "../../../common/NavBar";
import Footer from "../../../common/Footer";
import { getReefNameAndRegion } from "../../../store/Reefs/helpers";
import reefServices from "../../../services/reefServices";
import {
  userInfoSelector,
  getSelf,
  userLoadingSelector,
} from "../../../store/User/userSlice";
import {
  reefDetailsSelector,
  reefLoadingSelector,
  reefRequest,
} from "../../../store/Reefs/selectedReefSlice";
import { ReefApplication, ReefApplyParams } from "../../../store/Reefs/types";
import { isAdmin } from "../../../helpers/user";

const Apply = ({ match, classes }: ApplyProps) => {
  const dispatch = useDispatch();
  const reef = useSelector(reefDetailsSelector);
  const reefLoading = useSelector(reefLoadingSelector);
  const userLoading = useSelector(userLoadingSelector);
  const reefId = parseInt(match.params.id, 10);
  const user = useSelector(userInfoSelector);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
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
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    dispatch(reefRequest(`${reefId}`));
  }, [dispatch, reefId]);

  useEffect(() => {
    if (!user) {
      setMessage("You need to sign up to access this page");
      setUnauthorized(false);
      return;
    }
    if (!isAdmin(user, reefId)) {
      setMessage(
        "You are not authorized to access this page. If this is an error, contact"
      );
      setUnauthorized(true);
    }
  }, [reefId, user]);

  useEffect(() => {
    if (user?.token && isAdmin(user, reefId)) {
      setLoading(true);
      reefServices
        .getReefApplication(reefId, user.token)
        .then(({ data }) => {
          if (data.length > 0) {
            setReefApplication(data[0]);
            setMessage(null);
          } else {
            setMessage("No application found");
          }
        })
        .catch(() => setMessage("There was an error getting the application"))
        .finally(() => setLoading(false));
    }
  }, [user, reefId]);

  const handleRegisterDialog = (open: boolean) => setRegisterDialogOpen(open);
  const handleSignInDialog = (open: boolean) => setSignInDialogOpen(open);

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
      if (user?.token && isAdmin(user, reefId) && reef && reefApplication) {
        setLoading(true);
        reefServices
          .applyReef(reefId, reefApplication.appId, data, user.token)
          // eslint-disable-next-line consistent-return
          .then(() => {
            if (!reef?.name && user?.token) {
              return reefServices.updateReef(
                reefId,
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
    [user, reef, reefApplication, reefId]
  );

  const { name } = (reef && getReefNameAndRegion(reef)) || {};
  const reefName = name || "Edit Site Name on Site Details Page.";

  return (
    <>
      <RegisterDialog
        open={registerDialogOpen}
        handleRegisterOpen={handleRegisterDialog}
        handleSignInOpen={handleSignInDialog}
      />
      <SignInDialog
        open={signInDialogOpen}
        handleRegisterOpen={handleRegisterDialog}
        handleSignInOpen={handleSignInDialog}
      />
      <NavBar searchLocation={false} />
      {loading || reefLoading || userLoading ? (
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
                variant="h3"
              >
                {message}{" "}
                {unauthorized && (
                  <a
                    className={`${classes.mail} ${classes.link}`}
                    href="mailto:info@aqualink.org"
                  >
                    info@aqualink.org
                  </a>
                )}
              </Typography>
            </Grid>
            <Grid item>
              {reef &&
                (user ? (
                  <Link to={`/reefs/${reefId}`} className={classes.link}>
                    <Button
                      onClick={() => {
                        if (user?.token) {
                          dispatch(getSelf(user.token));
                        }
                      }}
                      color="primary"
                      variant="contained"
                    >
                      Back to site
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => handleRegisterDialog(true)}
                    color="primary"
                    variant="contained"
                  >
                    Sign Up
                  </Button>
                ))}
            </Grid>
          </Grid>
        </Container>
      ) : reefName && reefApplication ? (
        <>
          <Container className={classes.welcomeMessage}>
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
                  reefName={reefName}
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
      textAlign: "center",
    },
    mail: {
      marginLeft: "0.2rem",
    },
    link: {
      color: "inherit",
      textDecoration: "none",
      "&:hover": {
        textDecoration: "none",
      },
    },
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ApplyProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Apply);
