import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
  Tooltip,
  Box,
} from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { LatestDataASSofarValue } from 'store/Sites/types';
import { formatNumber } from 'helpers/numberUtils';
import {
  dhwColorFinder,
  degreeHeatingWeeksCalculator,
} from 'helpers/degreeHeatingWeeks';
import { toRelativeTime } from 'helpers/dates';
import { dhwColorCode } from '../../../assets/colorCode';
import satellite from '../../../assets/satellite.svg';
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';

const Satellite = ({ maxMonthlyMean, data, classes }: SatelliteProps) => {
  const { dhw, satelliteTemperature, sstAnomaly } = data;
  const degreeHeatingDays = { ...dhw, value: (dhw?.value || 0) * 7 };
  const relativeTime =
    satelliteTemperature?.timestamp &&
    toRelativeTime(satelliteTemperature.timestamp);

  const degreeHeatingWeeks = degreeHeatingWeeksCalculator(
    degreeHeatingDays?.value,
  );

  const metrics = [
    {
      label: 'SURFACE TEMP',
      value: `${formatNumber(satelliteTemperature?.value, 1)}°C`,
    },
    {
      label: 'HISTORICAL MAX',
      value: `${formatNumber(maxMonthlyMean, 1)}°C`,
      tooltipTitle: 'Historical maximum monthly average over the past 20 years',
    },
    {
      label: 'DEGREE HEATING WEEKS',
      value: formatNumber(degreeHeatingWeeks, 1),
      tooltipTitle:
        'Degree Heating Weeks - a measure of the amount of time above the 20 year historical maximum temperatures',
    },
    {
      label: 'SST ANOMALY',
      tooltipTitle: 'Difference between current SST and longterm average',
      value: `${
        sstAnomaly
          ? `${sstAnomaly.value > 0 ? '+' : ''}${formatNumber(
              sstAnomaly.value,
              1,
            )}`
          : '- -'
      }°C`,
    },
  ];

  return (
    <Card
      className={classes.root}
      style={{ backgroundColor: dhwColorFinder(degreeHeatingWeeks) }}
    >
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography className={classes.cardTitle} variant="h6">
                SATELLITE OBSERVATION
              </Typography>
            </Grid>
          </Grid>
        }
      />

      <CardContent className={classes.content}>
        <Box p="1rem" display="flex" flexGrow={1}>
          <Grid container spacing={1}>
            {metrics.map(({ label, value, tooltipTitle }) => (
              <Grid key={label} item xs={6}>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  {label}
                </Typography>
                <Tooltip title={tooltipTitle || ''}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {value}
                  </Typography>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container>
          {dhwColorCode.map(({ value, color }) => (
            <Grid
              key={value}
              item
              xs={1}
              style={{ backgroundColor: `${color}`, height: '2rem' }}
            >
              <Box textAlign="center">
                <Typography variant="caption" align="center">
                  {value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <UpdateInfo
          relativeTime={relativeTime}
          timeText="Last data received"
          image={satellite.src}
          imageText="NOAA"
          live={false}
          frequency="daily"
          href="https://coralreefwatch.noaa.gov/"
        />
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    ...incomingStyles,
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexGrow: 1,
      padding: 0,
    },
  });

interface SatelliteIncomingProps {
  maxMonthlyMean: number | null;
  data: LatestDataASSofarValue;
}

type SatelliteProps = WithStyles<typeof styles> & SatelliteIncomingProps;

export default withStyles(styles)(Satellite);
