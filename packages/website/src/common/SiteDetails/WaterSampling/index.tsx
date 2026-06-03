import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { colors } from 'layout/App/theme';
import {
  Metrics,
  Sources,
  SurveyPoints,
  TimeSeriesData,
} from 'store/Sites/types';
import requests from 'helpers/requests';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DateTime } from 'luxon-extensions';
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';
import {
  alertColor,
  getCardData,
  getMeanCalculationFunction,
  hwoLevelConfig,
  hwoLevels,
  metricFields,
  warningColor,
  watchColor,
} from './utils';

const useStyles = makeStyles(() => ({
  ...incomingStyles,
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.greenCardColor,
    color: 'white',
  },
  hwoRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.backgroundGray,
    color: colors.black,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
    padding: 0,
  },
  hwoCardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.black,
  },
  metricTile: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: '0.75rem',
    height: '100%',
  },
  labelWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    minHeight: '2em',
  },
  valueWrapper: {
    display: 'flex',
    alignItems: 'baseline',
  },
}));

function WaterSamplingCard({ siteId, source }: WaterSamplingCardProps) {
  const classes = useStyles();

  const [minDate, setMinDate] = React.useState<string>();
  const [maxDate, setMaxDate] = React.useState<string>();
  const [point, setPoint] = React.useState<SurveyPoints>();
  const [timeSeriesData, setTimeSeriesData] = React.useState<TimeSeriesData>();

  const [meanValues, setMeanValues] = React.useState<
    Partial<Record<Metrics, number>>
  >({});

  const showAlertColors = source === 'hui';
  const showHwoCard = source === 'hwo';

  const isPointNameLong = (point?.name?.length || 0) > 24;
  const surveyPointDisplayName = `${isPointNameLong ? '' : ' Survey point:'} ${
    point?.name || point?.id
  }`;
  const viewUploadButtonLink = `/sites/${siteId}${requests.generateUrlQueryParams(
    {
      start: minDate,
      end: maxDate,
      surveyPoint: point?.id,
    },
  )}`;
  const lastUpload = maxDate
    ? DateTime.fromISO(maxDate).toFormat('LL/dd/yyyy')
    : undefined;

  React.useEffect(() => {
    (async () => {
      const {
        data,
        maxDate: max,
        minDate: min,
        point: p,
      } = await getCardData(siteId, source);
      setMinDate(min);
      setMaxDate(max);
      setTimeSeriesData(data);
      setPoint(p ?? undefined);
    })();
  }, [siteId, source]);

  React.useEffect(() => {
    const newMeans = Object.fromEntries(
      Object.entries(timeSeriesData || {})
        .map(([key, val]) => {
          const values = val
            .find(
              (x) =>
                // hui is specific type of sonde, look for hui as well when looking for sonde
                x.type === source || (source === 'sonde' && x.type === 'hui'),
            )
            ?.data.map((x) => x.value);
          if (!values) return [undefined, undefined];
          return [key, getMeanCalculationFunction(source)(values)];
        })
        .filter((x) => x && x[0]),
    ) as Partial<Record<Metrics, number>>;
    setMeanValues(newMeans);
  }, [source, timeSeriesData]);

  return (
    <Card className={showHwoCard ? classes.hwoRoot : classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography
                className={
                  showHwoCard ? classes.hwoCardTitle : classes.cardTitle
                }
                variant={showHwoCard ? 'h4' : 'h6'}
              >
                {showHwoCard ? 'WATER HEALTH/CONDITION' : 'WATER SAMPLING'}
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Box p="1rem" display="flex" flexGrow={1}>
          <Grid container spacing={1}>
            {metricFields(source, meanValues, parseInt(siteId, 10)).map(
              ({ label, value, color, unit, xs, iconType, iconColor }) => (
                <Grid key={label} item xs={xs}>
                  <Grid
                    container
                    className={showHwoCard ? classes.metricTile : undefined}
                  >
                    <Grid item xs={12}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'nowrap',
                          minHeight: '2em',
                        }}
                      >
                        <Typography
                          className={classes.contentTextTitles}
                          variant="subtitle2"
                        >
                          {label}
                        </Typography>
                        {color && showAlertColors && (
                          <WarningIcon
                            className={classes.contentTextTitles}
                            style={{
                              fontSize: '1.1em',
                              marginRight: '1em',
                              marginLeft: 'auto',
                              color,
                            }}
                          />
                        )}
                      </div>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: showHwoCard ? undefined : color,
                      }}
                    >
                      {showHwoCard && iconType === 'check' && (
                        <CheckCircleOutlineIcon
                          style={{
                            fontSize: '1.5em',
                            marginRight: '0.25em',
                            color: iconColor,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {showHwoCard && iconType === 'warning' && (
                        <WarningIcon
                          style={{
                            fontSize: '1.5em',
                            marginRight: '0.25em',
                            color: iconColor,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        className={classes.contentTextValues}
                        variant="h3"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {value}
                      </Typography>
                      {!showHwoCard && unit && (
                        <Typography
                          className={classes.contentUnits}
                          variant="h6"
                        >
                          {unit}
                        </Typography>
                      )}
                    </Grid>
                    {showHwoCard && unit && (
                      <Grid item xs={12}>
                        <Typography
                          className={classes.contentUnits}
                          variant="h6"
                        >
                          {unit}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              ),
            )}
          </Grid>
        </Box>
        {showHwoCard && (
          <Box px="1rem" pb="0.5rem">
            <Typography variant="caption" style={{ color: colors.black }}>
              * Total dissolved
            </Typography>
          </Box>
        )}
        {showAlertColors && (
          <Grid container>
            {[
              { text: 'watch', color: watchColor },
              { text: 'warning', color: warningColor },
              { text: 'alert', color: alertColor },
            ].map(({ text, color }) => (
              <Grid
                key={text}
                item
                xs={4}
                style={{ backgroundColor: color, height: '2rem' }}
              >
                <Box textAlign="center">
                  <Typography variant="caption" align="center">
                    {text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
        {showHwoCard && (
          <Box
            mx="1rem"
            mb="0.75rem"
            style={{ borderRadius: 6, overflow: 'hidden', display: 'flex' }}
          >
            {hwoLevels.map((level) => (
              <Box
                key={level}
                style={{
                  flex: 1,
                  backgroundColor: hwoLevelConfig[level].color,
                  padding: '0.35rem 0.2rem',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  align="center"
                  style={{ display: 'block', lineHeight: 1.2 }}
                >
                  {hwoLevelConfig[level].label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        <UpdateInfo
          relativeTime={lastUpload}
          chipWidth={64}
          timeText="Last data uploaded"
          imageText="VIEW UPLOAD"
          href={viewUploadButtonLink}
          subtitle={point && surveyPointDisplayName}
        />
      </CardContent>
    </Card>
  );
}

interface WaterSamplingCardProps {
  siteId: string;
  source: Extract<Sources, 'hui' | 'sonde' | 'hwo'>;
}

export default WaterSamplingCard;
