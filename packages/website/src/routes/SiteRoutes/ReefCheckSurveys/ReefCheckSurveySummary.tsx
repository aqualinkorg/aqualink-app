import {
  Box,
  Button,
  createStyles,
  Link,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { useSelector } from 'react-redux';
import cls from 'classnames';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import ObservationBox from 'routes/Surveys/View/ObservationBox';
import reefCheckLogo from '../../../assets/img/reef-check.png';

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
            formatDate(survey?.date ?? '')
          )}
        </Typography>
        <img src={reefCheckLogo} width={180} alt="Reef Check" />
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
        >
          Learn more about the data and how it’s collected
        </Link>
      </Box>
      <Box className={cls(classes.observationBox, classes.columnSpaceBetween)}>
        {loading ? (
          <Skeleton
            variant="rect"
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
        <Button variant="outlined" color="primary" disabled={!!loading}>
          REQUEST TO DOWNLOAD REEF CHECK DATA
        </Button>
      </Box>
    </Paper>
  );
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: 12,
      color: theme.palette.text.secondary,
      display: 'flex',
      gap: 32,
    },
    skeleton: {
      backgroundColor: '#E2E2E2',
    },
    surveySource: {
      padding: 12,
      borderRadius: 8,
      border: '1px solid #E0E0E0',
    },
    note: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#F5F6F6',
    },
    observationBox: {
      gap: 32,
      flexShrink: 0,
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
