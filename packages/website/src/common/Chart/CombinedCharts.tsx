import React, { ChangeEvent, useState } from "react";
import {
  Box,
  CircularProgress,
  createStyles,
  Grid,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

import ChartWithTooltip, { ChartWithTooltipProps } from "./ChartWithTooltip";
import SelectRange from "../SelectRange";
import DatePicker from "../Datepicker";
import { Range } from "../../store/Reefs/types";
import { reefSpotterDataLoadingSelector } from "../../store/Reefs/selectedReefSlice";

const CombinedCharts = ({
  reefId,
  depth,
  dailyData,
  surveys,
  temperatureThreshold,
  maxMonthlyMean,
  hasSpotterData,
  range,
  onRangeChange,
  onDateChange,
  pickerDate,
  spotterData,
  timeZone,
  startDate,
  endDate,
  chartPeriod,
  classes,
}: CombinedChartsProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const isSpotterDataLoading = useSelector(reefSpotterDataLoadingSelector);
  const hasSpotterDataSuccess =
    !isSpotterDataLoading &&
    spotterData &&
    spotterData.bottomTemperature.length > 1;
  const hasSpotterDataErrored = !isSpotterDataLoading && !hasSpotterDataSuccess;

  return (
    <div>
      <ChartWithTooltip
        reefId={reefId}
        depth={depth}
        dailyData={dailyData}
        surveys={surveys}
        temperatureThreshold={temperatureThreshold}
        maxMonthlyMean={maxMonthlyMean}
        background
        className={classes.chart}
        timeZone={timeZone}
      >
        <Typography className={classes.graphTitle} variant="h6">
          DAILY WATER TEMPERATURE (°C)
        </Typography>
      </ChartWithTooltip>
      {hasSpotterData && (
        <>
          <Grid container alignItems="baseline" spacing={3}>
            <SelectRange
              open={open}
              setOpen={setOpen}
              value={range}
              onRangeChange={onRangeChange}
            />
            <DatePicker value={pickerDate} onChange={onDateChange} />
          </Grid>
          {isSpotterDataLoading && (
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
          )}
          {hasSpotterDataSuccess && (
            <ChartWithTooltip
              className={classes.chart}
              reefId={reefId}
              dailyData={dailyData}
              spotterData={spotterData}
              startDate={startDate}
              endDate={endDate}
              chartPeriod={chartPeriod}
              surveys={[]}
              depth={depth}
              maxMonthlyMean={null}
              temperatureThreshold={null}
              background={false}
              timeZone={timeZone}
            >
              <Typography className={classes.graphTitle} variant="h6">
                HOURLY WATER TEMPERATURE (°C)
              </Typography>
            </ChartWithTooltip>
          )}
          {hasSpotterDataErrored && (
            <Box mt="2rem">
              <Typography>
                No Smart Buoy data available in this time range.
              </Typography>
            </Box>
          )}
        </>
      )}
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    chart: {
      height: "16rem",
      marginBottom: "3rem",
      marginTop: "1rem",
    },
    graphTitle: {
      lineHeight: 1.5,
      marginLeft: "4rem",

      [theme.breakpoints.down("xs")]: {
        marginLeft: 0,
      },
    },
  });

interface CombinedChartsIncomingProps extends ChartWithTooltipProps {
  hasSpotterData: boolean;
  range: Range;
  onRangeChange: (event: ChangeEvent<{ value: unknown }>) => void;
  onDateChange: (date: MaterialUiPickersDate, value?: string | null) => void;
  pickerDate: string | null;
  timeZone?: string | null;
}

CombinedCharts.defaultProps = {
  timeZone: null,
};

type CombinedChartsProps = CombinedChartsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CombinedCharts);
