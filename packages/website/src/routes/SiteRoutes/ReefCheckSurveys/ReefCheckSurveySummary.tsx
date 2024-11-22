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
import React from 'react';
import { useSelector } from 'react-redux';
import cls from 'classnames';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { siteDetailsSelector } from 'store/Sites/selectedSiteSlice';
import ObservationBox from 'routes/Surveys/View/ObservationBox';
import reefCheckLogo from '../../../assets/img/reef-check.png';

export const ReefCheckSurveySummaryComponent = ({
  classes,
}: ReefCheckSurveySummaryProps) => {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);
  const siteDetails = useSelector(siteDetailsSelector);

  if (loading || error || !survey || !siteDetails) {
    return null;
  }

  return (
    <Paper className={classes.paper}>
      <Box className={cls(classes.surveySource, classes.columnSpaceBetween)}>
        <Typography>Reef check Survey Data</Typography>
        <Typography>{formatDate(survey.date)}</Typography>
        <img src={reefCheckLogo} width={180} alt="Reef Check" />
      </Box>
      <Box className={classes.columnCenter} flexShrink={0}>
        <Typography variant="h4">{survey.reefCheckSite?.reefName}</Typography>
        <Typography>{survey.reefCheckSite?.region}</Typography>
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
        <ObservationBox
          depth={survey.depth}
          satelliteTemperature={survey.satelliteTemperature ?? undefined}
        />
        <Button variant="outlined" color="primary">
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
