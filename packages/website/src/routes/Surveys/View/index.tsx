import { useEffect } from 'react';
import * as React from 'react';
import Link from 'next/link';
import ArrowBack from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Theme,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  surveyDetailsSelector,
  surveyGetRequest,
  clearSurvey,
  surveyLoadingSelector,
  surveyErrorSelector,
  surveyMediaEditLoadingSelector,
} from 'store/Survey/surveySlice';
import type { Site } from 'store/Sites/types';
import {
  surveyListLoadingSelector,
  surveyListSelector,
  surveysRequest,
} from 'store/Survey/surveyListSlice';
import { siteTimeSeriesDataRequest } from 'store/Sites/selectedSiteSlice';
import {
  displayTimeInLocalTimezone,
  convertSurveyDataToLocalTime,
  isBetween,
} from 'helpers/dates';
import { getSurveyPointsByName } from 'helpers/surveyMedia';
import ChartWithTooltip from 'common/Chart/ChartWithTooltip';
import { standardDailyDataDataset } from 'common/Chart/MultipleSensorsCharts/helpers';
import { DateTime } from 'luxon-extensions';
import SurveyDetails from './SurveyDetails';
import SurveyMediaDetails from './MediaDetails';

const SurveyViewPage = ({ site, surveyId, classes }: SurveyViewPageProps) => {
  const dispatch = useDispatch();
  const prevMediaLoading = React.useRef<boolean>();
  const { enqueueSnackbar } = useSnackbar();
  const surveyList = useSelector(surveyListSelector);
  const surveyDetails = useSelector(surveyDetailsSelector);
  const surveyLoading = useSelector(surveyLoadingSelector);
  const surveyListLoading = useSelector(surveyListLoadingSelector);
  const surveyError = useSelector(surveyErrorSelector);
  const mediaLoading = useSelector(surveyMediaEditLoadingSelector);
  const loading = surveyLoading || surveyListLoading;

  const pointId = surveyDetails?.surveyMedia?.find((item) => item.featured)
    ?.surveyPoint?.id;

  const dailyDataLen = site.dailyData.length;
  const showChart =
    dailyDataLen > 0 && surveyList.length > 0 && surveyDetails?.diveDate
      ? isBetween(
          surveyDetails.diveDate,
          site.dailyData[dailyDataLen - 1].date,
          site.dailyData[0].date,
        )
      : false;
  const chartDataset = standardDailyDataDataset(
    site.dailyData,
    site.maxMonthlyMean,
    true,
    site.timezone,
  );

  useEffect(() => {
    dispatch(surveysRequest(`${site.id}`));
    window.scrollTo({ top: 0 });
  }, [dispatch, site.id]);

  useEffect(() => {
    dispatch(
      surveyGetRequest({
        siteId: `${site.id}`,
        surveyId,
      }),
    );
    return () => {
      dispatch(clearSurvey());
    };
  }, [dispatch, site.id, surveyId]);

  // Fetch HOBO and Spotter data near the dive date
  useEffect(() => {
    if (surveyDetails?.diveDate) {
      const start = DateTime.fromISO(surveyDetails.diveDate)
        .startOf('day')
        .toISOString();
      const end = DateTime.fromISO(surveyDetails.diveDate)
        .endOf('day')
        .toISOString();
      dispatch(
        siteTimeSeriesDataRequest({
          siteId: `${site.id}`,
          pointId: pointId ? `${pointId}` : undefined,
          start,
          end,
          metrics: ['bottom_temperature', 'top_temperature'],
          hourly: false,
        }),
      );
    }
  }, [dispatch, pointId, site.id, surveyDetails]);

  React.useEffect(() => {
    if (!mediaLoading) {
      if (!surveyError && prevMediaLoading.current) {
        enqueueSnackbar('Survey media details updated successfully', {
          variant: 'success',
        });
      }
      if (surveyError) {
        enqueueSnackbar(surveyError, {
          variant: 'error',
        });
      }
    }
    if (prevMediaLoading.current !== mediaLoading) {
      prevMediaLoading.current = mediaLoading;
    }
  }, [enqueueSnackbar, mediaLoading, surveyError]);

  if (loading) {
    return <LinearProgress className={classes.loading} />;
  }

  return (
    <>
      <Box bgcolor="#f5f6f6">
        <Container className={classes.infoWrapper}>
          <Button
            className={classes.backButton}
            color="primary"
            startIcon={<ArrowBack />}
            component={Link}
            href={`/sites/${site.id}`}
          >
            <Typography style={{ textTransform: 'none' }}>
              Back to site
            </Typography>
          </Button>
          <Paper elevation={3} className={classes.surveyDetailsCard}>
            <Grid container justifyContent="space-between" item xs={12}>
              <Grid container justifyContent="center" item md={12}>
                <Grid container item xs={12}>
                  <SurveyDetails site={site} survey={surveyDetails} />
                </Grid>
                {showChart && (
                  <Grid
                    className={classes.chartWrapper}
                    container
                    justifyContent="center"
                    item
                    xs={12}
                  >
                    <Grid item xs={12}>
                      <Box position="relative" mb="8px" left="3%">
                        <Typography
                          className={classes.chartTitle}
                          variant="h6"
                          color="textSecondary"
                        >
                          DAILY WATER TEMPERATURE (°C)
                        </Typography>
                      </Box>
                      <ChartWithTooltip
                        className={classes.chart}
                        siteId={site.id}
                        datasets={[chartDataset]}
                        maxMonthlyMean={site.maxMonthlyMean || null}
                        temperatureThreshold={
                          site.maxMonthlyMean ? site.maxMonthlyMean + 1 : null
                        }
                        surveys={convertSurveyDataToLocalTime(
                          surveyList,
                          site.timezone,
                        )}
                        background
                        timeZone={site.timezone}
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
      <Box>
        <Container className={classes.mediaWrapper}>
          <Grid container justifyContent="center" item xs={12}>
            <Grid container item xs={11}>
              <Grid item>
                <Typography className={classes.mediaTitle}>
                  {`${displayTimeInLocalTimezone({
                    isoDate: surveyDetails?.diveDate,
                    format: 'LL/dd/yyyy',
                    displayTimezone: false,
                    timeZone: site.timezone,
                  })} Survey Media`}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                {surveyDetails?.surveyMedia &&
                  getSurveyPointsByName(surveyDetails.surveyMedia).map(
                    (point) => (
                      <SurveyMediaDetails
                        siteId={site.id}
                        point={point}
                        key={point.pointId}
                      />
                    ),
                  )}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    loading: {
      marginBottom: '100vh',
    },
    infoWrapper: {
      marginTop: 64,
      marginBottom: 96,
    },
    mediaWrapper: {
      marginTop: 80,
    },
    backButton: {
      marginBottom: 16,
    },
    surveyDetailsCard: {
      padding: 32,
      color: theme.palette.text.secondary,
    },
    chartWrapper: {
      marginTop: 32,
    },
    chartTitle: {
      [theme.breakpoints.down('sm')]: {
        fontSize: 14,
      },
    },
    chart: {
      height: 250,
    },
    mediaTitle: {
      fontSize: 18,
      marginBottom: 80,
    },
  });

interface SurveyViewPageIncomingProps {
  site: Site;
  surveyId: string;
}

type SurveyViewPageProps = SurveyViewPageIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyViewPage);
