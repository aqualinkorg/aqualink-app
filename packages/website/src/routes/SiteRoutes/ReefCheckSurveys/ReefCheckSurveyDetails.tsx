import React from 'react';
import {
  Box,
  createStyles,
  Grid,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useSelector } from 'react-redux';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { ReefCheckSurvey } from 'store/ReefCheckSurveys/types';

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

const ReefCheckSurveyDetailsComponent = ({
  classes,
}: ReefCheckSurveyDetailsProps) => {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);

  if (error) {
    return null;
  }
  return (
    <Paper className={classes.paper}>
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
                formatter?.(survey[field]) ?? survey[field] ?? ''
              )}
            </Typography>
          </Grid>
        ))}
      </Box>
    </Paper>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: 16,
      color: theme.palette.text.secondary,
    },
    skeleton: {
      backgroundColor: '#E2E2E2',
    },
    container: {
      display: 'inline-block',
      columnCount: 3,
      columnGap: 0,
      width: '100%',
      borderTop: '1px solid #E0E0E0',
      borderLeft: '1px solid #E0E0E0',
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
