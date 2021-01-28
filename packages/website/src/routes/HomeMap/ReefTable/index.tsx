import React, { ChangeEvent, MouseEvent, useState } from "react";
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
import {
  withSpotterOnlySelector,
  setWithSpotterOnly,
} from "../../../store/Homepage/homepageSlice";

const SMALL_HEIGHT = 720;
const SMALL_WIDTH = 600;

const ReefTable = ({ openDrawer, classes }: ReefTableProps) => {
  const loading = useSelector(reefsListLoadingSelector);
  const user = useSelector(userInfoSelector);
  const withSpotterOnly = useSelector(withSpotterOnlySelector);
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
    const {
      target: { checked },
    } = event;
    dispatch(filterReefsWithSpotter(checked));
    dispatch(setWithSpotterOnly(checked));
  };

  // This function is used to prevent the drawer onClick close effect on mobile
  const onSwitchClick = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event.stopPropagation();
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
            <Box className={classes.switchWrapper}>
              <Switch
                checked={withSpotterOnly}
                onClick={onSwitchClick}
                onChange={toggleSwitch}
                color="primary"
              />
              <Typography color="textSecondary" variant="h6">
                deployed buoys only
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
                <CircularProgress size="4rem" thickness={1} />
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
    switchWrapper: {
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    },
  });

interface ReefTableIncomingProps {
  openDrawer: boolean;
}

type ReefTableProps = ReefTableIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ReefTable);
