import Image from 'next/image';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Theme,
  Typography,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { createStyles, WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import cls from 'classnames';
import UpdateInfo from 'common/UpdateInfo';
import { colors } from 'layout/App/theme';
import { DailyData } from 'store/Sites/types';
import { toRelativeTime } from 'helpers/dates';
import caret from 'assets/caret.svg';
import satellite from 'assets/satellite.svg';
import { styles as incomingStyles } from '../styles';

const getAvgTemp = (data: DailyData[]) =>
  data.length
    ? data.reduce((acc, curr) => acc + curr.satelliteTemperature, 0) /
      data.length
    : null;

const TemperatureChangeComponent = ({
  dailyData,
  classes,
}: TemperatureChangeProps) => {
  const lastWeekAvgTemp = getAvgTemp(dailyData.slice(0, 7));
  const prevWeekAvgTemp = getAvgTemp(dailyData.slice(7, 14));
  const temperatureChange =
    lastWeekAvgTemp && prevWeekAvgTemp
      ? lastWeekAvgTemp - prevWeekAvgTemp
      : null;

  const increased = temperatureChange ? temperatureChange >= 0 : true;
  const relativeTime = dailyData[0]?.date && toRelativeTime(dailyData[0]?.date);

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography
                className={classes.cardTitle}
                color="textSecondary"
                variant="h6"
              >
                7-DAYS CHANGE
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Box className={classes.cardContent}>
          <Box
            className={cls(
              classes.tempContainer,
              increased ? classes.tempIncreased : classes.tempDecreased,
            )}
          >
            <Image
              src={caret}
              alt="caret"
              className={cls(classes.icon, { [classes.rotate]: !increased })}
            />
            <Typography variant="h1" className={classes.temperatureChange}>
              {increased ? '+' : ''}
              {temperatureChange?.toFixed(1) ?? '--'}°C
            </Typography>
          </Box>
          <Box>
            <Typography
              className={classes.temperature}
              color="textSecondary"
              variant="h4"
            >
              {lastWeekAvgTemp?.toFixed(1) ?? '--'}°C
            </Typography>
            <Typography color="textSecondary" variant="h6">
              AVERAGE 7-DAYS TEMP
            </Typography>
          </Box>
        </Box>
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

const styles = (theme: Theme) =>
  createStyles({
    ...incomingStyles,
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.backgroundGray,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      padding: 0,
    },
    cardContent: {
      margin: 'auto',
    },
    temperatureChange: {
      fontWeight: 500,
    },
    tempContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    tempIncreased: {
      color: red[500],
    },
    tempDecreased: {
      color: theme.palette.primary.main,
    },
    icon: {
      fill: 'currentColor',
      fontSize: '52px',
    },
    rotate: {
      transform: 'rotate(180deg)',
    },
    temperature: {
      fontSize: 24,
      fontWeight: 500,
    },
  });

interface IncomingTemperatureChangeProps {
  dailyData: DailyData[];
}

type TemperatureChangeProps = WithStyles<typeof styles> &
  IncomingTemperatureChangeProps;

export const TemperatureChange = withStyles(styles)(TemperatureChangeComponent);
