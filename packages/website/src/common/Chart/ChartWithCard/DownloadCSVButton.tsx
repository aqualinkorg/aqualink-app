import React, { useState } from "react";
import { useSelector } from "react-redux";
import downloadCsv from "download-csv";
import { Button } from "@material-ui/core";
import moment from "moment";
import {
  reefGranularDailyDataSelector,
  reefTimeSeriesDataSelector,
} from "../../../store/Reefs/selectedReefSlice";
import { SofarValue } from "../../../store/Reefs/types";

type CSVDataColumn =
  | "spotterBottomTemp"
  | "spotterTopTemp"
  | "hoboTemp"
  | "dailySST";

interface CSVRow extends Partial<Record<CSVDataColumn, number>> {
  timestamp: string;
}

const DATE_FORMAT = "YYYY_MM_DD";

/**
 * Construct CSV data to pass into download-csv.
 * This function is designed with the 'builder' pattern, where a chain function and result function is returned.
 * Call the chained() function to add a new column to the CSV, or the result() function to return the final csv object.
 * @param columnName - The name of the new column. 'timestamp' is reserved.
 * @param data - The data corresponding to the new column. Obj array of timestamp and value.
 * @param existingData - Should only used by chained() and never directly. Stores the in-progress CSV object.
 */
function constructCSVData(
  columnName: CSVDataColumn,
  data: SofarValue[] = [],
  existingData: Record<CSVRow["timestamp"], CSVRow> = {}
) {
  // writing this in an immutable fashion will be detrimental to performance.
  /* eslint-disable no-param-reassign,fp/no-mutation,fp/no-mutating-methods */
  const result = data.reduce((obj, item) => {
    // we are basically ensuring there's always a timestamp column in the final result.
    if (obj[item.timestamp]) {
      obj[item.timestamp][columnName] = item.value;
    } else {
      obj[item.timestamp] = {
        timestamp: item.timestamp,
        [columnName]: item.value,
      };
    }
    return obj;
  }, existingData);
  return {
    result: () =>
      Object.values(result).sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    chained: (chainedFinalKey: CSVDataColumn, chainedData: SofarValue[] = []) =>
      constructCSVData(chainedFinalKey, chainedData, result),
  };
  /* eslint-enable no-param-reassign,fp/no-mutation */
}

function DownloadCSVButton({
  startDate,
  endDate,
  className,
  pointId,
  reefId,
}: {
  startDate?: string;
  endDate?: string;
  className?: string;
  reefId?: number | string;
  pointId?: number | string;
}) {
  const granularDailyData = useSelector(reefGranularDailyDataSelector);
  const { hobo: hoboData, spotter: spotterData } =
    useSelector(reefTimeSeriesDataSelector) || {};
  const [loading, setLoading] = useState(false);

  const getCSVData = () =>
    constructCSVData("spotterBottomTemp", spotterData?.bottomTemperature)
      .chained("spotterTopTemp", spotterData?.surfaceTemperature)
      .chained("hoboTemp", hoboData?.bottomTemperature)
      .chained(
        "dailySST",
        granularDailyData?.map((val) => ({
          timestamp: val.date,
          value: val.satelliteTemperature,
        }))
      )
      .result();
  const fileName = `data_reef_${reefId}${
    pointId ? `_poi_${pointId}` : ""
  }_${moment(startDate).format(DATE_FORMAT)}_${moment(endDate).format(
    DATE_FORMAT
  )}.csv`;

  return (
    <Button
      disabled={loading}
      variant="outlined"
      color="primary"
      className={className}
      onClick={() => {
        setLoading(true);
        // give time for the loading state to be rendered by react.
        setTimeout(() => {
          downloadCsv(getCSVData(), undefined, fileName);
          setLoading(false);
        }, 5);
      }}
    >
      {/* TODO update this component with LoadingButton from MUILab when newest version is released. */}
      {loading ? "Loading..." : "Download CSV"}
    </Button>
  );
}

DownloadCSVButton.defaultProps = {
  startDate: "unknown",
  endDate: "unknown",
  pointId: undefined,
  reefId: undefined,
  className: undefined,
};

export default DownloadCSVButton;
