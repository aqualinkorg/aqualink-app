import React, { useEffect, useState } from 'react';
import { head } from 'lodash';
import {
  Box,
  Card,
  makeStyles,
  CardHeader,
  Grid,
  Typography,
  CardContent,
  GridProps,
} from '@material-ui/core';
import moment from 'moment';

import { TimeSeriesData } from 'store/Sites/types';
import { timeSeriesRequest } from 'store/Sites/helpers';
import { formatNumber } from 'helpers/numberUtils';
import requests from 'helpers/requests';
import { colors } from 'layout/App/theme';
import siteServices from 'services/siteServices';
import {
  getSondeConfig,
  SondeMetricsKeys,
} from 'constants/chartConfigs/sondeConfig';
import { styles as incomingStyles } from '../styles';
import { calculateSondeDataMeanValues } from './utils';
import UpdateInfo from '../../UpdateInfo';

const CARD_BACKGROUND_COLOR = colors.greenCardColor;
const METRICS: SondeMetricsKeys[] = [
  'odo_concentration',
  'cholorophyll_concentration',
  'ph',
  'salinity',
  'turbidity',
];

interface Metric {
  label: string;
  value: string;
  unit: string;
  xs: GridProps['xs'];
}

interface SurveyPoint {
  id: number;
  name: string;
}

const metrics = (
  data: ReturnType<typeof calculateSondeDataMeanValues>,
): Metric[] => [
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

const WaterSamplingCard = ({ siteId }: WaterSamplingCardProps) => {
  const classes = useStyles();
  const [minDate, setMinDate] = useState<string>();
  const [maxDate, setMaxDate] = useState<string>();
  const [point, setPoint] = useState<SurveyPoint>();
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>();
  const meanValues = calculateSondeDataMeanValues(METRICS, timeSeriesData);
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

  useEffect(() => {
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
        } = head(uploadHistory) || {};
        if (typeof surveyPoint?.id === 'number') {
          const [data] = await timeSeriesRequest({
            siteId,
            pointId: surveyPoint.id.toString(),
            start: from,
            end: to,
            metrics: METRICS,
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
  }, [siteId]);

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
            {metrics(meanValues).map(({ label, value, unit, xs }) => (
              <Grid key={label} item xs={xs}>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  {label}
                </Typography>
                <Typography
                  className={classes.contentTextValues}
                  variant="h3"
                  display="inline"
                >
                  {value}
                </Typography>
                <Typography
                  className={classes.contentUnits}
                  display="inline"
                  variant="h6"
                >
                  {unit}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
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
};

const useStyles = makeStyles(() => ({
  ...incomingStyles,
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: CARD_BACKGROUND_COLOR,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
    padding: 0,
  },
}));

interface WaterSamplingCardProps {
  siteId: string;
}

export default WaterSamplingCard;
