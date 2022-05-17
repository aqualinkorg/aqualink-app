import React, { useState } from "react";
import downloadCsv from "download-csv";
import { Button } from "@material-ui/core";
import moment from "moment";
import { SofarValue } from "../../../store/Sites/types";
import DownloadCSVDialog from "./DownloadCSVDialog";

type CSVDataColumn =
  | "spotterBottomTemp"
  | "spotterTopTemp"
  | "hoboTemp"
  | "oceanSensePH"
  | "oceanSenseEC"
  | "oceanSensePRESS"
  | "oceanSenseDO"
  | "oceanSenseORP"
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
  data,
  startDate,
  endDate,
  className,
  pointId,
  siteId,
}: {
  data: { name: string; values: SofarValue[] }[];
  startDate?: string;
  endDate?: string;
  className?: string;
  siteId?: number | string;
  pointId?: number | string;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onClose = (shouldDownload: boolean) => {
    if (!shouldDownload) {
      setOpen(false);
      return;
    }
    setLoading(true);
    // give time for the loading state to be rendered by react.
    setTimeout(() => {
      downloadCsv(getCSVData(data), undefined, fileName);
      setLoading(false);
      setOpen(false);
    }, 5);
  };

  const getCSVData = (
    selectedData: { name: string; values: SofarValue[] }[]
  ) => {
    const [head, ...tail] = selectedData;

    // TODO: Change either CSVDataColumn names type or make it generic string
    const start = constructCSVData(head.name as CSVDataColumn, head.values);
    const result = tail.reduce(
      (prev, curr) => prev.chained(curr.name as CSVDataColumn, curr.values),
      start
    );
    return result.result();
  };

  const fileName = `data_site_${siteId}${
    pointId ? `_survey_point_${pointId}` : ""
  }_${moment(startDate).format(DATE_FORMAT)}_${moment(endDate).format(
    DATE_FORMAT
  )}.csv`;

  return (
    <>
      <Button
        disabled={loading}
        variant="outlined"
        color="primary"
        className={className}
        onClick={() => {
          setOpen(true);
        }}
      >
        {/* TODO update this component with LoadingButton from MUILab when newest version is released. */}
        {loading ? "Loading..." : "Download CSV"}
      </Button>
      <DownloadCSVDialog
        open={open}
        onClose={onClose}
        data={data}
        startDate={startDate || ""}
        endDate={endDate || ""}
      />
    </>
  );
}

DownloadCSVButton.defaultProps = {
  startDate: undefined,
  endDate: undefined,
  pointId: undefined,
  siteId: undefined,
  className: undefined,
};

export default DownloadCSVButton;
