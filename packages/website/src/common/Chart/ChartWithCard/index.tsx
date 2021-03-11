/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

import Chart from "./Chart";
import TempAnalysis from "./TempAnalysis";
import {
  reefHoboDataRangeSelector,
  reefHoboDataRequest,
  reefHoboDataSelector,
  reefSpotterDataRequest,
  reefSpotterDataSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { Reef } from "../../../store/Reefs/types";
import {
  findMarginalDate,
  setTimeZone,
  subtractFromDate,
  isBefore,
  generateMonthlyMaxTimestamps,
} from "../../../helpers/dates";
import {
  filterDailyData,
  filterHoboData,
  filterMaxMonthlyData,
} from "../utils";
import { RangeValue } from "./types";
import ViewRange from "./ViewRange";

const ChartWithCard = ({
  reef,
  pointId,
  title,
  classes,
}: ChartWithCardProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const dispatch = useDispatch();
  const spotterData = useSelector(reefSpotterDataSelector);
  const { bottomTemperature: hoboBottomTemperature } =
    useSelector(reefHoboDataSelector) || {};
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefHoboDataRangeSelector) || {};
  const hasSpotterData = Boolean(reef.liveData.surfaceTemperature);
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pastLimit, setPastLimit] = useState<string>();
  const [pickerError, setPickerError] = useState(false);
  const [range, setRange] = useState<RangeValue>("three_months");

  const today = new Date(moment().format("MM/DD/YYYY")).toISOString();

  // Set pickers dates
  useEffect(() => {
    const { maxDate } =
      (hoboBottomTemperatureRange && hoboBottomTemperatureRange[0]) || {};
    const localizedMaxDate = new Date(
      moment(maxDate)
        .tz(reef.timezone || "UTC")
        .format("MM/DD/YYYY")
    ).toISOString();
    const pastThreeMonths = subtractFromDate(localizedMaxDate, "month", 3);
    setPickerEndDate(localizedMaxDate);
    setPickerStartDate(pastThreeMonths);
    setPastLimit(pastThreeMonths);
  }, [hoboBottomTemperatureRange, reef.timezone]);

  // Get spotter data
  useEffect(() => {
    if (
      pickerStartDate &&
      pickerEndDate &&
      isBefore(pickerStartDate, pickerEndDate)
    ) {
      const reefLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        reef.timezone
      ) as string;

      const reefLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        reef.timezone
      ) as string;

      if (hasSpotterData) {
        dispatch(
          reefSpotterDataRequest({
            id: `${reef.id}`,
            startDate: reefLocalStartDate,
            endDate: reefLocalEndDate,
          })
        );
      }
    }
  }, [
    dispatch,
    hasSpotterData,
    pickerEndDate,
    pickerStartDate,
    reef.id,
    reef.timezone,
  ]);

  // Fetch HOBO data if picker start date is before the current past limit
  useEffect(() => {
    if (
      pointId &&
      pickerStartDate &&
      pickerEndDate &&
      isBefore(pickerStartDate, pickerEndDate) &&
      pastLimit &&
      hoboBottomTemperatureRange &&
      hoboBottomTemperatureRange.length > 0
    ) {
      const { minDate } = hoboBottomTemperatureRange[0];
      const reefLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        reef.timezone
      ) as string;
      const reefLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        reef.timezone
      ) as string;

      if (
        new Date(pickerStartDate).getTime() < new Date(pastLimit).getTime() &&
        new Date(pastLimit).getTime() > new Date(minDate).getTime()
      ) {
        setPastLimit(pickerStartDate);
        dispatch(
          reefHoboDataRequest({
            reefId: `${reef.id}`,
            pointId,
            start: reefLocalStartDate,
            end: reefLocalEndDate,
            metrics: ["bottom_temperature"],
          })
        );
      }
    }
  }, [
    dispatch,
    hoboBottomTemperatureRange,
    pastLimit,
    pickerEndDate,
    pickerStartDate,
    pointId,
    reef.id,
    reef.timezone,
  ]);

  // Set chart start/end dates
  useEffect(() => {
    const maxMonthlyData = generateMonthlyMaxTimestamps(
      reef.monthlyMax,
      pickerStartDate,
      pickerEndDate
    );
    const filteredMaxMonthlyData = filterMaxMonthlyData(
      maxMonthlyData,
      pickerStartDate,
      pickerEndDate
    );
    const filteredDailyData = filterDailyData(
      reef.dailyData,
      pickerStartDate,
      pickerEndDate
    );
    const filteredHoboData = filterHoboData(
      hoboBottomTemperature || [],
      pickerStartDate,
      pickerEndDate
    );
    if (
      filteredMaxMonthlyData.length > 0 ||
      filteredDailyData.length > 0 ||
      (spotterData && spotterData.bottomTemperature.length > 0) ||
      filteredHoboData.length > 0
    ) {
      const maxDataDate = new Date(
        findMarginalDate(
          filteredMaxMonthlyData,
          filteredDailyData,
          spotterData,
          filteredHoboData
        )
      );
      const minDataDate = new Date(
        findMarginalDate(
          filteredMaxMonthlyData,
          filteredDailyData,
          spotterData,
          filteredHoboData,
          "min"
        )
      );
      const reefLocalEndDate = new Date(
        setTimeZone(
          new Date(moment(pickerEndDate).format("MM/DD/YYYY")),
          reef?.timezone
        ) as string
      );
      const reefLocalStartDate = new Date(
        setTimeZone(
          new Date(moment(pickerStartDate).format("MM/DD/YYYY")),
          reef?.timezone
        ) as string
      );

      if (maxDataDate.getTime() > reefLocalEndDate.getTime()) {
        setEndDate(reefLocalEndDate.toISOString());
      } else {
        setEndDate(maxDataDate.toISOString());
      }

      if (minDataDate.getTime() > reefLocalStartDate.getTime()) {
        setStartDate(minDataDate.toISOString());
      } else {
        setStartDate(reefLocalStartDate.toISOString());
      }
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [
    hoboBottomTemperature,
    pickerEndDate,
    pickerStartDate,
    reef,
    spotterData,
  ]);

  // Set picker error
  useEffect(() => {
    if (pickerStartDate && pickerEndDate) {
      setPickerError(!isBefore(pickerStartDate, pickerEndDate));
    }
  }, [pickerEndDate, pickerStartDate]);

  const onRangeChange = (value: RangeValue) => {
    const { minDate, maxDate } =
      (hoboBottomTemperatureRange && hoboBottomTemperatureRange[0]) || {};
    const localizedMinDate = new Date(
      moment(minDate)
        .tz(reef.timezone || "UTC")
        .format("MM/DD/YYYY")
    ).toISOString();
    const localizedMaxDate = new Date(
      moment(maxDate)
        .tz(reef.timezone || "UTC")
        .format("MM/DD/YYYY")
    ).toISOString();
    setRange(value);
    switch (value) {
      case "three_months":
        setPickerEndDate(localizedMaxDate);
        setPickerStartDate(subtractFromDate(localizedMaxDate, "month", 3));
        break;
      case "one_year":
        setPickerEndDate(localizedMaxDate);
        setPickerStartDate(subtractFromDate(localizedMaxDate, "year"));
        break;
      case "max":
        setPickerEndDate(localizedMaxDate);
        setPickerStartDate(localizedMinDate);
        break;
      default:
        break;
    }
  };

  return (
    <Container className={classes.chartWithRange}>
      <ViewRange
        range={range}
        onRangeChange={onRangeChange}
        disableMaxRange={
          !hoboBottomTemperatureRange || hoboBottomTemperatureRange.length === 0
        }
        title={title}
      />
      <Grid
        className={classes.chartWrapper}
        container
        justify="space-between"
        item
        spacing={1}
      >
        <Grid
          item
          xs={12}
          md={hasSpotterData ? 12 : 8}
          lg={hasSpotterData ? 8 : 9}
        >
          <Chart
            reef={reef}
            pointId={pointId ? parseInt(pointId, 10) : undefined}
            spotterData={spotterData}
            hoboBottomTemperature={filterHoboData(
              hoboBottomTemperature || [],
              startDate || pickerStartDate,
              endDate || pickerEndDate
            )}
            pickerStartDate={pickerStartDate || subtractFromDate(today, "week")}
            pickerEndDate={pickerEndDate || today}
            startDate={
              startDate || pickerStartDate || subtractFromDate(today, "week")
            }
            endDate={endDate || pickerEndDate || today}
            onStartDateChange={(date) => {
              setPickerStartDate(
                new Date(moment(date).format("MM/DD/YYYY")).toISOString()
              );
              setRange("custom");
            }}
            onEndDateChange={(date) => {
              setPickerEndDate(
                new Date(moment(date).format("MM/DD/YYYY")).toISOString()
              );
              setRange("custom");
            }}
            error={pickerError}
          />
        </Grid>
        {!pickerError && (
          <Grid
            item
            xs={12}
            md={hasSpotterData ? 12 : 4}
            lg={hasSpotterData ? 4 : 3}
          >
            <Grid
              container
              justify={isDesktop && !hasSpotterData ? "flex-end" : "center"}
            >
              <Grid
                item
                xs={hasSpotterData ? 12 : 11}
                sm={hasSpotterData ? 10 : 6}
                md={hasSpotterData ? 6 : 10}
                lg={hasSpotterData ? 12 : 11}
              >
                <TempAnalysis
                  pickerStartDate={
                    pickerStartDate || subtractFromDate(today, "week")
                  }
                  pickerEndDate={pickerEndDate || today}
                  chartStartDate={
                    startDate ||
                    pickerStartDate ||
                    subtractFromDate(today, "week")
                  }
                  chartEndDate={endDate || pickerEndDate || today}
                  depth={reef.depth}
                  spotterData={spotterData}
                  hoboBottomTemperature={filterHoboData(
                    hoboBottomTemperature || [],
                    startDate || pickerStartDate,
                    endDate || pickerEndDate
                  )}
                  monthlyMax={generateMonthlyMaxTimestamps(
                    reef.monthlyMax,
                    startDate,
                    endDate,
                    reef.timezone
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    chartWithRange: {
      marginTop: 80,
    },
    chartWrapper: {
      marginBottom: 20,
      [theme.breakpoints.down("xs")]: {
        marginBottom: 10,
      },
    },
  });

interface ChartWithCardIncomingProps {
  reef: Reef;
  pointId: string | undefined;
  title?: string;
}

ChartWithCard.defaultProps = {
  title: "",
};

type ChartWithCardProps = ChartWithCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ChartWithCard);
