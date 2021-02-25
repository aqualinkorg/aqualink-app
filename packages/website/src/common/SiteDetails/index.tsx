import React, { ElementType, ChangeEvent } from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Theme,
  Box,
} from "@material-ui/core";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

import Map from "./Map";
import FeaturedMedia from "./FeaturedMedia";
import Satellite from "./Satellite";
import Sensor from "./Sensor";
import CoralBleaching from "./CoralBleaching";
import Waves from "./Waves";
import Surveys from "./Surveys";
import CardTitle, { Value } from "./CardTitle";
import CombinedCharts from "../Chart/CombinedCharts";
import type { Range, Reef, SpotterData } from "../../store/Reefs/types";
import { locationCalculator } from "../../helpers/locationCalculator";
import { formatNumber } from "../../helpers/numberUtils";
import { sortByDate } from "../../helpers/sortDailyData";
import { SurveyListItem, SurveyPoint } from "../../store/Survey/types";
import {
  convertDailyDataToLocalTime,
  convertSpotterDataToLocalTime,
  convertSurveyDataToLocalTime,
  convertToLocalTime,
  displayTimeInLocalTimezone,
} from "../../helpers/dates";

const SiteDetails = ({
  classes,
  reef,
  featuredSurveyId,
  startDate,
  endDate,
  range,
  pickerDate,
  hasSpotterData,
  chartPeriod,
  spotterData,
  hasDailyData,
  surveys,
  surveyPoint,
  surveyDiveDate,
  onRangeChange,
  onDateChange,
}: SiteDetailsProps) => {
  const [lng, lat] = locationCalculator(reef.polygon);

  const { dailyData, liveData, maxMonthlyMean } = reef;
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
      text: `${surveyPoint?.name}`,
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
      {(!surveyDiveDate || !surveyPoint) && (
        <CardTitle values={mapTitleItems} />
      )}

      <Grid container justify="space-between" spacing={2}>
        <Grid item xs={12} md={6}>
          {surveyDiveDate && surveyPoint && (
            <CardTitle values={mapTitleItems} />
          )}
          <div className={classes.container}>
            <Map
              reefId={reef.id}
              spotterPosition={reef.liveData?.spotterPosition}
              polygon={reef.polygon}
              surveyPoints={reef.surveyPoints}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          {surveyDiveDate && surveyPoint && (
            <CardTitle values={featuredMediaTitleItems} />
          )}
          <div className={classes.container}>
            <FeaturedMedia
              reefId={reef.id}
              url={reef.videoStream}
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
              reefId={reef.id}
              dailyData={convertDailyDataToLocalTime(
                reef.dailyData,
                reef.timezone
              )}
              depth={reef.depth}
              hasSpotterData={hasSpotterData}
              maxMonthlyMean={reef.maxMonthlyMean || null}
              temperatureThreshold={
                reef.maxMonthlyMean ? reef.maxMonthlyMean + 1 : null
              }
              onDateChange={onDateChange}
              onRangeChange={onRangeChange}
              pickerDate={pickerDate}
              range={range}
              surveys={convertSurveyDataToLocalTime(surveys, reef.timezone)}
              chartPeriod={chartPeriod}
              spotterData={
                spotterData
                  ? convertSpotterDataToLocalTime(spotterData, reef.timezone)
                  : { bottomTemperature: [], surfaceTemperature: [] }
              }
              startDate={convertToLocalTime(startDate, reef.timezone)}
              endDate={convertToLocalTime(endDate, reef.timezone)}
              timeZone={reef.timezone}
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
    metricsWrapper: {
      marginTop: "1rem",
    },
  });

interface SiteDetailsIncomingProps {
  reef: Reef;
  featuredSurveyId?: number | null;
  startDate: string;
  endDate: string;
  pickerDate: string;
  range: Range;
  chartPeriod: "hour" | Range;
  hasSpotterData: boolean;
  hasDailyData: boolean;
  surveys: SurveyListItem[];
  spotterData?: SpotterData | null;
  surveyPoint?: SurveyPoint | null;
  surveyDiveDate?: string | null;
  onRangeChange: (event: ChangeEvent<{ value: unknown }>) => void;
  onDateChange: (date: MaterialUiPickersDate, value?: string | null) => void;
}

SiteDetails.defaultProps = {
  surveyPoint: null,
  surveyDiveDate: null,
  spotterData: null,
  featuredSurveyId: null,
};

type SiteDetailsProps = SiteDetailsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SiteDetails);
