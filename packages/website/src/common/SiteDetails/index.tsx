import React from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Theme,
  Box,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import classNames from "classnames";

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
import type { Site } from "../../store/Sites/types";
import { getMiddlePoint } from "../../helpers/map";
import { formatNumber } from "../../helpers/numberUtils";
import { SurveyListItem, SurveyPoint } from "../../store/Survey/types";
import { displayTimeInLocalTimezone, sortByDate } from "../../helpers/dates";
import { oceanSenseConfig } from "../../constants/oceanSenseConfig";
import WaterSamplingCard from "./WaterSampling";

const SiteDetails = ({
  classes,
  site,
  selectedSurveyPointId,
  featuredSurveyId,
  hasDailyData,
  surveys,
  featuredSurveyPoint,
  surveyDiveDate,
}: SiteDetailsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const [lng, lat] = getMiddlePoint(site.polygon);

  const { dailyData, liveData, maxMonthlyMean, videoStream } = site;

  const hasSondeData = Boolean(
    liveData?.latestData?.some((data) => data.source === "sonde")
  );

  const cards = [
    <Satellite liveData={liveData} maxMonthlyMean={maxMonthlyMean} />,
    <Sensor site={site} />,
    hasSondeData ? (
      <WaterSamplingCard siteId={site.id.toString()} />
    ) : (
      <CoralBleaching
        dailyData={sortByDate(dailyData, "date", "asc").slice(-1)[0]}
      />
    ),
    <Waves liveData={liveData} />,
  ];

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
              timeZone: site.timezone,
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
          className={classNames({
            [classes.mobileMargin]: !!videoStream,
          })}
          titleItems={mapTitleItems}
          gridProps={{ xs: 12, md: 6 }}
          forcedAspectRatio={!!videoStream}
        >
          <Map
            siteId={site.id}
            spotterPosition={site.liveData?.spotterPosition}
            polygon={site.polygon}
            surveyPoints={site.surveyPoints}
          />
        </CardWithTitle>

        <CardWithTitle
          className={classNames({
            [classes.mobileMargin]: !!videoStream,
          })}
          titleItems={featuredMediaTitleItems()}
          gridProps={{ xs: 12, md: 6 }}
          forcedAspectRatio={!!videoStream}
        >
          <FeaturedMedia
            siteId={site.id}
            url={videoStream}
            featuredImage={site.featuredImage}
            surveyId={featuredSurveyId}
          />
        </CardWithTitle>
      </Grid>

      {hasDailyData && (
        <>
          <Grid
            className={classes.metricsWrapper}
            container
            justify="space-between"
            spacing={2}
          >
            {cards.map((Component, index) => (
              <Grid key={index.toString()} item xs={12} sm={6} md={3}>
                {Component}
              </Grid>
            ))}
          </Grid>

          {oceanSenseConfig?.[site.id] && <OceanSenseMetrics />}

          <Box mt="2rem">
            <CombinedCharts
              site={site}
              selectedSurveyPointId={selectedSurveyPointId}
              surveys={surveys}
            />
            <Surveys site={site} />
          </Box>
        </>
      )}
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
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
  });

interface SiteDetailsIncomingProps {
  site: Site;
  selectedSurveyPointId?: string;
  featuredSurveyId?: number | null;
  hasDailyData: boolean;
  surveys: SurveyListItem[];
  featuredSurveyPoint?: SurveyPoint | null;
  surveyDiveDate?: string | null;
}

SiteDetails.defaultProps = {
  selectedSurveyPointId: undefined,
  featuredSurveyPoint: null,
  surveyDiveDate: null,
  featuredSurveyId: null,
};

type SiteDetailsProps = SiteDetailsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SiteDetails);
