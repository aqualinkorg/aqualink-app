import React, { ElementType } from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Theme,
  Box,
} from "@material-ui/core";
import classNames from "classnames";

import Map from "./Map";
import FeaturedMedia from "./FeaturedMedia";
import Satellite from "./Satellite";
import Sensor from "./Sensor";
import CoralBleaching from "./CoralBleaching";
import Waves from "./Waves";
import Surveys from "./Surveys";
import CardTitle, { Value } from "./CardTitle";
import CombinedCharts from "../Chart/CombinedCharts";
import type { Reef } from "../../store/Reefs/types";
import { getMiddlePoint } from "../../helpers/map";
import { formatNumber } from "../../helpers/numberUtils";
import { sortByDate } from "../../helpers/sortDailyData";
import { SurveyListItem, SurveyPoint } from "../../store/Survey/types";
import { displayTimeInLocalTimezone } from "../../helpers/dates";

const SiteDetails = ({
  classes,
  reef,
  closestSurveyPointId,
  featuredSurveyId,
  hasDailyData,
  surveys,
  featuredSurveyPoint,
  surveyDiveDate,
}: SiteDetailsProps) => {
  const [lng, lat] = getMiddlePoint(reef.polygon);

  const { dailyData, liveData, maxMonthlyMean, videoStream } = reef;
  const cards = [
    {
      Component: Satellite as ElementType,
      props: { liveData, maxMonthlyMean },
    },
    {
      Component: Sensor as ElementType,
      props: { reef },
    },
    {
      Component: CoralBleaching as ElementType,
      props: {
        dailyData: sortByDate(dailyData, "date").slice(-1)[0],
        maxMonthlyMean,
      },
    },
    {
      Component: Waves as ElementType,
      props: { liveData },
    },
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
          },
          {
            text: `${displayTimeInLocalTimezone({
              isoDate: surveyDiveDate,
              format: "MMM DD[,] YYYY",
              displayTimezone: false,
              timeZone: reef.timezone,
            })}`,
            variant: "subtitle2",
            marginRight: 0,
          },
        ];
      case !!videoStream:
        return [
          {
            text: "LIVE VIDEO",
            marginRight: 0,
            variant: "h6",
          },
        ];
      default:
        return [];
    }
  };

  const featuredMediaTitle = featuredMediaTitleItems();

  return (
    <Box mt="1.5rem">
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        spacing={videoStream ? 0 : 2}
        className={classNames({
          [classes.forcedWidth]: !!videoStream,
        })}
      >
        <Grid container item xs={12} md={6}>
          <Grid item>
            <CardTitle values={mapTitleItems} />
          </Grid>
          <Grid
            item
            xs={12}
            className={classNames({
              [classes.forcedAspectRatioWrapper]: !!videoStream,
            })}
          >
            <div
              className={
                videoStream
                  ? classes.absolutePositionedContainer
                  : classes.container
              }
            >
              <Map
                reefId={reef.id}
                spotterPosition={reef.liveData?.spotterPosition}
                polygon={reef.polygon}
                surveyPoints={reef.surveyPoints}
              />
            </div>
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={12}
          md={6}
          className={classNames({ [classes.mediaWrapper]: !!videoStream })}
        >
          {featuredMediaTitle.length > 0 && (
            <Grid item>
              <CardTitle values={featuredMediaTitle} />
            </Grid>
          )}
          <Grid
            item
            xs={12}
            className={classNames({
              [classes.forcedAspectRatioWrapper]: !!videoStream,
            })}
          >
            <div
              className={
                videoStream
                  ? classes.absolutePositionedContainer
                  : classes.container
              }
            >
              <FeaturedMedia
                reefId={reef.id}
                url={videoStream}
                featuredImage={reef.featuredImage}
                surveyId={featuredSurveyId}
              />
            </div>
          </Grid>
        </Grid>
      </Grid>

      {hasDailyData && (
        <>
          <Grid
            className={classes.metricsWrapper}
            container
            justify="space-between"
            spacing={2}
          >
            {cards.map(({ Component, props }, index) => (
              <Grid key={index.toString()} item xs={12} sm={6} md={3}>
                <Component {...props} />
              </Grid>
            ))}
          </Grid>

          <Box mt="2rem">
            <CombinedCharts
              reef={reef}
              closestSurveyPointId={closestSurveyPointId}
              surveys={surveys}
            />
            <Surveys reef={reef} />
          </Box>
        </>
      )}
    </Box>
  );
};

const styles = (theme: Theme) => {
  const aspectRatio = "16 * 9";

  return createStyles({
    root: {
      marginTop: "2rem",
    },
    forcedWidth: {
      width: `calc(100% + ${theme.spacing(2)}px)`,
      margin: -theme.spacing(1),
    },
    container: {
      height: "30rem",
      [theme.breakpoints.between("md", 1440)]: {
        height: "25rem",
      },
      [theme.breakpoints.down("xs")]: {
        height: "20rem",
      },
    },
    mediaWrapper: {
      [theme.breakpoints.down("sm")]: {
        marginTop: theme.spacing(1),
      },
    },
    forcedAspectRatioWrapper: {
      paddingTop: `calc((100% - ${theme.spacing(
        2
      )}px) / ${aspectRatio} + ${theme.spacing(2)}px)`,
      marginTop: -theme.spacing(1),
      position: "relative",
    },
    absolutePositionedContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      padding: theme.spacing(1),
      width: "100%",
      height: "100%",
    },
    metricsWrapper: {
      marginTop: "1rem",
    },
  });
};

interface SiteDetailsIncomingProps {
  reef: Reef;
  closestSurveyPointId: string | undefined;
  featuredSurveyId?: number | null;
  hasDailyData: boolean;
  surveys: SurveyListItem[];
  featuredSurveyPoint?: SurveyPoint | null;
  surveyDiveDate?: string | null;
}

SiteDetails.defaultProps = {
  featuredSurveyPoint: null,
  surveyDiveDate: null,
  featuredSurveyId: null,
};

type SiteDetailsProps = SiteDetailsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SiteDetails);
