import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  withStyles,
  WithStyles,
  createStyles,
} from "@material-ui/core";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

import Chart from "./Chart";
import TempAnalysis from "./TempAnalysis";
import {
  reefSpotterDataRequest,
  reefSpotterDataSelector,
} from "../../../../store/Reefs/selectedReefSlice";
import { Reef } from "../../../../store/Reefs/types";
import { setTimeZone, subtractFromDate } from "../../../../helpers/dates";

const ChartWithCard = ({ reef, classes }: ChartWithCardProps) => {
  const dispatch = useDispatch();
  const spotterData = useSelector(reefSpotterDataSelector);
  const hasSpotterData = Boolean(reef.liveData.surfaceTemperature);
  const [pickerEndDate, setPickerEndDate] = useState<string>(
    new Date(moment().format("MM/DD/YYYY")).toISOString()
  );
  const [pickerStartDate, setPickerStartDate] = useState<string>(
    subtractFromDate(
      new Date(moment().format("MM/DD/YYYY")).toISOString(),
      "week"
    )
  );

  // Get spotter data
  useEffect(() => {
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
  }, [
    dispatch,
    hasSpotterData,
    pickerEndDate,
    pickerStartDate,
    reef.id,
    reef.timezone,
  ]);

  return (
    <Container>
      {hasSpotterData && (
        <Grid className={classes.chartWrapper} container item spacing={2}>
          <Grid item xs={12} md={9}>
            <Chart
              reef={reef}
              spotterData={spotterData}
              pickerStartDate={pickerStartDate}
              pickerEndDate={pickerEndDate}
              onStartDateChange={(date) =>
                setPickerStartDate(
                  new Date(moment(date).format("MM/DD/YYYY")).toISOString()
                )
              }
              onEndDateChange={(date) =>
                setPickerEndDate(
                  new Date(moment(date).format("MM/DD/YYYY")).toISOString()
                )
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Grid container justify="center">
              <Grid item xs={12} sm={5} md={12}>
                <TempAnalysis />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

const styles = () =>
  createStyles({
    chartWrapper: {
      marginBottom: 50,
    },
  });

interface ChartWithCardIncomingProps {
  reef: Reef;
}

type ChartWithCardProps = ChartWithCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ChartWithCard);
