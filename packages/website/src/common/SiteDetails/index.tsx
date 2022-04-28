import React, { useEffect, useState } from "react";
import {
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Box,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import classNames from "classnames";
import times from "lodash/times";

import { useDispatch, useSelector } from "react-redux";
import Map from "./Map";
import FeaturedMedia from "./FeaturedMedia";
import Satellite from "./Satellite";
import Sensor from "./Sensor";
import CoralBleaching from "./CoralBleaching";
import Waves from "./Waves";
import OceanSenseMetrics from "./OceanSenseMetrics";
import Surveys from "./Surveys";
import CardWithTitle from "./CardWithTitle";
import { Value } from "./CardWithTitle/types";
import CombinedCharts from "../Chart/CombinedCharts";
import type {
  Site,
  SatelliteDataProps,
  LatestData,
  SofarValue,
  SensorDataProps,
  WavesDataProps,
} from "../../store/Sites/types";
import { getMiddlePoint } from "../../helpers/map";
import { formatNumber } from "../../helpers/numberUtils";
import { SurveyListItem, SurveyPoint } from "../../store/Survey/types";
import { displayTimeInLocalTimezone, sortByDate } from "../../helpers/dates";
import { oceanSenseConfig } from "../../constants/oceanSenseConfig";
import WaterSamplingCard from "./WaterSampling";
import { styles as incomingStyles } from "./styles";
import LoadingSkeleton from "../LoadingSkeleton";
import playIcon from "../../assets/play-icon.svg";
import {
  latestDataRequest,
  latestDataSelector,
  liveDataRequest,
  liveDataSelector,
  unsetLatestData,
  unsetLiveData,
} from "../../store/Sites/selectedSiteSlice";

const latestDataToSofarValue = (
  data: LatestData | undefined
): SofarValue | undefined => {
  if (!data) return undefined;
  return { timestamp: data.timestamp, value: data.value };
};

const SiteDetails = ({
  site,
  selectedSurveyPointId,
  hasDailyData,
  surveys,
  featuredSurveyId = null,
  featuredSurveyPoint = null,
  surveyDiveDate = null,
}: SiteDetailsProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const liveData = useSelector(liveDataSelector);
  const latestData = useSelector(latestDataSelector);
  const [dataForSatellite, setDataForSatellite] = useState<SatelliteDataProps>(
    {}
  );
  const [dataForSensor, setDataForSensor] = useState<SensorDataProps>({});
  const [dataForWave, setDataForWave] = useState<WavesDataProps>({});
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const [lng, lat] = site?.polygon ? getMiddlePoint(site.polygon) : [];
  const isLoading = !site;

  useEffect(() => {
    if (site && !liveData) {
      dispatch(liveDataRequest(`${site.id}`));
    }
    if (site && !latestData) {
      dispatch(latestDataRequest(`${site.id}`));
    }
  }, [dispatch, site, liveData, latestData]);

  useEffect(() => {
    return () => {
      dispatch(unsetLiveData());
      dispatch(unsetLatestData());
    };
  }, [dispatch]);

  useEffect(() => {
    if (latestData) {
      // Data for Satellite
      // not sure if here 'dhw' is the one
      const degreeHeating = latestData.find((x) => x.metric === "dhw");
      const satelliteTemperature = latestData.find(
        (x) => x.metric === "satellite_temperature"
      );
      const sstAnomaly = latestData.find((x) => x.metric === "sst_anomaly");
      setDataForSatellite({
        degreeHeatingDays: latestDataToSofarValue(degreeHeating),
        satelliteTemperature: latestDataToSofarValue(satelliteTemperature),
        sstAnomaly: sstAnomaly?.value,
      });

      // Data for Sensor
      const topTemperature = latestData.find(
        (x) => x.metric === "top_temperature"
      );
      const bottomTemperature = latestData.find(
        (x) => x.metric === "bottom_temperature"
      );
      setDataForSensor({
        topTemperature: latestDataToSofarValue(topTemperature),
        bottomTemperature: latestDataToSofarValue(bottomTemperature),
      });

      // Data for Wave
      const waveHeight = latestData.find(
        (x) => x.metric === "significant_wave_height"
      ); // not sure if here 'significant_wave_height' is the one
      const waveMeanDirection = latestData.find(
        (x) => x.metric === "wave_mean_direction"
      );
      const waveMeanPeriod = latestData.find(
        (x) => x.metric === "wave_mean_period"
      );
      const windSpeed = latestData.find((x) => x.metric === "wind_speed");
      const windDirection = latestData.find(
        (x) => x.metric === "wind_direction"
      );
      setDataForWave({
        topTemperature: latestDataToSofarValue(topTemperature),
        bottomTemperature: latestDataToSofarValue(bottomTemperature),
        waveHeight: latestDataToSofarValue(waveHeight),
        waveMeanDirection: latestDataToSofarValue(waveMeanDirection),
        waveMeanPeriod: latestDataToSofarValue(waveMeanPeriod),
        windSpeed: latestDataToSofarValue(windSpeed),
        windDirection: latestDataToSofarValue(windDirection),
      });
    }
  }, [latestData]);

  const { videoStream } = site || {};

  const hasSondeData = Boolean(
    latestData?.some((data) => data.source === "sonde")
  );

  const cards =
    site && latestData
      ? [
          <Satellite
            data={dataForSatellite}
            maxMonthlyMean={site.maxMonthlyMean}
          />,
          <Sensor depth={site.depth} id={site.id} data={dataForSensor} />,
          hasSondeData ? (
            <WaterSamplingCard siteId={site.id.toString()} />
          ) : (
            <CoralBleaching
              dailyData={sortByDate(site.dailyData, "date", "asc").slice(-1)[0]}
            />
          ),
          <Waves data={dataForWave} />,
        ]
      : times(4, () => null);

  const mapTitleItems: Value[] = [
    {
      text: `LAT: ${formatNumber(lat, 3)}`,
      variant: "subtitle2",
      marginRight: "1rem",
    },
    {
      text: `LONG: ${formatNumber(lng, 3)}`,
      variant: "subtitle2",
      marginRight: 0,
    },
  ];

  const featuredMediaTitleItems = (): Value[] => {
    switch (true) {
      case !!videoStream:
        return [
          {
            text: "LIVE VIDEO",
            marginRight: 0,
            variant: "h6",
          },
        ];
      case !!surveyDiveDate && !!featuredSurveyPoint:
        return [
          {
            text: "SURVEY POINT:",
            variant: "h6",
            marginRight: "0.5rem",
          },
          {
            text: `${featuredSurveyPoint?.name}`,
            variant: "subtitle2",
            marginRight: "2rem",
            overflowEllipsis: true,
          },
          {
            text: `${displayTimeInLocalTimezone({
              isoDate: surveyDiveDate,
              format: "MMM DD[,] YYYY",
              displayTimezone: false,
              timeZone: site?.timezone,
            })}`,
            variant: "subtitle2",
            marginRight: 0,
          },
        ];
      default:
        return [];
    }
  };

  return (
    <Box mt="1.5rem">
      <Grid
        direction={isMobile ? "column-reverse" : "row"}
        container
        justify="space-between"
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
              spotterPosition={liveData?.spotterPosition}
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
          {site && (
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
        justify="space-between"
        spacing={2}
      >
        {cards.map((Component, index) => (
          <Grid key={index.toString()} item xs={12} sm={6} md={3}>
            <div className={classes.card}>
              <LoadingSkeleton
                variant="rect"
                height="100%"
                loading={isLoading || !hasDailyData}
              >
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
      marginTop: "2rem",
    },
    forcedWidth: {
      width: `calc(100% + ${theme.spacing(2)}px)`,
      margin: -theme.spacing(1),
    },
    mobileMargin: {
      [theme.breakpoints.down("sm")]: {
        margin: theme.spacing(1, 0),
      },
    },
    metricsWrapper: {
      marginTop: "1rem",
    },
  })
);

interface SiteDetailsProps {
  site?: Site;
  selectedSurveyPointId?: string;
  featuredSurveyId?: number | null;
  hasDailyData: boolean;
  surveys: SurveyListItem[];
  featuredSurveyPoint?: SurveyPoint | null;
  surveyDiveDate?: string | null;
}

export default SiteDetails;
