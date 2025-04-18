import {
  Box,
  Link,
  Paper,
  Theme,
  Typography,
  Skeleton,
  Button,
} from '@mui/material';
import { createStyles, WithStyles } from '@mui/styles';
import { OpenInNew } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';

import React from 'react';
import { useSelector } from 'react-redux';
import cls from 'classnames';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import ObservationBox from 'routes/Surveys/View/ObservationBox';
import { displayTimeInLocalTimezone } from 'helpers/dates';
import reefCheckLogo from '../../../assets/img/reef-check.png';

const REQUEST_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSc6VTTr9Z20exlrf_l9kr_br03kfPOFksUsGXv-mJVRucg8TQ/viewform';

export const ReefCheckSurveySummaryComponent = ({
  classes,
}: ReefCheckSurveySummaryProps) => {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);

  if (error) {
    return null;
  }
  return (
    <Paper className={classes.paper}>
      <Box className={cls(classes.surveySource, classes.columnSpaceBetween)}>
        <Typography>Reef check Survey Data</Typography>
        <Typography>
          {loading ? (
            <Skeleton
              variant="text"
              width="100%"
              height={20}
              className={classes.skeleton}
            />
          ) : (
            formatReefCheckSurveyDate(survey?.date ?? '')
          )}
        </Typography>
        <img src={reefCheckLogo} width={180} alt="Reef Check Logo" />
      </Box>
      <Box className={classes.columnCenter} flexShrink={0}>
        <Typography variant="h4">
          {loading ? (
            <Skeleton
              variant="text"
              width={200}
              height={40}
              className={classes.skeleton}
            />
          ) : (
            survey?.reefCheckSite?.reefName
          )}
        </Typography>
        <Typography>
          {loading ? (
            <Skeleton
              variant="text"
              width={140}
              height={20}
              className={classes.skeleton}
            />
          ) : (
            survey?.reefCheckSite?.region
          )}
        </Typography>
        <Button
          component={Link}
          variant="outlined"
          color="primary"
          disabled={!!loading}
          href={REQUEST_FORM_URL}
          target="_blank"
          endIcon={<OpenInNew />}
          style={{ alignSelf: 'flex-end', marginTop: 'auto' }}
        >
          REQUEST TO DOWNLOAD DATA
        </Button>
      </Box>
      <Box className={cls(classes.note, classes.columnSpaceBetween)}>
        <Typography>
          Data is collected along four 5-meter-wide by 20-meter-long segments of
          a 100-meter transect line for a total survey area of 400m². Each
          segment has an area of 100m² and is labelled as s1, s2, s3, or s4.
        </Typography>
        <Link
          href="https://www.reefcheck.org/tropical-program/tropical-monitoring-instruction/"
          target="_blank"
          rel="noreferrer"
        >
          Learn more about the data and how it’s collected
        </Link>
      </Box>
      {survey?.satelliteTemperature && (
        <Box className={classes.columnSpaceBetween}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={150}
              className={classes.skeleton}
            />
          ) : (
            <ObservationBox
              depth={survey?.depth ?? null}
              satelliteTemperature={survey?.satelliteTemperature ?? undefined}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export const formatReefCheckSurveyDate = (
  dateStr: string,
  format?: string,
): string => {
  const formatted = displayTimeInLocalTimezone({
    isoDate: dateStr,
    format: format ?? 'MM/dd/yyyy, hh:mm a',
    displayTimezone: false,
    // This is a workaround to display the date in the local timezone of the reef
    // TODO: Remove this once we have fixed the import of the ReefCheckSurvey
    timeZone: 'UTC',
  });
  return formatted ?? '';
};

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: 12,
      color: theme.palette.text.secondary,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32,
    },
    skeleton: {
      backgroundColor: '#E2E2E2',
    },
    surveySource: {
      padding: 12,
      borderRadius: 8,
      border: '1px solid #E0E0E0',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    note: {
      flex: '1 1 300px',
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#F5F6F6',
    },
    columnSpaceBetween: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    columnCenter: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  });

type ReefCheckSurveySummaryProps = WithStyles<typeof styles>;

export const ReefCheckSurveySummary = withStyles(styles)(
  ReefCheckSurveySummaryComponent,
);
