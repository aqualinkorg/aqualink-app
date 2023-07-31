import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { colors } from 'layout/App/theme';
import { Metrics, Sources, TimeSeriesData } from 'store/Sites/types';
import { SurveyPoint } from 'store/Survey/types';
import requests from 'helpers/requests';
import moment from 'moment';
import WarningIcon from '@material-ui/icons/Warning';
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';
import {
  alertColor,
  getCardData,
  getMeanCalculationFunction,
  metricFields,
  warningColor,
  watchColor,
} from './utils';

function WaterSamplingCard({ siteId, source }: WaterSamplingCardProps) {
  const classes = useStyles();

  const [minDate, setMinDate] = React.useState<string>();
  const [maxDate, setMaxDate] = React.useState<string>();
  const [point, setPoint] = React.useState<SurveyPoint>();
  const [timeSeriesData, setTimeSeriesData] = React.useState<TimeSeriesData>();

  const [meanValues, setMeanValues] = React.useState<
    Partial<Record<Metrics, number>>
  >({});

  // disable showing color for now
  const showAlertColors = source === 'hui' && false;

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
  const lastUpload = maxDate ? moment(maxDate).format('MM/DD/YYYY') : undefined;

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
      setPoint(p);
    })();
  }, [siteId, source]);

  React.useEffect(() => {
    const newMeans = Object.fromEntries(
      Object.entries(timeSeriesData || {})
        .map(([key, val]) => {
          const values = val[source]?.data.map((x) => x.value);
          if (!values) return [undefined, undefined];
          return [key, getMeanCalculationFunction(source)(values)];
        })
        .filter((x) => x && x[0]),
    ) as Partial<Record<Metrics, number>>;
    setMeanValues(newMeans);
  }, [source, timeSeriesData]);

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography className={classes.cardTitle} variant="h6">
                WATER SAMPLING
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Box p="1rem" display="flex" flexGrow={1}>
          <Grid container spacing={1}>
            {metricFields(source, meanValues).map(
              ({ label, value, color, unit, xs }) => (
                <Grid key={label} item xs={xs}>
                  <Grid container>
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
                      style={{ display: 'flex', alignItems: 'baseline' }}
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
                  </Grid>
                </Grid>
              ),
            )}
          </Grid>
        </Box>
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

const useStyles = makeStyles(() => ({
  ...incomingStyles,
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.greenCardColor,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
    padding: 0,
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

interface WaterSamplingCardProps {
  siteId: string;
  source: Extract<Sources, 'hui' | 'sonde'>;
}

export default WaterSamplingCard;
