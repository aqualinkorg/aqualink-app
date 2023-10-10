import React, { useEffect } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
  Grid,
  Typography,
  Container,
} from '@material-ui/core';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  siteDetailsSelector,
  siteLoadingSelector,
  siteErrorSelector,
  siteRequest,
} from 'store/Sites/selectedSiteSlice';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import NewSurvey from './New';
import SurveyViewPage from './View';

const Surveys = ({ match, classes }: SurveysProps) => {
  const siteDetails = useSelector(siteDetailsSelector);
  const loading = useSelector(siteLoadingSelector);
  const error = useSelector(siteErrorSelector);
  const dispatch = useDispatch();
  const siteId = match.params.id;
  const surveyId = match.params.sid;

  useEffect(() => {
    if (!siteDetails || `${siteDetails.id}` !== siteId) {
      dispatch(siteRequest(siteId));
    }
  }, [dispatch, siteId, siteDetails]);

  if (loading) {
    return (
      <>
        <NavBar searchLocation={false} />
        <LinearProgress />
      </>
    );
  }

  return (
    <>
      <NavBar searchLocation />
      <>
        {/* eslint-disable-next-line no-nested-ternary */}
        {siteDetails && !error ? (
          surveyId ? (
            <SurveyViewPage site={siteDetails} surveyId={surveyId} />
          ) : (
            <NewSurvey site={siteDetails} />
          )
        ) : (
          <Container className={classes.noData}>
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <Typography gutterBottom color="primary" variant="h2">
                  No Data Found
                </Typography>
              </Grid>
            </Grid>
          </Container>
        )}
      </>
      <Footer />
    </>
  );
};

const styles = () =>
  createStyles({
    noData: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
    },
  });

interface SurveysIncomingProps {}

interface MatchProps
  extends RouteComponentProps<{ id: string; sid?: string }> {}

type SurveysProps = MatchProps &
  SurveysIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(Surveys);
