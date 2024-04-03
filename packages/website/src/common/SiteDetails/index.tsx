import React, { useEffect, useState } from 'react';
import {
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Box,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import classNames from 'classnames';
import times from 'lodash/times';

import { useDispatch, useSelector } from 'react-redux';
import { oceanSenseConfig } from 'constants/oceanSenseConfig';
import type {
  Site,
  LatestDataASSofarValue,
  DataRange,
  Sources,
  TimeSeriesDataRange,
} from 'store/Sites/types';
import { SurveyListItem, SurveyPoint } from 'store/Survey/types';
import {
  forecastDataRequest,
  forecastDataSelector,
  latestDataRequest,
  latestDataSelector,
  siteTimeSeriesDataRangeSelector,
  spotterPositionRequest,
  spotterPositionSelector,
  unsetForecastData,
  unsetLatestData,
  unsetSpotterPosition,
} from 'store/Sites/selectedSiteSlice';
import { parseLatestData } from 'store/Sites/helpers';
import { getMiddlePoint } from 'helpers/map';
import { formatNumber } from 'helpers/numberUtils';
import { displayTimeInLocalTimezone } from 'helpers/dates';
import { DateTime, Interval } from 'luxon';
import Map from './Map';
import SketchFab from './SketchFab';
import FeaturedMedia from './FeaturedMedia';
import Satellite from './Satellite';
import Sensor from './Sensor';
import CoralBleaching from './CoralBleaching';
import Waves from './Waves';
import OceanSenseMetrics from './OceanSenseMetrics';
import Surveys from './Surveys';
import CardWithTitle from './CardWithTitle';
import { Value } from './CardWithTitle/types';
import CombinedCharts from '../Chart/CombinedCharts';
import WaterSamplingCard from './WaterSampling';
import { styles as incomingStyles } from './styles';
import LoadingSkeleton from '../LoadingSkeleton';
import playIcon from '../../assets/play-icon.svg';

const acceptHUIInterval = Interval.fromDateTimes(
  DateTime.now().minus({ years: 2 }),
  DateTime.now(),
);

function dateRangeWithinInterval(
  interval: Interval,
  dataRange: DataRange[],
): boolean {
  // eslint-disable-next-line fp/no-mutation
  for (let index = 0; index < dataRange.length; index += 1) {
    if (interval.contains(DateTime.fromISO(dataRange[index].maxDate))) {
      return true;
    }
  }
  return false;
}

function sourceWithinDataRangeInterval(
  interval: Interval,
  source: Sources,
  dataRanges?: TimeSeriesDataRange,
) {
  if (!dataRanges) return false;

  const ranges = Object.entries(dataRanges);
  // eslint-disable-next-line fp/no-mutation
  for (let index = 0; index < ranges.length; index += 1) {
    if (
      ranges[index][1].find(
        (x) => x.type === source && dateRangeWithinInterval(interval, x.data),
      )
    ) {
      return true;
    }
  }

  return false;
}

const sondeMetrics: (keyof LatestDataASSofarValue)[] = [
  'odoConcentration',
  'cholorophyllConcentration',
  'ph',
  'salinity',
  'turbidity',
];

const MINIMUM_SONDE_METRICS_TO_SHOW_CARD = 3;

const SiteDetails = ({
  site,
  selectedSurveyPointId,
  surveys,
  featuredSurveyId = null,
  featuredSurveyPoint = null,
  surveyDiveDate = null,
}: SiteDetailsProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const spotterPosition = useSelector(spotterPositionSelector);
  const [latestDataAsSofarValues, setLatestDataAsSofarValues] =
    useState<LatestDataASSofarValue>({});
  const [hasSondeData, setHasSondeData] = useState<boolean>(false);
  const [hasSpotterData, setHasSpotterData] = useState<boolean>(false);
  const [hasHUIData, setHasHUIData] = useState<boolean>(false);
  const latestData = useSelector(latestDataSelector);
  const forecastData = useSelector(forecastDataSelector);
  const timeSeriesRange = useSelector(siteTimeSeriesDataRangeSelector);
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [lng, lat] = site?.polygon ? getMiddlePoint(site.polygon) : [];
  const isLoading = !site;

  useEffect(() => {
    if (site && !spotterPosition) {
      dispatch(spotterPositionRequest(String(site.id)));
    }
    if (site && !latestData) {
      dispatch(latestDataRequest(String(site.id)));
    }
    if (site && !forecastData) {
      dispatch(forecastDataRequest(String(site.id)));
    }
  }, [dispatch, site, spotterPosition, latestData, forecastData]);

  useEffect(() => {
    return () => {
      dispatch(unsetSpotterPosition());
      dispatch(unsetLatestData());
      dispatch(unsetForecastData());
    };
  }, [dispatch]);

  useEffect(() => {
    if (forecastData && latestData) {
      const combinedArray = [...forecastData, ...latestData];
      const parsedData = parseLatestData(combinedArray);
      const hasSpotter = Boolean(parsedData.bottomTemperature);
      const hasSonde =
        sondeMetrics.filter((x) => Boolean(parsedData[x])).length >=
        MINIMUM_SONDE_METRICS_TO_SHOW_CARD;
      const hasHUI =
        latestData.some((x) => x.source === 'hui') ||
        sourceWithinDataRangeInterval(
          acceptHUIInterval,
          'hui',
          timeSeriesRange,
        );

      setHasSondeData(hasSonde);
      setHasSpotterData(hasSpotter);
      setHasHUIData(hasHUI);
      setLatestDataAsSofarValues(parsedData);
    }
  }, [forecastData, latestData, timeSeriesRange]);

  const { videoStream } = site || {};

  const cards =
    site && latestDataAsSofarValues
      ? [
          <Satellite
            data={latestDataAsSofarValues}
            maxMonthlyMean={site.maxMonthlyMean}
          />,
          <Sensor
            depth={site.depth}
            id={site.id}
            data={latestDataAsSofarValues}
          />,
          (() => {
            if (hasHUIData) {
              return (
                <WaterSamplingCard siteId={site.id.toString()} source="hui" />
              );
            }
            if (hasSondeData) {
              return (
                <WaterSamplingCard siteId={site.id.toString()} source="sonde" />
              );
            }
            return <CoralBleaching data={latestDataAsSofarValues} />;
          })(),
          <Waves data={latestDataAsSofarValues} hasSpotter={hasSpotterData} />,
        ]
      : times(4, () => null);

  const mapTitleItems: Value[] = [
    {
      text: `LAT: ${formatNumber(lat, 3)}`,
      variant: 'subtitle2',
      marginRight: '1rem',
    },
    {
      text: `LONG: ${formatNumber(lng, 3)}`,
      variant: 'subtitle2',
      marginRight: site?.sketchFab ? '1rem' : 0,
    },
  ];

  const featuredMediaTitleItems = (): Value[] => {
    switch (true) {
      case !!videoStream:
        return [
          {
            text: 'LIVE VIDEO',
            marginRight: 0,
            variant: 'h6',
          },
        ];
      case !!surveyDiveDate && !!featuredSurveyPoint:
        return [
          {
            text: 'SURVEY POINT:',
            variant: 'h6',
            marginRight: '0.5rem',
          },
          {
            text: `${featuredSurveyPoint?.name}`,
            variant: 'subtitle2',
            marginRight: '2rem',
            overflowEllipsis: true,
          },
          {
            text: `${displayTimeInLocalTimezone({
              isoDate: surveyDiveDate,
              format: 'MMM dd, yyyy',
              displayTimezone: false,
              timeZone: site?.timezone,
            })}`,
            variant: 'subtitle2',
            marginRight: 0,
          },
        ];
      case !!site?.sketchFab?.description: {
        return [
          {
            text: site?.sketchFab?.description ?? '',
            variant: 'subtitle2',
            marginRight: 0,
          },
        ];
      }
      default:
        return [];
    }
  };

  return (
    <Box mt="1.5rem">
      <Grid
        direction={isMobile ? 'column-reverse' : 'row'}
        container
        justifyContent="space-between"
        alignItems="flex-end"
        spacing={videoStream ? 0 : 2}
        className={classNames({
          [classes.forcedWidth]: !!videoStream,
        })}
      >
        <CardWithTitle
          loading={isLoading}
          className={classNames({
            [classes.mobileMargin]: !!videoStream,
          })}
          titleItems={mapTitleItems}
          gridProps={{ xs: 12, md: 6 }}
          forcedAspectRatio={!!videoStream}
        >
          {site && (
            <Map
              siteId={site.id}
              spotterPosition={
                hasSpotterData ? spotterPosition?.position : null
              }
              polygon={site.polygon}
              surveyPoints={site.surveyPoints}
            />
          )}
        </CardWithTitle>

        <CardWithTitle
          loading={isLoading}
          className={classNames({
            [classes.mobileMargin]: !!videoStream,
          })}
          titleItems={featuredMediaTitleItems()}
          gridProps={{ xs: 12, md: 6 }}
          forcedAspectRatio={!!videoStream}
          loadingImage={playIcon}
        >
          {/* video first, then 3d model, then image */}
          {site && !videoStream && site.sketchFab?.uuid && (
            <SketchFab uuid={site.sketchFab.uuid} />
          )}
          {site && (videoStream || !site.sketchFab?.uuid) && (
            <FeaturedMedia
              siteId={site.id}
              url={videoStream}
              featuredImage={site.featuredImage}
              surveyId={featuredSurveyId}
            />
          )}
        </CardWithTitle>
      </Grid>

      <Grid
        className={classes.metricsWrapper}
        container
        justifyContent="space-between"
        spacing={2}
      >
        {cards.map((Component, index) => (
          <Grid key={`card-${index.toString()}`} item xs={12} sm={6} md={3}>
            <div className={classes.card}>
              <LoadingSkeleton variant="rect" height="100%" loading={isLoading}>
                {Component}
              </LoadingSkeleton>
            </div>
          </Grid>
        ))}
      </Grid>

      {site && oceanSenseConfig?.[site.id] && <OceanSenseMetrics />}

      <Box mt="2rem">
        <CombinedCharts
          site={site}
          selectedSurveyPointId={selectedSurveyPointId}
          surveys={surveys}
        />
        <Surveys site={site} />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    ...incomingStyles,
    root: {
      marginTop: '2rem',
    },
    forcedWidth: {
      width: `calc(100% + ${theme.spacing(2)}px)`,
      margin: -theme.spacing(1),
    },
    mobileMargin: {
      [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(1, 0),
      },
    },
    metricsWrapper: {
      marginTop: '1rem',
    },
  }),
);

interface SiteDetailsProps {
  site?: Site;
  selectedSurveyPointId?: string;
  featuredSurveyId?: number | null;
  surveys: SurveyListItem[];
  featuredSurveyPoint?: SurveyPoint | null;
  surveyDiveDate?: string | null;
}

export default SiteDetails;
