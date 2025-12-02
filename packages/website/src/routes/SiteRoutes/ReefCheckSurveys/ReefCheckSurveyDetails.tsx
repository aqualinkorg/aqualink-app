import React from 'react';
import { Box, Grid, Paper, Theme, Typography, Skeleton } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { createStyles, WithStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { ReefCheckSurvey } from 'store/ReefCheckSurveys/types';
import { formatReefCheckSurveyDate } from './ReefCheckSurveySummary';

type SurveyField<T extends keyof ReefCheckSurvey> = {
  field: T;
  label: string;
  formatter?: (v: ReefCheckSurvey[T]) => string;
};
type SurveyFields = { [K in keyof ReefCheckSurvey]: SurveyField<K> };

const surveyFields = [
  { field: 'depth', label: 'Survey Depth', formatter: (v) => `${v}m` },
  { field: 'timeOfDayWorkBegan', label: 'Time of Day Work Began' },
  { field: 'weather', label: 'Weather' },
  { field: 'airTemp', label: 'Air Temperature', formatter: (v) => `${v}°C` },
  {
    field: 'waterTempAtSurface',
    label: 'Water Temperature at Surface',
    formatter: (v) => `${v}°C`,
  },
  {
    field: 'waterTempAt3M',
    label: 'Water Temperature at 3M',
    formatter: (v) => `${v}°C`,
  },
  {
    field: 'waterTempAt10M',
    label: 'Water Temperature at 10M',
    formatter: (v) => `${v}°C`,
  },
  { field: 'overallAnthroImpact', label: 'Overall Anthropogenic Impact' },
  { field: 'siltation', label: 'Siltation' },
  { field: 'dynamiteFishing', label: 'Dynamite Fishing' },
  { field: 'poisonFishing', label: 'Poison Fishing' },
  { field: 'aquariumFishCollection', label: 'Aquarium Fish Collection' },
  {
    field: 'harvestOfInvertsForFood',
    label: 'Harvest of Invertebrates for Food',
  },
  {
    field: 'harvestOfInvertsForCurio',
    label: 'Harvest of Invertebrates for Curio',
  },
  { field: 'touristDivingSnorkeling', label: 'Tourist Diving/Snorkeling' },
  { field: 'sewagePollution', label: 'Sewage Pollution' },
  { field: 'industrialPollution', label: 'Industrial Pollution' },
  { field: 'commercialFishing', label: 'Commercial Fishing' },
  { field: 'liveFoodFishing', label: 'Live Food Fishing' },
  { field: 'artisinalRecreational', label: 'Artisanal/Recreational Fishing' },
  { field: 'yachts', label: 'Yachts' },
  { field: 'isSiteProtected', label: 'Is Site Protected?' },
  { field: 'isProtectionEnforced', label: 'Is Protection Enforced?' },
  { field: 'levelOfPoaching', label: 'Level of Poaching' },
  // eslint-disable-next-line prettier/prettier
] satisfies Array<NonNullable<SurveyFields[keyof SurveyFields]>>;

const formatFieldValue = (value: any, formatter?: (v: any) => string) => {
  if (value != null && formatter) return formatter(value);
  return value ?? '';
};

function ReefCheckSurveyDetailsComponent({
  classes,
}: ReefCheckSurveyDetailsProps) {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);

  const formattedDate = formatReefCheckSurveyDate(
    survey?.date ?? '',
    'MMM dd, yyyy',
  );

  if (error) {
    return null;
  }
  return (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        REEF CHECK SURVEY - {formattedDate}
      </Typography>
      <Box className={classes.container}>
        {surveyFields.map(({ field, label, formatter }) => (
          <Grid key={field} container className={classes.item}>
            <Typography className={classes.label}>{label}</Typography>
            <Typography className={classes.value}>
              {loading || !survey ? (
                <Skeleton
                  variant="text"
                  width={100}
                  className={classes.skeleton}
                />
              ) : (
                formatFieldValue(survey[field], formatter)
              )}
            </Typography>
          </Grid>
        ))}
      </Box>
    </Paper>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: 16,
      color: theme.palette.text.secondary,
    },
    title: {
      borderBottom: '1px solid black',
    },
    skeleton: {
      backgroundColor: '#E2E2E2',
    },
    container: {
      display: 'inline-block',
      width: '100%',
      borderTop: '1px solid #E0E0E0',
      borderLeft: '1px solid #E0E0E0',
      columnGap: 0,
      columnCount: 3,
      [theme.breakpoints.down('md')]: {
        columnCount: 2,
      },
      [theme.breakpoints.down('sm')]: {
        columnCount: 1,
      },
    },
    item: {
      display: 'flex',
      flexWrap: 'nowrap',
    },
    label: {
      backgroundColor: '#FAFAFA',
      flexBasis: 260,
      padding: 8,
      borderBottom: '1px solid #E0E0E0',
      borderRight: '1px solid #E0E0E0',
    },
    value: {
      padding: 8,
      borderBottom: '1px solid #E0E0E0',
      borderRight: '1px solid #E0E0E0',
      flex: 1,
    },
  });

type ReefCheckSurveyDetailsProps = WithStyles<typeof styles>;
export const ReefCheckSurveyDetails = withStyles(styles)(
  ReefCheckSurveyDetailsComponent,
);
