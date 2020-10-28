/* eslint-disable no-nested-ternary */
import React, { ElementType, ChangeEvent, useState } from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Theme,
  Box,
  CircularProgress,
} from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";

import Map from "./Map";
import FeaturedMedia from "./FeaturedMedia";
import Satellite from "./Satellite";
import Sensor from "./Sensor";
import CoralBleaching from "./CoralBleaching";
import Waves from "./Waves";
import Charts from "./Charts";
import Surveys from "./Surveys";
import CardTitle, { Value } from "./CardTitle";
import SelectRange from "../../../common/SelectRange";
import type { Range, Reef, SpotterData } from "../../../store/Reefs/types";
import { reefspotterDataLoadingSelector } from "../../../store/Reefs/selectedReefSlice";
import { locationCalculator } from "../../../helpers/locationCalculator";
import { formatNumber } from "../../../helpers/numberUtils";
import { sortByDate } from "../../../helpers/sortDailyData";
import { SurveyListItem, SurveyPoint } from "../../../store/Survey/types";
import { filterData } from "../../../common/Chart/utils";

const ReefDetails = ({
  classes,
  reef,
  startDate,
  endDate,
  range,
  onRangeChange,
  hasSpotter,
  chartPeriod,
  spotterData,
  hasDailyData,
  surveys,
  point,
  diveDate,
}: ReefDetailProps) => {
  const [lng, lat] = locationCalculator(reef.polygon);
  const [open, setOpen] = useState<boolean>(false);
  const spotterDataLoading = useSelector(reefspotterDataLoadingSelector);

  const filteredDailyData = filterData(startDate, endDate, reef.dailyData);

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
      text: "LOCATION:",
      variant: "h6",
      marginRight: "2rem",
    },
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
      text: "SURVEY DATE:",
      variant: "h6",
      marginRight: "0.5rem",
    },
    {
      text: `${moment(moment(diveDate).toISOString()).format("MM/DD/YYYY")}`,
      variant: "subtitle2",
      marginRight: "2rem",
    },
    {
      text: "SURVEY POINT:",
      variant: "h6",
      marginRight: "0.5rem",
    },
    {
      text: `${point?.name}`,
      variant: "subtitle2",
      marginRight: 0,
    },
  ];

  return (
    <Box mt="1rem">
      {(!diveDate || !point) && <CardTitle values={mapTitleItems} />}

      <Grid container justify="space-between" spacing={4}>
        <Grid item xs={12} md={6}>
          {diveDate && point && <CardTitle values={mapTitleItems} />}
          <div className={classes.container}>
            <Map polygon={reef.polygon} />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          {diveDate && point && <CardTitle values={featuredMediaTitleItems} />}
          <div className={classes.container}>
            <FeaturedMedia
              url={reef.videoStream}
              featuredImage={reef.featuredImage}
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
            spacing={4}
          >
            {cards.map(({ Component, props }, index) => (
              <Grid key={index.toString()} item xs={12} sm={6} md={3}>
                <Component {...props} />
              </Grid>
            ))}
          </Grid>

          <Box mt="2rem">
            <Charts
              title="DAILY WATER TEMPERATURE (°C)"
              dailyData={reef.dailyData}
              surveys={surveys}
              depth={reef.depth}
              maxMonthlyMean={reef.maxMonthlyMean || null}
              temperatureThreshold={
                reef.maxMonthlyMean ? reef.maxMonthlyMean + 1 : null
              }
              background
            />
            {hasSpotter && (
              <SelectRange
                width={12}
                open={open}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                value={range}
                onRangeChange={onRangeChange}
              />
            )}
            {spotterDataLoading ? (
              <Box
                height="20rem"
                display="flex"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                p={4}
              >
                <CircularProgress size="6rem" thickness={1} />
              </Box>
            ) : spotterData ? (
              <Charts
                title="HOURLY WATER TEMPERATURE (°C)"
                dailyData={filteredDailyData}
                spotterData={spotterData}
                startDate={startDate}
                endDate={endDate}
                chartPeriod={chartPeriod}
                surveys={[]}
                depth={reef.depth}
                maxMonthlyMean={null}
                temperatureThreshold={null}
                background={false}
              />
            ) : null}
            <Surveys reefId={reef.id} />
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

interface ReefDetailIncomingProps {
  reef: Reef;
  startDate: string;
  endDate: string;
  range: Range;
  chartPeriod: "hour" | Range;
  onRangeChange: (event: ChangeEvent<{ value: unknown }>) => void;
  hasSpotter: boolean;
  hasDailyData: boolean;
  surveys: SurveyListItem[];
  spotterData?: SpotterData | null;
  point?: SurveyPoint | null;
  diveDate?: string | null;
}

ReefDetails.defaultProps = {
  point: null,
  diveDate: null,
  spotterData: null,
};

type ReefDetailProps = ReefDetailIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ReefDetails);
