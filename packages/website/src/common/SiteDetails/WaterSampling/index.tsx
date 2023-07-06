import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  GridProps,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { colors } from 'layout/App/theme';
import {
  Metrics,
  MetricsKeys,
  Sources,
  TimeSeriesData,
} from 'store/Sites/types';
import siteServices from 'services/siteServices';
import { timeSeriesRequest } from 'store/Sites/helpers';
import { SurveyPoint } from 'store/Survey/types';
import requests from 'helpers/requests';
import moment from 'moment';
import { formatNumber } from 'helpers/numberUtils';
import { getSondeConfig } from 'constants/sondeConfig';
import WarningIcon from '@material-ui/icons/Warning';
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';

type HUICardMetrics = Extract<
  Metrics,
  'salinity' | 'nitratePlusNitrite' | 'ph' | 'turbidity'
>;

const watchColor = '#e5bb2bd0';
const warningColor = '#ef883cd0';
const alertColor = '#dd143ed0';

const thresholds = {
  nitratePlusNitrite: {
    good: 3.5,
    watch: 30,
    warning: 100,
  },
  turbidity: {
    good: 1,
    watch: 5,
    warning: 10,
  },
};

function getAlertColor(metric: HUICardMetrics, value?: number) {
  if (!value) return undefined;

  const compare = (th: { good: number; watch: number; warning: number }) => {
    if (value < th.good) return undefined;
    if (value < th.watch) return watchColor;
    if (value < th.warning) return warningColor;
    return alertColor;
  };

  switch (metric) {
    case 'nitratePlusNitrite':
      return compare(thresholds.nitratePlusNitrite);
    case 'turbidity':
      return compare(thresholds.turbidity);
    default:
      return undefined;
  }
}

function calculateGeometricMean(data: number[]) {
  const product = data.reduce((acc, curr) => acc * curr);
  const geometricMean = product ** (1 / data.length);
  return geometricMean;
}

function calculateMean(data: number[]) {
  const sum = data.reduce((acc, curr) => acc + curr);
  const mean = sum / data.length;
  return mean;
}

function getMeanCalculationFunction(source: Extract<Sources, 'hui' | 'sonde'>) {
  switch (source) {
    case 'hui':
      return calculateGeometricMean;
    case 'sonde':
      return calculateMean;
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

const metricsForSource: Pick<
  { [Key in Sources]: MetricsKeys[] },
  'hui' | 'sonde'
> = {
  hui: ['turbidity', 'nitrate_plus_nitrite', 'ph', 'salinity'],
  sonde: [
    'odo_concentration',
    'cholorophyll_concentration',
    'ph',
    'salinity',
    'turbidity',
  ],
};

interface MetricField {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  xs: GridProps['xs'];
}

function metricFields(
  data: Partial<Record<Metrics, number>>,
  source: Extract<Sources, 'hui' | 'sonde'>,
): MetricField[] {
  switch (source) {
    case 'hui':
      return [
        {
          label: 'Turbidity',
          value: `${formatNumber(data?.turbidity, 1)}`,
          unit: 'FNU',
          color: getAlertColor('turbidity', data?.turbidity),
          xs: 6,
        },
        {
          label: 'Nitrate Nitrite Nitrogen',
          value: `${formatNumber(data?.nitratePlusNitrite, 1)}`,
          unit: 'mg/L',
          color: getAlertColor('nitratePlusNitrite', data?.nitratePlusNitrite),
          xs: 6,
        },
        {
          label: 'pH',
          value: `${formatNumber(data?.ph, 1)}`,
          xs: 6,
        },
        {
          label: 'Salinity',
          value: `${formatNumber(data?.salinity, 1)}`,
          unit: 'psu',
          xs: 6,
        },
      ];

    case 'sonde':
      return [
        {
          label: 'DISSOLVED OXYGEN CONCENTRATION',
          value: formatNumber(data?.odoConcentration, 2),
          unit: getSondeConfig('odo_concentration').units,
          xs: 6,
        },
        {
          label: 'CHLOROPHYLL CONCENTRATION',
          value: formatNumber(data?.cholorophyllConcentration, 2),
          unit: getSondeConfig('cholorophyll_concentration').units,
          xs: 6,
        },
        {
          label: 'ACIDITY',
          value: formatNumber(data?.ph, 1),
          unit: getSondeConfig('ph').units,
          xs: 4,
        },
        {
          label: 'SALINITY',
          value: formatNumber(data?.salinity, 1),
          unit: getSondeConfig('salinity').units,
          xs: 5,
        },
        {
          label: 'TURBIDITY',
          value: formatNumber(data?.turbidity, 0),
          unit: getSondeConfig('turbidity').units,
          xs: 3,
        },
      ];
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

function WaterSamplingCard({ siteId, source }: WaterSamplingCardProps) {
  const classes = useStyles();

  const [minDate, setMinDate] = React.useState<string>();
  const [maxDate, setMaxDate] = React.useState<string>();
  const [point, setPoint] = React.useState<SurveyPoint>();
  const [timeSeriesData, setTimeSeriesData] = React.useState<TimeSeriesData>();

  const [meanValues, setMeanValues] = React.useState<
    Partial<Record<Metrics, number>>
  >({});

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
    const getCardData = async () => {
      try {
        const { data: uploadHistory } = await siteServices.getSiteUploadHistory(
          parseInt(siteId, 10),
        );
        // Upload history is sorted by `maxDate`, so the first
        // item is the most recent.
        const {
          minDate: from,
          maxDate: to,
          surveyPoint,
        } = uploadHistory.find((x) => x.sensorType === source) || {};
        if (typeof surveyPoint?.id === 'number') {
          const [data] = await timeSeriesRequest({
            siteId,
            pointId: surveyPoint.id.toString(),
            start: from,
            end: to,
            metrics: metricsForSource[source],
            hourly: true,
          });
          setMinDate(from);
          setMaxDate(to);
          setTimeSeriesData(data);
          setPoint(surveyPoint);
        }
      } catch (err) {
        console.error(err);
      }
    };

    getCardData();
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
            {metricFields(meanValues, source).map(
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
                        {color && (
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
        {source === 'hui' && (
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
