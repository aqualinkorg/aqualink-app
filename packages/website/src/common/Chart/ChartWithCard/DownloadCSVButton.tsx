import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import { CSVLink } from "react-csv";
import {
  reefGranularDailyDataSelector,
  reefTimeSeriesDataSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { DailyData, SofarValue } from "../../../store/Reefs/types";

type CSVDataColumn =
  | "spotterBottomTemp"
  | "spotterTopTemp"
  | "hoboTemp"
  | "dailySST";

interface CSVRow extends Partial<Record<CSVDataColumn, number>> {
  timestamp: string;
}

/**
 * Construct CSV data to pass into react-csv
 * @param dailyData - used to fetch satelliteTemp
 * @param hoboData - expects bottomTemperature metric from hoboData
 * @param spotterBottomTemp - expects bottomTemperature metric from spotterData
 * @param spotterTopTemp - expects surfaceTemperature metric from spotterData
 */
function constructCSVData({
  spotterTopTemp = [],
  spotterBottomTemp = [],
  hoboData = [],
  dailyData = [],
}: {
  spotterBottomTemp?: SofarValue[];
  spotterTopTemp?: SofarValue[];
  dailyData?: DailyData[];
  hoboData?: SofarValue[];
}): CSVRow[] {
  const chainedReduce = (
    finalKey: CSVDataColumn,
    data: SofarValue[],
    existingData: Record<CSVRow["timestamp"], CSVRow> = {}
  ) => {
    // writing this in an immutable fashion will be detrimental to performance.
    /* eslint-disable no-param-reassign,fp/no-mutation */
    const result = data.reduce((obj, item) => {
      if (obj[item.timestamp]) {
        obj[item.timestamp][finalKey] = item.value;
      } else {
        obj[item.timestamp] = {
          timestamp: item.timestamp,
          [finalKey]: item.value,
        };
      }
      return obj;
    }, existingData);
    return {
      result,
      chainedReduce: (
        chainedFinalKey: CSVDataColumn,
        chainedData: SofarValue[]
      ) => chainedReduce(chainedFinalKey, chainedData, result),
    };
    /* eslint-enable no-param-reassign,fp/no-mutation */
  };

  const mappedToTimestamp = chainedReduce(
    "spotterBottomTemp",
    spotterBottomTemp
  )
    .chainedReduce("spotterTopTemp", spotterTopTemp)
    .chainedReduce("hoboTemp", hoboData)
    .chainedReduce(
      "dailySST",
      dailyData.map((val) => ({
        timestamp: val.date,
        value: val.satelliteTemperature,
      }))
    ).result;

  // eslint-disable-next-line fp/no-mutating-methods
  return Object.values(mappedToTimestamp).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

function DownloadCSVButton({
  startDate,
  endDate,
  className,
}: {
  startDate?: string;
  endDate?: string;
  className?: string;
}) {
  console.time("loading data");
  const granularDailyData = useSelector(reefGranularDailyDataSelector);
  const { hobo: hoboData, spotter: spotterData } =
    useSelector(reefTimeSeriesDataSelector) || {};
  console.timeEnd("loading data");
  console.time("csv");
  const csvData = useMemo(
    () =>
      constructCSVData({
        dailyData: granularDailyData,
        spotterTopTemp: spotterData?.surfaceTemperature,
        spotterBottomTemp: spotterData?.bottomTemperature,
        hoboData: hoboData?.bottomTemperature,
      }),
    [granularDailyData, hoboData, spotterData]
  );
  console.timeEnd("csv");
  return (
    <CSVLink filename={`export-${startDate}-to-${endDate}.csv`} data={csvData}>
      <Button variant="outlined" color="primary" className={className}>
        Download CSV
      </Button>
    </CSVLink>
  );
}

DownloadCSVButton.defaultProps = {
  startDate: "unknown",
  endDate: "unknown",
  className: undefined,
};

export default DownloadCSVButton;
