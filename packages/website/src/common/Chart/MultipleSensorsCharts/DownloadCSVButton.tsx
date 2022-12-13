import React, { useState } from "react";
import downloadCsv from "download-csv";
import { Button } from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";
import { ValueWithTimestamp, MetricsKeys } from "../../../store/Sites/types";
import DownloadCSVDialog from "./DownloadCSVDialog";
import { spotterPositionSelector } from "../../../store/Sites/selectedSiteSlice";
import siteServices from "../../../services/siteServices";
import { CSVColumnData } from "./types";

type CSVColumnNames =
  | "spotterBottomTemp"
  | "spotterTopTemp"
  | "hoboTemp"
  | "oceanSensePH"
  | "oceanSenseEC"
  | "oceanSensePRESS"
  | "oceanSenseDO"
  | "oceanSenseORP"
  | "dailySST";

interface CSVRow extends Partial<Record<CSVColumnNames, number>> {
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
  columnName: CSVColumnNames,
  data: ValueWithTimestamp[] = [],
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
    chained: (
      chainedFinalKey: CSVColumnNames,
      chainedData: ValueWithTimestamp[] = []
    ) => constructCSVData(chainedFinalKey, chainedData, result),
  };
  /* eslint-enable no-param-reassign,fp/no-mutation */
}

interface DownloadCSVButtonParams {
  data: CSVColumnData[];
  startDate?: string;
  endDate?: string;
  className?: string;
  siteId?: number | string;
  pointId?: number | string;
  defaultMetrics?: MetricsKeys[];
}

function DownloadCSVButton({
  data,
  startDate,
  endDate,
  className,
  pointId,
  siteId,
  defaultMetrics,
}: DownloadCSVButtonParams) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const spotterData = useSelector(spotterPositionSelector);

  const onClose = async (
    shouldDownload: boolean,
    additionalData: boolean,
    allDates: boolean,
    hourly: boolean
  ) => {
    if (!shouldDownload) {
      setOpen(false);
      return;
    }

    if (!additionalData && !allDates) {
      downloadCsv(getCSVData(data), undefined, fileName);
      setOpen(false);
      return;
    }

    setLoading(true);

    const response = await siteServices.getSiteTimeSeriesData({
      hourly,
      start: allDates ? undefined : startDate,
      end: allDates ? undefined : endDate,
      metrics: additionalData ? undefined : defaultMetrics,
      siteId: String(siteId),
    });

    const formattedData = Object.entries(response.data)
      .map(([metric, sources]) => {
        return Object.entries(sources).map(([type, values]) => ({
          name: `${metric}_${type}`,
          values: values.data,
        }));
      })
      .flat();

    downloadCsv(getCSVData(formattedData), undefined, fileName);

    setLoading(false);
    setOpen(false);
  };

  const getCSVData = (selectedData: CSVColumnData[]) => {
    const [head, ...tail] = selectedData;

    // TODO: Change either CSVDataColumn names type or make it generic string
    const start = constructCSVData(head.name as CSVColumnNames, head.values);
    const result = tail.reduce(
      (prev, curr) => prev.chained(curr.name as CSVColumnNames, curr.values),
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
        style={{ marginBottom: spotterData?.isDeployed ? 0 : "2em" }}
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
