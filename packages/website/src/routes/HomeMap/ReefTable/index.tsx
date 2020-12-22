import React, { ChangeEvent, useState } from "react";
import {
  Box,
  CircularProgress,
  createStyles,
  Grid,
  Hidden,
  IconButton,
  Table,
  TableContainer,
  Theme,
  Typography,
  withStyles,
  WithStyles,
  Switch,
} from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import { useDispatch, useSelector } from "react-redux";

import SelectedReefCard from "./SelectedReefCard";
import ReefTableBody from "./body";
import { Order, OrderKeys } from "./utils";
import {
  reefsListLoadingSelector,
  filterReefsWithSpotter,
} from "../../../store/Reefs/reefsListSlice";
import EnhancedTableHead from "./tableHead";
import { useWindowSize } from "../../../helpers/useWindowSize";
import { userInfoSelector } from "../../../store/User/userSlice";
import { isSuperAdmin } from "../../../helpers/user";

const SMALL_HEIGHT = 720;
const SMALL_WIDTH = 600;

const ReefTable = ({ openDrawer, classes }: ReefTableProps) => {
  const loading = useSelector(reefsListLoadingSelector);
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();
  const { height, width } = useWindowSize() || {};

  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderKeys>("alert");

  const handleRequestSort = (event: unknown, property: OrderKeys) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const showTable = (width && width >= SMALL_WIDTH) || openDrawer;

  const toggleSwitch = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(filterReefsWithSpotter(event.target.checked));
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
      {showTable && (
        <>
          <SelectedReefCard />
          {isSuperAdmin(user) && (
            <Box
              padding="0 40px"
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Switch onChange={toggleSwitch} color="primary" />
              <Typography color="textSecondary" variant="h6">
                spotters only
              </Typography>
            </Box>
          )}
          <Box
            className={
              height && height > SMALL_HEIGHT
                ? `${classes.tableHolder} ${classes.scrollable}`
                : `${classes.tableHolder}`
            }
            display="flex"
            flexDirection="column"
            flex={1}
          >
            <TableContainer>
              <Table stickyHeader className={classes.table}>
                <Hidden xsDown>
                  <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                  />
                </Hidden>
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
      )}
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    tableHolder: {
      paddingLeft: 10,
      [theme.breakpoints.down("xs")]: {
        paddingLeft: 0,
        height: "auto",
      },
    },
    scrollable: {
      overflowY: "auto",
    },
    table: {
      [theme.breakpoints.down("xs")]: {
        tableLayout: "fixed",
      },
    },
  });

interface ReefTableIncomingProps {
  openDrawer: boolean;
}

type ReefTableProps = ReefTableIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ReefTable);
