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
  Tooltip,
} from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { reefTimeSeriesDataLoadingSelector } from "../../../store/Reefs/selectedReefSlice";
import {
  MonthlyMaxData,
  SofarValue,
  TimeSeries,
} from "../../../store/Reefs/types";
import { calculateCardMetrics } from "./helpers";
import { filterMaxMonthlyData } from "../utils";
import { CardColumn } from "./types";
import { formatNumber } from "../../../helpers/numberUtils";

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
  const loading = useSelector(reefTimeSeriesDataLoadingSelector);

  const filteredMaxMonthlyData = filterMaxMonthlyData(
    monthlyMax,
    chartStartDate,
    chartEndDate
  );

  const hasHoboData = !!hoboBottomTemperature?.[1];

  const hasSpotterBottom = !!spotterData?.bottomTemperature?.[1];
  const hasSpotterSurface = !!spotterData?.surfaceTemperature?.[1];
  const hasSpotterData = hasSpotterBottom || hasSpotterSurface;

  const showCard = !loading && (hasHoboData || hasSpotterData);

  if (!showCard) {
    return null;
  }

  const cardColumns: CardColumn[] = [
    {
      title: "HISTORIC",
      tooltip: "Historic long-term average of satellite surface temperature",
      key: "historic",
      color: "#d84424",
      rows: calculateCardMetrics(filteredMaxMonthlyData, "historic"),
    },
    {
      title: "HOBO",
      key: "hobo",
      color: "#f78c21",
      rows: calculateCardMetrics(hoboBottomTemperature, "hobo"),
    },
    {
      title: "BUOY 1m",
      key: "spotterSurface",
      color: "#46a5cf",
      rows: calculateCardMetrics(
        spotterData?.surfaceTemperature,
        "spotterSurface"
      ),
    },
    {
      title: depth ? `BUOY ${depth}m` : "BUOY AT DEPTH",
      key: "spotterBottom",
      color: "#f78c21",
      rows: calculateCardMetrics(
        spotterData?.bottomTemperature,
        "spotterBottom"
      ),
    },
  ];

  const rows = ["MAX", "MEAN", "MIN"];

  const formattedpickerStartDate = moment(pickerStartDate).format("MM/DD/YYYY");
  const formattedpickerEndDate = moment(pickerEndDate).format("MM/DD/YYYY");

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
          spacing={1}
        >
          <Grid item>
            <Grid
              className={classes.metrics}
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
          {cardColumns.map((item) => {
            if (!isNil(item.rows[0].value)) {
              return (
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
                          {formatNumber(value, 1)} °C
                        </Typography>
                      </Grid>
                    ))}
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
  spotterData: TimeSeries | undefined;
  hoboBottomTemperature: SofarValue[];
  monthlyMax: MonthlyMaxData[];
}

type TempAnalysisProps = TempAnalysisIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(TempAnalysis);
