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
 * Construct CSV data to pass into react-csv
 */
function constructCSVData(
  finalKey: CSVDataColumn,
  data: SofarValue[] = [],
  existingData: Record<CSVRow["timestamp"], CSVRow> = {}
) {
  // writing this in an immutable fashion will be detrimental to performance.
  /* eslint-disable no-param-reassign,fp/no-mutation,fp/no-mutating-methods */
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
  )}`;

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
