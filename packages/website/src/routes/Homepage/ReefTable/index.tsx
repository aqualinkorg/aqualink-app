import React, { CSSProperties, forwardRef, useState } from "react";
import { useSelector } from "react-redux";
import MaterialTable, { Column } from "material-table";
import { Grid, Paper, Typography } from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ErrorIcon from "@material-ui/icons/Error";

import SelectedReefCard from "./selectedReefCard";
import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { reefDetailsSelector } from "../../../store/Reefs/selectedReefSlice";
import { colors } from "../../../layout/App/theme";

interface Row {
  locationName: string | null;
  temp: number | null;
  depth: number | null;
  dhd: number | null;
  alert: string | null;
  tableData: {
    id: number;
  };
}

const ReefTable = () => {
  const reefsList = useSelector(reefsListSelector);
  const selectedReef = useSelector(reefDetailsSelector);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const headerStyle: CSSProperties = {
    backgroundColor: "#cacbd1",
    color: "black",
    textAlign: "center",
  };

  const cellStyle: CSSProperties = {
    color: "black",
    alignItems: "center",
    textAlign: "center",
  };

  const tableColumns: Array<Column<Row>> = [
    {
      title: "LOCATION NAME",
      field: "locationName",
      cellStyle,
      render: (rowData) => (
        <Typography variant="subtitle1" color="textSecondary">
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
        <Typography style={{ color: colors.lightBlue }} variant="h6">
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
        <Typography variant="subtitle1" color="textSecondary">
          {rowData.depth} m
        </Typography>
      ),
    },
    {
      title: "DHD",
      field: "dhd",
      type: "numeric",
      cellStyle,
      render: (rowData) => (
        <Typography variant="subtitle1" color="textSecondary">
          {rowData.dhd}
        </Typography>
      ),
    },
    {
      title: "ALERT",
      field: "alert",
      cellStyle,
      render: (rowData) => {
        if (rowData.alert === "warning") {
          return <ErrorIcon style={{ color: colors.lightBlue }} />;
        }
        return null;
      },
    },
  ];

  const tableData: Row[] = Object.entries(reefsList).map(([key, value]) => {
    return {
      locationName: value.name,
      temp: 28.6,
      depth: value.depth,
      dhd: 14,
      alert: "warning",
      tableData: {
        id: parseFloat(key),
      },
    };
  });

  return (
    <>
      {selectedReef &&
        selectedReef.dailyData &&
        selectedReef.dailyData.length > 0 &&
        selectedReef.temperatureThreshold && (
          <SelectedReefCard reef={selectedReef} />
        )}
      {reefsList && reefsList.length > 0 && (
        <Grid style={{ marginTop: "2rem" }} item xs={12}>
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
