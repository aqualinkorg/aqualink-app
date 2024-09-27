/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
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
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';

import { getSiteNameAndRegion } from 'store/Sites/helpers';
import {
  userInfoSelector,
  getSelf,
  userLoadingSelector,
} from 'store/User/userSlice';
import {
  siteDetailsSelector,
  siteLoadingSelector,
  siteRequest,
} from 'store/Sites/selectedSiteSlice';
import { SiteApplication, SiteApplyParams } from 'store/Sites/types';
import { isAdmin } from 'helpers/user';
import SignInDialog from 'common/SignInDialog';
import RegisterDialog from 'common/RegisterDialog';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import siteServices from 'services/siteServices';
import { AgreementsChecked } from './types';
import Obligations from './Obligations';
import Agreements from './Agreements';
import Form from './Form';

const Apply = ({ classes }: ApplyProps) => {
  const dispatch = useDispatch();
  const site = useSelector(siteDetailsSelector);
  const siteLoading = useSelector(siteLoadingSelector);
  const userLoading = useSelector(userLoadingSelector);
  const params = useParams<{ id: string }>();
  const siteId = parseInt(params.id ?? '', 10);
  const user = useSelector(userInfoSelector);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [agreementsChecked, setAgreementsChecked] = useState<AgreementsChecked>(
    {
      shipping: false,
      buoy: false,
      survey: false,
    },
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [siteApplication, setSiteApplication] = useState<SiteApplication>();
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    dispatch(siteRequest(`${siteId}`));
  }, [dispatch, siteId]);

  useEffect(() => {
    if (!user) {
      setMessage('You need to sign up to access this page');
      setUnauthorized(false);
      return;
    }
    if (!isAdmin(user, siteId)) {
      setMessage(
        'You are not authorized to access this page. If this is an error, contact',
      );
      setUnauthorized(true);
    }
  }, [siteId, user]);

  useEffect(() => {
    if (user?.token && isAdmin(user, siteId)) {
      setLoading(true);
      siteServices
        .getSiteApplication(siteId, user.token)
        .then(({ data }) => {
          setSiteApplication(data);
          setMessage(null);
        })
        .catch(({ response }: AxiosError) => {
          if (response?.status === 403) {
            setMessage(
              'You are not authorized to access this page. If this is an error, contact',
            );
            setUnauthorized(true);
          } else {
            setMessage('There was an error getting the application');
            setUnauthorized(false);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user, siteId]);

  const handleRegisterDialog = (open: boolean) => setRegisterDialogOpen(open);
  const handleSignInDialog = (open: boolean) => setSignInDialogOpen(open);

  const updateAgreement = useCallback(
    (label: keyof AgreementsChecked) => {
      setAgreementsChecked({
        ...agreementsChecked,
        [label]: !agreementsChecked[label],
      });
    },
    [agreementsChecked],
  );

  const agreed = (): boolean => {
    const checkedArray = Object.values(agreementsChecked);
    return checkedArray.every((item) => item);
  };

  const handleFormSubmit = useCallback(
    (siteName: string, data: SiteApplyParams) => {
      if (user?.token && isAdmin(user, siteId) && site && siteApplication) {
        setLoading(true);
        siteServices
          .applySite(siteId, siteApplication.appId, data, user.token)
          // eslint-disable-next-line consistent-return
          .then(() => {
            if (!site?.name && user?.token) {
              return siteServices.updateSite(
                siteId,
                { name: siteName },
                user.token,
              );
            }
          })
          .then(() => setMessage('Thank you for applying'))
          .catch(() => setMessage('Something went wrong'))
          .finally(() => setLoading(false));
      }
    },
    [user, site, siteApplication, siteId],
  );

  const { name } = (site && getSiteNameAndRegion(site)) || {};
  const siteName = name || 'Edit Site Name on Site Details Page.';

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
      {loading || siteLoading || userLoading ? (
        <Container className={classes.thankYouMessage}>
          <Grid
            className={classes.thankYouMessage}
            container
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size="4rem" thickness={2} />
          </Grid>
        </Container>
      ) : message ? (
        <Container className={classes.thankYouMessage}>
          <Grid
            className={classes.thankYouMessage}
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
          >
            <Grid item>
              <Typography
                className={classes.coloredMessage}
                gutterBottom
                variant="h3"
              >
                {message}{' '}
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
              {site &&
                (user ? (
                  <Link to={`/sites/${siteId}`} className={classes.link}>
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
      ) : siteName && siteApplication ? (
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
            <Grid container justifyContent="space-between">
              <Grid item xs={11} md={6}>
                <Obligations />
                <Agreements
                  agreementsChecked={agreementsChecked}
                  handleChange={updateAgreement}
                />
              </Grid>
              <Grid item xs={11} md={5}>
                <Form
                  siteName={siteName}
                  application={siteApplication}
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
      marginTop: '3rem',
      marginBottom: '5rem',
    },
    thankYouMessage: {
      height: '100%',
    },
    coloredMessage: {
      color: theme.palette.primary.main,
      textAlign: 'center',
    },
    mail: {
      marginLeft: '0.2rem',
    },
    link: {
      color: 'inherit',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'none',
      },
    },
  });

type ApplyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Apply);
