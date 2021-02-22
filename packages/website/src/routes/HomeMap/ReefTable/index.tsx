import React, { ChangeEvent, MouseEvent, useState } from "react";
import {
  Box,
  CircularProgress,
  createStyles,
  Hidden,
  Switch,
  Table,
  TableContainer,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import SelectedReefCard from "./SelectedReefCard";
import ReefTableBody from "./body";
import { Order, OrderKeys } from "./utils";
import {
  filterReefsWithSpotter,
  reefsListLoadingSelector,
} from "../../../store/Reefs/reefsListSlice";
import EnhancedTableHead from "./tableHead";
import { useWindowSize } from "../../../helpers/useWindowSize";
import { userInfoSelector } from "../../../store/User/userSlice";
import { isSuperAdmin } from "../../../helpers/user";
import {
  reefOnMapSelector,
  setWithSpotterOnly,
  withSpotterOnlySelector,
} from "../../../store/Homepage/homepageSlice";
import { getReefNameAndRegion } from "../../../store/Reefs/helpers";

const SMALL_HEIGHT = 720;

const ReefTable = ({ isDrawerOpen, classes }: ReefTableProps) => {
  const loading = useSelector(reefsListLoadingSelector);
  const reefOnMap = useSelector(reefOnMapSelector);
  const user = useSelector(userInfoSelector);
  const withSpotterOnly = useSelector(withSpotterOnlySelector);
  const dispatch = useDispatch();
  const { height } = useWindowSize() || {};

  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderKeys>("alert");

  const handleRequestSort = (event: unknown, property: OrderKeys) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

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
        <Box
          width="100vw"
          display="flex"
          justifyContent="center"
          marginTop={2}
          marginBottom={3}
        >
          <Box
            className={classNames(classes.topHandle, {
              [classes.bounce]: !!reefOnMap && !isDrawerOpen,
            })}
          />
          {!isDrawerOpen && (
            <Typography
              className={classes.allReefsText}
              variant="h5"
              color="textSecondary"
            >
              {reefOnMap ? getReefNameAndRegion(reefOnMap).name : "All Reefs"}
            </Typography>
          )}
        </Box>
      </Hidden>
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
    topHandle: {
      width: 50,
      height: 10,
      backgroundColor: theme.palette.grey["400"],
      borderRadius: "20px",
    },
    bounce: { animation: "$bounce 1s infinite alternate" },
    allReefsText: {
      position: "absolute",
      left: 25,
      top: 25,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "90vw",
    },
    "@keyframes bounce": {
      "0%": { transform: "translateY(0px)" },
      "100%": { transform: "translateY(-5px)" },
    },
  });

interface ReefTableProps
  extends ReefTableIncomingProps,
    WithStyles<typeof styles> {}

interface ReefTableIncomingProps {
  // used on mobile to add descriptive elements if the drawer is closed.
  isDrawerOpen: boolean;
}

export default withStyles(styles)(ReefTable);
