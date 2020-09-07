import React, { CSSProperties, forwardRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MaterialTable, { Column } from "material-table";
import { Grid, Paper, Typography, IconButton, Hidden } from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ErrorIcon from "@material-ui/icons/Error";

import SelectedReefCard from "./SelectedReefCard";
import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { reefDetailsSelector } from "../../../store/Reefs/selectedReefSlice";
import { setReefOnMap } from "../../../store/Homepage/homepageSlice";
import { colors } from "../../../layout/App/theme";
import { formatNumber } from "../../../helpers/numberUtils";
import {
  dhwColorFinder,
  degreeHeatingWeeksCalculator,
} from "../../../helpers/degreeHeatingWeeks";
import { alertColorFinder } from "../../../helpers/bleachingAlertIntervals";

interface Row {
  locationName: string | null;
  temp?: string | 0;
  depth: number | null;
  dhw: number | null;
  tableData: {
    id: number;
  };
}
const columnTitle = (title: string, unit?: string) => (
  <>
    <Typography variant="h6" style={{ color: "black" }}>
      {title}
      {unit && (
        <Typography
          variant="subtitle2"
          style={{ color: "black" }}
          component="span"
        >{`\u00a0 (${unit})`}</Typography>
      )}
    </Typography>
  </>
);

const ReefTable = ({ openDrawer }: ReefTableProps) => {
  const reefsList = useSelector(reefsListSelector);
  const selectedReef = useSelector(reefDetailsSelector);
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const headerStyle: CSSProperties = {
    backgroundColor: "rgb(244, 244, 244)",
    color: "black",
    textAlign: "left",
  };

  const cellStyle: CSSProperties = {
    color: "black",
    alignItems: "center",
    justifyItems: "center",
    textAlign: "center",
  };

  const tableColumns: Array<Column<Row>> = [
    {
      title: columnTitle("REEF"),
      field: "locationName",
      cellStyle,
      render: (rowData) => (
        <Typography align="left" variant="subtitle1" color="textSecondary">
          {rowData.locationName}
        </Typography>
      ),
    },
    {
      title: columnTitle("TEMP", "°C"),
      field: "temp",
      type: "numeric",
      cellStyle,
      render: (rowData) => (
        <Typography style={{ color: colors.lightBlue }} variant="subtitle1">
          {rowData.temp}
        </Typography>
      ),
    },
    {
      title: columnTitle("DEPTH", "m"),
      field: "depth",
      type: "numeric",
      cellStyle,
      render: (rowData) => (
        <Typography variant="subtitle1" color="textSecondary">
          {rowData.depth}
        </Typography>
      ),
    },
    {
      title: columnTitle("STRESS", "DHW"),
      field: "dhw",
      type: "numeric",
      cellStyle,
      render: (rowData) => (
        <Typography
          style={{
            color: rowData.dhw ? `${dhwColorFinder(rowData.dhw)}` : "black",
          }}
          variant="subtitle1"
        >
          {formatNumber(rowData.dhw, 1)}
        </Typography>
      ),
    },
    {
      title: columnTitle("ALERT"),
      width: "10%",
      field: "dhw",
      cellStyle,
      render: (rowData) => {
        return (
          <ErrorIcon
            style={{
              color: alertColorFinder(rowData.dhw),
              marginRight: "1rem",
            }}
          />
        );
      },
    },
  ];

  const tableData: Row[] = Object.entries(reefsList).map(([key, value]) => {
    const { degreeHeatingDays, satelliteTemperature } =
      value.latestDailyData || {};
    const locationName = value.name || value.region?.name || null;
    return {
      locationName,
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
      <Hidden smUp>
        <Grid container justify="center" style={{ marginBottom: "-3rem" }}>
          <Grid item>
            <IconButton>
              {openDrawer ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            </IconButton>
          </Grid>
        </Grid>
        {openDrawer ? null : (
          <Typography
            style={{
              position: "relative",
              margin: "1rem 0 0.5rem 1rem",
            }}
            variant="h5"
            color="textSecondary"
          >
            All Reefs
          </Typography>
        )}
      </Hidden>
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
                <ArrowDownwardIcon {...props} ref={ref} />
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

interface ReefTableProps {
  openDrawer: boolean;
}

export default ReefTable;
