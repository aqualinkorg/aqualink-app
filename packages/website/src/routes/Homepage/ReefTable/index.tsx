import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  Grid,
  Typography,
  IconButton,
  Hidden,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ErrorIcon from "@material-ui/icons/Error";

import SelectedReefCard from "./SelectedReefCard";
import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { constructTableData } from "../../../store/Reefs/helpers";
import { colors } from "../../../layout/App/theme";
import { reefDetailsSelector } from "../../../store/Reefs/selectedReefSlice";
import { setReefOnMap } from "../../../store/Homepage/homepageSlice";
import type { TableRow as Row } from "../../../store/Homepage/types";
import { formatNumber } from "../../../helpers/numberUtils";
import {
  dhwColorFinder,
  // degreeHeatingWeeksCalculator,
} from "../../../helpers/degreeHeatingWeeks";
import { alertColorFinder } from "../../../helpers/bleachingAlertIntervals";
import type { Order, OrderKeys } from "./types";
import EnhancedTableHead from "./tableHead";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(
  order: Order,
  orderBy: OrderKeys
): (
  a: {
    [key in OrderKeys]: number | string | null;
  },
  b: {
    [key in OrderKeys]: number | string | null;
  }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const ReefTable = ({ openDrawer }: ReefTableProps) => {
  const reefsList = useSelector(reefsListSelector);
  const selectedReef = useSelector(reefDetailsSelector);
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>(undefined);
  const [orderBy, setOrderBy] = useState<OrderKeys>("locationName");

  const handleClick = (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    reef: Row
  ) => {
    setSelectedRow(reef.tableData.id);
    dispatch(setReefOnMap(reefsList[reef.tableData.id]));
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: OrderKeys
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

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
          <TableContainer>
            <Table>
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {stableSort<Row>(
                  constructTableData(reefsList),
                  getComparator(order, orderBy)
                ).map((reef, index) => {
                  return (
                    <TableRow
                      hover
                      style={{
                        backgroundColor:
                          reef.tableData.id === selectedRow
                            ? colors.lighterBlue
                            : "white",
                        cursor: "pointer",
                      }}
                      onClick={(event) => handleClick(event, reef)}
                      role="button"
                      tabIndex={-1}
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${reef.locationName}-${index}`}
                    >
                      <TableCell>
                        <Typography
                          align="center"
                          variant="subtitle1"
                          color="textSecondary"
                        >
                          {reef.locationName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          style={{ color: colors.lightBlue }}
                          variant="subtitle1"
                        >
                          {reef.temp}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle1" color="textSecondary">
                          {reef.depth}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          style={{
                            color: reef.dhw
                              ? `${dhwColorFinder(reef.dhw)}`
                              : "black",
                          }}
                          variant="subtitle1"
                        >
                          {formatNumber(reef.dhw, 1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <ErrorIcon
                          style={{
                            color: alertColorFinder(reef.dhw),
                            marginRight: "1rem",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </>
  );
};

interface ReefTableProps {
  openDrawer: boolean;
}

export default ReefTable;
