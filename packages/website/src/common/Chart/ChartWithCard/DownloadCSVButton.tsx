import React from "react";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import { CSVLink } from "react-csv";
import {
  reefGranularDailyDataSelector,
  reefTimeSeriesDataSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { DailyData, SofarValue } from "../../../store/Reefs/types";

interface CSVRow {
  spotterBottomTemp?: number;
  spotterTopTemp?: number;
  hoboTemp?: number;
  dailySST: number;
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
    finalKey: keyof CSVRow,
    data: SofarValue[],
    existingData: Record<CSVRow["timestamp"], CSVRow> = {}
  ) => {
    const result = data.reduce((obj, item) => {
      return {
        ...obj,
        [item.timestamp]: {
          ...obj[item.timestamp],
          timestamp: item.timestamp,
          [finalKey]: item.value,
        },
      };
    }, existingData);
    return {
      result,
      chainedReduce: (
        chainedFinalKey: keyof CSVRow,
        chainedData: SofarValue[]
      ) => chainedReduce(chainedFinalKey, chainedData, result),
    };
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
  const granularDailyData = useSelector(reefGranularDailyDataSelector);
  const { hobo: hoboData, spotter: spotterData } =
    useSelector(reefTimeSeriesDataSelector) || {};
  const csvData = constructCSVData({
    dailyData: granularDailyData,
    spotterTopTemp: spotterData?.surfaceTemperature,
    spotterBottomTemp: spotterData?.bottomTemperature,
    hoboData: hoboData?.bottomTemperature,
  });

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
