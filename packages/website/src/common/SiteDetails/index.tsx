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
  LatestDataASSofarValue,
  LatestData,
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
  forecastDataRequest,
  forecastDataSelector,
  latestDataRequest,
  latestDataSelector,
  liveDataRequest,
  liveDataSelector,
  unsetForecastData,
  unsetLatestData,
  unsetLiveData,
} from "../../store/Sites/selectedSiteSlice";
import { parseLatestData } from "../../store/Sites/helpers";

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
  const [latestDataAsSofarValues, setLatestDataAsSofarValues] =
    useState<LatestDataASSofarValue>({});
  const [hasSondeData, setHasSondeData] = useState<boolean>(false);
  const [hastSpotterData, setHasSpotterData] = useState<boolean>(false);
  const latestData = useSelector(latestDataSelector);
  const forecastData = useSelector(forecastDataSelector);
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
      dispatch(unsetForecastData());
    };
  }, [dispatch]);

  useEffect(() => {
    if (latestData) {
      setLatestDataAsSofarValues(parseLatestData(latestData));
      const validMetrics: LatestData["metric"][] = [
        "wind_direction",
        "significant_wave_height",
        "wind_direction",
        "wave_mean_direction",
        "wave_mean_period",
      ];
      const latestWindWaveInformation = latestData.find((x) =>
        validMetrics.includes(x.metric)
      );
      const now = new Date();
      const twelveHoursEarlier = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      if (
        site &&
        (latestWindWaveInformation?.timestamp || "") <
          twelveHoursEarlier.toISOString()
      ) {
        if (!forecastData) {
          dispatch(forecastDataRequest(String(site.id)));
        }
        setHasSpotterData(false);
      } else {
        setHasSpotterData(true);
      }
    }
    setHasSondeData(
      Boolean(latestData?.some((data) => data.source === "sonde"))
    );
  }, [dispatch, forecastData, latestData, site]);

  useEffect(() => {
    if (forecastData && !hastSpotterData) {
      const newDate = {
        ...latestDataAsSofarValues,
        significantWaveHeight: forecastData.significantWaveHeight,
        waveMeanDirection: forecastData.waveMeanDirection,
        waveMeanPeriod: forecastData.waveMeanPeriod,
        windDirection: forecastData.windDirection,
        windSpeed: forecastData.windSpeed,
      } as LatestDataASSofarValue;
      setLatestDataAsSofarValues(newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastData, hastSpotterData]);

  const { videoStream } = site || {};

  const cards =
    site && latestData
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
          hasSondeData ? (
            <WaterSamplingCard siteId={site.id.toString()} />
          ) : (
            <CoralBleaching
              dailyData={sortByDate(site.dailyData, "date", "asc").slice(-1)[0]}
            />
          ),
          <Waves data={latestDataAsSofarValues} hasSpotter={hastSpotterData} />,
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
