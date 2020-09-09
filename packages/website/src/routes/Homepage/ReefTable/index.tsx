import React, { useState } from "react";
import {
  Grid,
  Typography,
  IconButton,
  Hidden,
  TableContainer,
  Table,
  CircularProgress,
  Box,
} from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

import { useSelector } from "react-redux";
import SelectedReefCard from "./SelectedReefCard";
import EnhancedTableHead from "./tableHead";
import ReefTableBody from "./body";
import { Order, OrderKeys } from "./utils";
import { reefsListLoadingSelector } from "../../../store/Reefs/reefsListSlice";

const ReefTable = ({ openDrawer }: ReefTableProps) => {
  const loading = useSelector(reefsListLoadingSelector);
  const [order, setOrder] = useState<Order>(undefined);
  const [orderBy, setOrderBy] = useState<OrderKeys>("locationName");

  const handleRequestSort = (event: unknown, property: OrderKeys) => {
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
      <SelectedReefCard />
      <Box display="flex" flexDirection="column" flex={1}>
        <TableContainer>
          <Table>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <ReefTableBody order={order} orderBy={orderBy} />
          </Table>
        </TableContainer>
        {loading && (
          <Box
            display="flex"
            flex={1}
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size="10rem" thickness={1} />
          </Box>
        )}
      </Box>
    </>
  );
};

interface ReefTableProps {
  openDrawer: boolean;
}

export default ReefTable;
