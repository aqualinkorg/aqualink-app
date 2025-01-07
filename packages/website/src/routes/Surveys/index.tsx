import { useEffect } from 'react';
import { LinearProgress, Grid, Typography, Container } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

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

const Surveys = ({ classes }: SurveysProps) => {
  const params = useParams<{ id: string; sid?: string }>();
  const siteDetails = useSelector(siteDetailsSelector);
  const loading = useSelector(siteLoadingSelector);
  const error = useSelector(siteErrorSelector);
  const dispatch = useDispatch();
  const siteId = params.id ?? '';
  const surveyId = params.sid;

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

type SurveysProps = SurveysIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Surveys);
