import React, { FC } from "react";
import {
  Box,
  Card,
  createStyles,
  Grid,
  GridProps,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";
import { isNumber } from "lodash";

import {
  reefOceanSenseDataLoadingSelector,
  reefTimeSeriesDataLoadingSelector,
} from "../../../store/Reefs/selectedReefSlice";
import {
  HistoricalMonthlyMeanData,
  SofarValue,
  TimeSeries,
} from "../../../store/Reefs/types";
import { calculateCardMetrics } from "./helpers";
import { filterHistoricalMonthlyMeanData } from "../utils";
import { CardColumn, Dataset } from "./types";
import { formatNumber } from "../../../helpers/numberUtils";

const rows = ["MAX", "MEAN", "MIN"];

/* eslint-disable react/prop-types */
const TempAnalysis: FC<TempAnalysisProps> = ({
  classes,
  dataset,
  pickerStartDate,
  pickerEndDate,
  chartStartDate,
  chartEndDate,
  depth,
  dailyDataSst,
  spotterData,
  hoboBottomTemperature,
  oceanSenseData,
  oceanSenseUnit,
  columnJustification,
  historicalMonthlyMean,
  children,
}) => {
  const loading = useSelector(reefTimeSeriesDataLoadingSelector);
  const oceanSenseDataLoading = useSelector(reefOceanSenseDataLoadingSelector);

  const filteredHistoricalMonthlyMeanData = filterHistoricalMonthlyMeanData(
    historicalMonthlyMean,
    chartStartDate,
    chartEndDate
  );

  const hasHoboData = !!hoboBottomTemperature?.[1];
  const hasOceanSenseData = !!oceanSenseData?.[1];

  const hasSpotterBottom = !!spotterData?.bottomTemperature?.[1];
  const hasSpotterTop = !!spotterData?.topTemperature?.[1];
  const hasSpotterData = hasSpotterBottom || hasSpotterTop;
  const hasDailyData = !!dailyDataSst?.[1];

  const showCard =
    !loading &&
    (!oceanSenseData || !oceanSenseDataLoading) &&
    (hasHoboData || hasOceanSenseData || hasSpotterData || hasDailyData);

  if (!showCard) {
    return null;
  }
  const cardColumns: CardColumn[] = [
    {
      title: "HISTORIC",
      tooltip: "Historic long-term average of satellite surface temperature",
      key: "historic",
      color: "#d84424",
      rows: calculateCardMetrics(
        1,
        filteredHistoricalMonthlyMeanData,
        "historic"
      ),
      display: true,
    },
    {
      title: "HOBO",
      key: "hobo",
      color: "#f78c21",
      rows: calculateCardMetrics(2, hoboBottomTemperature, "hobo"),
      display: dataset === "hobo",
    },
    {
      title: "SENSOR",
      key: "oceanSense",
      color: "#f78c21",
      rows: calculateCardMetrics(2, oceanSenseData, "oceanSense"),
      display: dataset === "oceanSense",
    },
    {
      title: "BUOY 1m",
      key: "spotterTop",
      color: "#46a5cf",
      rows: calculateCardMetrics(2, spotterData?.topTemperature, "spotterTop"),
      display: dataset === "spotter",
    },
    {
      title: depth ? `BUOY ${depth}m` : "BUOY AT DEPTH",
      key: "spotterBottom",
      color: "#f78c21",
      rows: calculateCardMetrics(
        2,
        spotterData?.bottomTemperature,
        "spotterBottom"
      ),
      display: dataset === "spotter",
    },
    {
      title: "SST",
      key: "sst",
      color: "#6bc1e1",
      rows: calculateCardMetrics(2, dailyDataSst, "sst"),
      display: dataset === "sst",
    },
  ].filter((val) => isNumber(val.rows[0].value));
  const formattedpickerStartDate = moment(pickerStartDate).format("MM/DD/YYYY");
  const formattedpickerEndDate = moment(pickerEndDate).format("MM/DD/YYYY");

  return (
    <Box
      height="100%"
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
    >
      <Card className={classes.tempAnalysisCard}>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {formattedpickerStartDate} - {formattedpickerEndDate}
        </Typography>
        <Grid
          className={classes.metricsWrapper}
          container
          justify={columnJustification || "space-between"}
          alignItems="flex-end"
          spacing={1}
        >
          <Grid item>
            <Grid
              className={classes.metricsTitle}
              container
              direction="column"
              item
              spacing={3}
            >
              {rows.map((row) => (
                <Grid key={row} className={classes.rotatedText} item>
                  <Typography variant="caption" color="textSecondary">
                    {row}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          {cardColumns.map(
            (item) =>
              item.display && (
                <Grid key={item.key} item>
                  <Grid
                    className={classes.autoWidth}
                    container
                    direction="column"
                    item
                    spacing={3}
                    alignItems="center"
                  >
                    <Grid item>
                      <Tooltip title={item.tooltip || ""}>
                        <Typography
                          style={{
                            color: item.color,
                          }}
                          variant="subtitle2"
                        >
                          {item.title}
                        </Typography>
                      </Tooltip>
                    </Grid>
                    {item.rows.map(({ key, value }) => (
                      <Grid key={key} item>
                        <Typography
                          className={classes.values}
                          variant="h5"
                          color="textSecondary"
                        >
                          {formatNumber(value, 1)} {oceanSenseUnit || "°C"}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )
          )}
        </Grid>
      </Card>

      {children}
    </Box>
  );
};
const styles = (theme: Theme) =>
  createStyles({
    autoWidth: {
      width: "auto",
    },
    tempAnalysisCard: {
      padding: theme.spacing(2),
      minHeight: 240,
      borderRadius: "0 4px 4px 0",
      backgroundColor: "#f8f9f9",
      margin: "14px 0",
      // add horizontal scroll on mobile
      overflowX: "auto",
    },
    rotatedText: {
      transform: "rotate(-90deg)",
    },
    // ensures wrapping never happens no matter the column amount.
    metricsWrapper: { minWidth: "max-content" },
    metricsTitle: {
      position: "relative",
      bottom: 7,
      width: "auto",
    },
    values: {
      fontWeight: 300,
      // ensures metric numbers aren't too close together on mobile
      margin: "0 4px",
    },
  });

interface TempAnalysisProps
  extends TempAnalysisIncomingProps,
    WithStyles<typeof styles> {}

interface TempAnalysisIncomingProps {
  dataset: Dataset;
  pickerStartDate: string;
  pickerEndDate: string;
  chartStartDate: string;
  chartEndDate: string;
  depth: number | null;
  dailyDataSst: SofarValue[];
  spotterData: TimeSeries | undefined;
  hoboBottomTemperature: SofarValue[];
  oceanSenseData?: SofarValue[];
  oceanSenseUnit?: string;
  columnJustification?: GridProps["justify"];
  historicalMonthlyMean: HistoricalMonthlyMeanData[];
}

export default withStyles(styles)(TempAnalysis);
