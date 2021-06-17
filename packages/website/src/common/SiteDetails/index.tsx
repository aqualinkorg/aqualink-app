import React, { ElementType } from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Theme,
  Box,
} from "@material-ui/core";

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

  const featuredMediaTitleItems: Value[] = [
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

  return (
    <Box mt="1rem">
      {(!surveyDiveDate || !featuredSurveyPoint) && (
        <CardTitle values={mapTitleItems} />
      )}

      <Grid container justify="space-between" spacing={2}>
        <Grid
          item
          xs={12}
          md={6}
          className={videoStream ? classes.featuredWrapper : ""}
        >
          {!videoStream && surveyDiveDate && featuredSurveyPoint && (
            <CardTitle values={mapTitleItems} />
          )}
          <div
            className={videoStream ? classes.videoContainer : classes.container}
          >
            <Map
              reefId={reef.id}
              spotterPosition={reef.liveData?.spotterPosition}
              polygon={reef.polygon}
              surveyPoints={reef.surveyPoints}
            />
          </div>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          className={videoStream ? classes.featuredWrapper : ""}
        >
          {!videoStream && surveyDiveDate && featuredSurveyPoint && (
            <CardTitle values={featuredMediaTitleItems} />
          )}
          <div
            className={videoStream ? classes.videoContainer : classes.container}
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

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: "2rem",
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
    featuredWrapper: {
      padding: "0 !important",
      paddingTop: "calc((50% - 16px) / 16 * 9 + 16px) !important",
      position: "relative",
      [theme.breakpoints.down(960)]: {
        paddingTop: "calc((100% - 16px) / 16 * 9 + 16px) !important",
      },
    },
    videoContainer: {
      position: "absolute",
      top: "0px",
      left: "0px",
      padding: "8px",
      width: "100%",
      height: "100%",
    },
    metricsWrapper: {
      marginTop: "1rem",
    },
  });

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
