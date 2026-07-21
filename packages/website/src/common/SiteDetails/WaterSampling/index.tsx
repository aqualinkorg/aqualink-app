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
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';

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
    color: colors.black,
  },
  metricTile: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: '0.4rem 0.5rem 0.25rem 0.5rem',
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
        style={
          showHwoCard ? { padding: '0.5rem 0.5rem 0.15rem 0.5rem' } : undefined
        }
        title={
          <Grid container>
            <Grid item>
              <Typography
                className={
                  showHwoCard ? classes.hwoCardTitle : classes.cardTitle
                }
                variant="h6"
              >
                {showHwoCard ? 'WATER HEALTH/CONDITION' : 'WATER SAMPLING'}
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Box
          px={showHwoCard ? '0.5rem' : '1rem'}
          pt={showHwoCard ? '0.15rem' : '1rem'}
          pb={showHwoCard ? 0 : '1rem'}
          display="flex"
          flexGrow={showHwoCard ? 0 : 1}
        >
          <Grid container spacing={1} alignContent="flex-start">
            {metricFields(source, meanValues, parseInt(siteId, 10)).map(
              ({ label, value, color, unit, xs, iconType, iconColor }) => (
                <Grid key={label} item xs={xs}>
                  <Grid
                    container
                    className={showHwoCard ? classes.metricTile : undefined}
                  >
                    {showHwoCard ? (
                      <>
                        <Grid item xs={12}>
                          <Typography
                            className={classes.contentTextTitles}
                            color="textSecondary"
                            variant="subtitle2"
                            style={{
                              display: 'block',
                              minHeight: xs === 6 ? '2em' : undefined,
                            }}
                          >
                            {label}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <div
                            style={{
                              display: 'flex',
                              paddingLeft: xs === 6 ? '0.4rem' : '0.15rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto auto',
                                gridTemplateRows: 'auto auto',
                                columnGap: '0.2em',
                              }}
                            >
                              <div
                                style={{
                                  gridColumn: 1,
                                  gridRow: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {iconType === 'check' && (
                                  <CheckCircleOutlineIcon
                                    style={{
                                      fontSize: xs === 6 ? '1.4em' : '1.1em',
                                      color: iconColor,
                                    }}
                                  />
                                )}
                                {iconType === 'warning' && (
                                  <WarningIcon
                                    style={{
                                      fontSize: xs === 6 ? '1.4em' : '1.1em',
                                      color: iconColor,
                                    }}
                                  />
                                )}
                              </div>
                              <Typography
                                className={classes.contentTextValues}
                                color="textSecondary"
                                variant={xs === 6 ? 'h3' : 'h4'}
                                style={{
                                  gridColumn: 2,
                                  gridRow: 1,
                                  whiteSpace: 'nowrap',
                                  fontSize: xs === 4 ? '21px' : undefined,
                                  alignSelf: 'center',
                                }}
                              >
                                {value}
                              </Typography>
                              <div style={{ gridColumn: 1, gridRow: 2 }} />
                              {unit && (
                                <Typography
                                  className={classes.contentUnits}
                                  color="textSecondary"
                                  variant="subtitle2"
                                  style={{
                                    gridColumn: 2,
                                    gridRow: 2,
                                    textAlign: 'center',
                                    marginTop: '-4px',
                                  }}
                                >
                                  {unit}
                                </Typography>
                              )}
                            </div>
                          </div>
                        </Grid>
                      </>
                    ) : (
                      <>
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
                            alignItems: 'baseline',
                            color,
                          }}
                        >
                          <Typography
                            className={classes.contentTextValues}
                            variant="h3"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {value}
                          </Typography>
                          {unit && (
                            <Typography
                              className={classes.contentUnits}
                              variant="h6"
                            >
                              {unit}
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
              ),
            )}
          </Grid>
        </Box>
        {showHwoCard && (
          <Box px="0.75rem" pb="0.25rem">
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
            mx="0.5rem"
            mb="0.5rem"
            style={{ borderRadius: 6, overflow: 'hidden', display: 'flex' }}
          >
            {hwoLevels.map((level) => (
              <Box
                key={level}
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  backgroundColor: hwoLevelConfig[level].color,
                  padding: '0.25rem 0.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="caption"
                  align="center"
                  style={{
                    lineHeight: 1,
                    fontSize: 8.5,
                    letterSpacing: '-0.2px',
                    color:
                      level === 'acceptable' || level === 'impaired'
                        ? 'white'
                        : 'black',
                  }}
                >
                  {hwoLevelConfig[level].label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        {showHwoCard && <Box flexGrow={1} />}
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
