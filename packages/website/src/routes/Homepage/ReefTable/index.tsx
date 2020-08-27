import React, { CSSProperties, forwardRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MaterialTable, { Column } from "material-table";
import { Grid, Paper, Typography } from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ErrorIcon from "@material-ui/icons/Error";

import SelectedReefCard from "./SelectedReefCard";
import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { reefDetailsSelector } from "../../../store/Reefs/selectedReefSlice";
import { setReefOnMap } from "../../../store/Homepage/homepageSlice";
import { colors } from "../../../layout/App/theme";
import { formatNumber } from "../../../helpers/numberUtils";
import {
  colorFinder,
  degreeHeatingWeeksCalculator,
} from "../../../helpers/degreeHeatingWeeks";

interface Row {
  locationName: string | null;
  temp?: string | 0;
  depth: number | null;
  dhw: number | null;
  tableData: {
    id: number;
  };
}

const ReefTable = () => {
  const reefsList = useSelector(reefsListSelector);
  const selectedReef = useSelector(reefDetailsSelector);
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const headerStyle: CSSProperties = {
    backgroundColor: "#cacbd1",
    color: "black",
    textAlign: "left",
  };

  const cellStyle: CSSProperties = {
    color: "black",
    alignItems: "center",
    textAlign: "left",
  };

  const tableColumns: Array<Column<Row>> = [
    {
      title: "REEF NAME",
      field: "locationName",
      cellStyle,
      render: (rowData) => (
        <Typography
          align="left"
          style={{ paddingRight: "1.5rem" }}
          variant="subtitle1"
          color="textSecondary"
        >
          {rowData.locationName}
        </Typography>
      ),
    },
    {
      title: "TEMP",
      field: "temp",
      type: "numeric",
      cellStyle,
      render: (rowData) => (
        <Typography
          style={{ color: colors.lightBlue, paddingLeft: "2rem" }}
          variant="h6"
        >
          {rowData.temp} &#8451;
        </Typography>
      ),
    },
    {
      title: "DEPTH",
      field: "depth",
      type: "numeric",
      cellStyle,
      render: (rowData) => (
        <Typography
          style={{ paddingLeft: "2rem" }}
          variant="subtitle1"
          color="textSecondary"
        >
          {rowData.depth} m
        </Typography>
      ),
    },
    {
      title: "DHW",
      field: "dhw",
      type: "numeric",
      cellStyle,
      render: (rowData) => (
        <Typography
          style={{
            paddingLeft: "2rem",
            color: rowData.dhw ? `${colorFinder(rowData.dhw)}` : "black",
          }}
          variant="subtitle1"
        >
          {formatNumber(rowData.dhw, 1)}
        </Typography>
      ),
    },
    {
      title: "ALERT",
      field: "dhw",
      cellStyle,
      render: (rowData) => {
        return (
          <ErrorIcon
            style={{ color: colorFinder(rowData.dhw), paddingLeft: "1rem" }}
          />
        );
      },
    },
  ];

  const tableData: Row[] = Object.entries(reefsList).map(([key, value]) => {
    const { degreeHeatingDays, satelliteTemperature } =
      value.latestDailyData || {};
    return {
      locationName: value.name,
      temp: formatNumber(satelliteTemperature, 1),
      depth: value.depth,
      dhw: degreeHeatingWeeksCalculator(degreeHeatingDays),
      tableData: {
        id: parseFloat(key),
      },
    };
  });

  return (
    <>
      {selectedReef &&
        selectedReef.dailyData &&
        selectedReef.dailyData.length > 0 && (
          <SelectedReefCard reef={selectedReef} />
        )}
      {reefsList && reefsList.length > 0 && (
        <Grid item xs={12}>
          <MaterialTable
            icons={{
              SortArrow: forwardRef((props, ref) => (
                <ArrowUpwardIcon {...props} ref={ref} />
              )),
            }}
            columns={tableColumns}
            data={tableData}
            onRowClick={(event, row) => {
              if (row && row.tableData) {
                setSelectedRow(row.tableData.id);
                dispatch(setReefOnMap(reefsList[row.tableData.id]));
              }
            }}
            options={{
              rowStyle: (rowData) => ({
                backgroundColor:
                  selectedRow === rowData.tableData.id
                    ? colors.lighterBlue
                    : "none",
              }),
              paging: false,
              headerStyle,
            }}
            components={{
              Container: (props) => <Paper {...props} elevation={0} />,
              Toolbar: () => null,
              Pagination: () => null,
            }}
          />
        </Grid>
      )}
    </>
  );
};

export default ReefTable;
