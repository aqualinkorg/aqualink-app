import React, { ChangeEvent, MouseEvent, ReactNode, useState } from "react";
import { times } from "lodash";
import {
  Box,
  CircularProgress,
  createStyles,
  Hidden,
  MenuItem,
  Select,
  SelectProps,
  Switch,
  Table,
  TableContainer,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import SelectedReefCard from "./SelectedReefCard";
import ReefTableBody from "./body";
import { getOrderKeysFriendlyString, Order, OrderKeys } from "./utils";
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

const MOBILE_SELECT_MENU_ITEMS = Object.values(OrderKeys).reduce<ReactNode[]>(
  (elements, val) => [
    ...elements,
    ...times(2, (i) => {
      const itemOrder: Order = i % 2 === 0 ? "asc" : "desc";
      return (
        <MenuItem value={`${val}-${itemOrder}`} key={val + i}>
          <Typography color="primary" variant="h4">
            {getOrderKeysFriendlyString(val)}
            {"  "}
            {itemOrder === "asc" ? (
              <ArrowDownward fontSize="small" />
            ) : (
              <ArrowUpward fontSize="small" />
            )}
          </Typography>
        </MenuItem>
      );
    }),
  ],
  []
);

const ReefTable = ({ isDrawerOpen, classes }: ReefTableProps) => {
  const loading = useSelector(reefsListLoadingSelector);
  const reefOnMap = useSelector(reefOnMapSelector);
  const user = useSelector(userInfoSelector);
  const withSpotterOnly = useSelector(withSpotterOnlySelector);
  const dispatch = useDispatch();
  const { height } = useWindowSize() || {};

  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderKeys>(OrderKeys.ALERT);

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
  const onInteractiveClick = (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    event.stopPropagation();
  };

  const onMobileSelectChange: SelectProps["onChange"] = (newValue) => {
    const value = newValue.target.value as string;
    const [newOrderBy, newOrder] = value.split("-") as [OrderKeys, Order];
    setOrder(newOrder);
    setOrderBy(newOrderBy);
  };
  return (
    <>
      {/* Holds drawer handle and reef name text on mobile */}
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
            onClick={onInteractiveClick}
            onChange={toggleSwitch}
            color="primary"
          />
          <Typography color="textSecondary" variant="h6">
            deployed buoys only
          </Typography>
        </Box>
      )}
      {/* Holds sort selector on mobile. Sorting on desktop uses table headers. */}
      <Hidden smUp>
        <Box
          paddingX={2}
          paddingY={3}
          display="flex"
          alignItems="center"
          onClick={onInteractiveClick}
        >
          <Typography variant="h5">Sort By: </Typography>
          <Select
            value={`${orderBy}-${order}`}
            className={classes.mobileSortSelect}
            onChange={onMobileSelectChange}
          >
            {MOBILE_SELECT_MENU_ITEMS}
          </Select>
        </Box>
      </Hidden>
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
      borderCollapse: "collapse",
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
    mobileSortSelect: {
      marginLeft: theme.spacing(2),
    },
    allReefsText: {
      position: "absolute",
      left: 25,
      top: 25,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "90vw",
    },
    bounce: { animation: "$bounce 1s infinite alternate" },
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
  isDrawerOpen?: boolean;
}

ReefTable.defaultProps = {
  isDrawerOpen: false,
};

export default withStyles(styles)(ReefTable);
