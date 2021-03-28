import React from "react";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import { CSVLink } from "react-csv";
import {
  reefGranularDailyDataSelector,
  reefTimeSeriesDataSelector,
} from "../../../store/Reefs/selectedReefSlice";

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
  return (
    <CSVLink
      filename={`export-${startDate}-to-${endDate}.csv`}
      data={[
        [3, 4, 5],
        [2, 3, 4],
      ]}
    >
      <Button
        variant="outlined"
        color="primary"
        startIcon={<GetApp />}
        className={className}
      >
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
