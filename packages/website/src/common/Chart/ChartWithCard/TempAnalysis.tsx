import React from "react";
import {
  Box,
  Card,
  Grid,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";

import {
  reefHoboDataLoadingSelector,
  reefSpotterDataLoadingSelector,
} from "../../../store/Reefs/selectedReefSlice";
import {
  MonthlyMaxData,
  SofarValue,
  SpotterData,
} from "../../../store/Reefs/types";
import { calculateCardMetrics } from "./helpers";
import { filterMaxMonthlyData } from "../utils";

const TempAnalysis = ({
  pickerStartDate,
  pickerEndDate,
  chartStartDate,
  chartEndDate,
  depth,
  spotterData,
  hoboBottomTemperature,
  monthlyMax,
  classes,
}: TempAnalysisProps) => {
  const spotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const hoboDataLoading = useSelector(reefHoboDataLoadingSelector);

  const loading = spotterDataLoading || hoboDataLoading;

  const filteredMaxMonthlyData = filterMaxMonthlyData(
    monthlyMax,
    chartStartDate,
    chartEndDate
  );

  const hasHoboData = hoboBottomTemperature.length > 1;
  const hasSpotterSurface =
    spotterData && spotterData.surfaceTemperature.length > 1;
  const hasSpotterBottom =
    spotterData && spotterData.bottomTemperature.length > 1;
  const hasSpotterData = hasSpotterBottom || hasSpotterSurface;

  const showCard = !loading && (hasHoboData || hasSpotterData);

  const {
    maxMonthlyMax,
    meanMonthlyMax,
    minMonthlyMax,
    maxSpotterBottom,
    meanSpotterBottom,
    minSpotterBottom,
    maxSpotterSurface,
    meanSpotterSurface,
    minSpotterSurface,
    maxHoboBottom,
    meanHoboBottom,
    minHoboBottom,
  } = calculateCardMetrics(
    filteredMaxMonthlyData,
    spotterData,
    hoboBottomTemperature
  );

  const cardColumns = [
    {
      title: "HISTORIC",
      titleClass: classes.historicText,
      rows: {
        max: maxMonthlyMax,
        mean: meanMonthlyMax,
        min: minMonthlyMax,
      },
      display: hasSpotterData || hasHoboData,
    },
    {
      title: "BUOY 1m",
      titleClass: classes.buoySurfaceText,
      rows: {
        max: maxSpotterSurface,
        mean: meanSpotterSurface,
        min: minSpotterSurface,
      },
      display: hasSpotterSurface,
    },
    {
      title: depth ? `BUOY ${depth}m` : "BUOY AT DEPTH",
      titleClass: classes.buoyBottomText,
      rows: {
        max: maxSpotterBottom,
        mean: meanSpotterBottom,
        min: minSpotterBottom,
      },
      display: hasSpotterBottom,
    },
    {
      title: "HOBO",
      titleClass: classes.hoboText,
      rows: {
        max: maxHoboBottom,
        mean: meanHoboBottom,
        min: minHoboBottom,
      },
      display: hasHoboData,
    },
  ];

  const formattedpickerStartDate = moment(pickerStartDate).format("MM/DD/YYYY");
  const formattedpickerEndDate = moment(pickerEndDate).format("MM/DD/YYYY");

  if (!showCard) {
    return null;
  }

  return (
    <Box overflow="auto">
      <Card
        className={`${classes.tempAnalysisCard} ${
          hasSpotterData ? classes.scroll : ""
        }`}
      >
        <Typography variant="subtitle1" color="textSecondary">
          TEMP ANALYSIS
        </Typography>
        <Typography className={classes.dates} variant="subtitle2">
          {formattedpickerStartDate} - {formattedpickerEndDate}
        </Typography>
        <Grid
          className={classes.metricsWrapper}
          container
          justify="space-between"
          alignItems="flex-end"
          spacing={2}
        >
          <Grid item>
            <Grid
              className={classes.metrics}
              container
              direction="column"
              item
              spacing={3}
            >
              <Grid className={classes.rotatedText} item>
                <Typography variant="caption" color="textSecondary">
                  MAX
                </Typography>
              </Grid>
              <Grid className={classes.rotatedText} item>
                <Typography variant="caption" color="textSecondary">
                  MEAN
                </Typography>
              </Grid>
              <Grid className={classes.rotatedText} item>
                <Typography variant="caption" color="textSecondary">
                  MIN
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {cardColumns.map((item) => {
            if (item.display) {
              return (
                <Grid key={item.title} item>
                  <Grid
                    className={classes.autoWidth}
                    container
                    direction="column"
                    item
                    spacing={3}
                  >
                    <Grid item>
                      <Typography
                        className={item.titleClass}
                        variant="subtitle2"
                      >
                        {item.title}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        className={classes.values}
                        variant="h5"
                        color="textSecondary"
                      >
                        {item.rows.max} °C
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        className={classes.values}
                        variant="h5"
                        color="textSecondary"
                      >
                        {item.rows.mean} °C
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        className={classes.values}
                        variant="h5"
                        color="textSecondary"
                      >
                        {item.rows.min} °C
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              );
            }
            return null;
          })}
        </Grid>
      </Card>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    autoWidth: {
      width: "auto",
    },
    tempAnalysisCard: {
      padding: 16,
      height: 250,
      borderRadius: "0 4px 4px 0",
      backgroundColor: "#f8f9f9",
      marginTop: 22,
    },
    scroll: {
      [theme.breakpoints.down("xs")]: {
        width: 400,
        marginLeft: "auto",
        marginRight: "auto",
      },
    },
    dates: {
      color: "#979797",
    },
    rotatedText: {
      transform: "rotate(-90deg)",
    },
    metricsWrapper: {
      height: "85%",
    },
    metrics: {
      position: "relative",
      bottom: 7,
      width: "auto",
    },
    historicText: {
      color: "#d84424",
      lineHeight: "17px",
    },
    buoyBottomText: {
      color: "#f78c21",
      lineHeight: "17px",
    },
    buoySurfaceText: {
      color: "#46a5cf",
      lineHeight: "17px",
    },
    hoboText: {
      color: "#f78c21",
      lineHeight: "17px",
    },
    values: {
      fontWeight: 300,
    },
  });

interface TempAnalysisIncomingProps {
  pickerStartDate: string;
  pickerEndDate: string;
  chartStartDate: string;
  chartEndDate: string;
  depth: number | null;
  spotterData: SpotterData | null | undefined;
  hoboBottomTemperature: SofarValue[];
  monthlyMax: MonthlyMaxData[];
}

type TempAnalysisProps = TempAnalysisIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(TempAnalysis);
