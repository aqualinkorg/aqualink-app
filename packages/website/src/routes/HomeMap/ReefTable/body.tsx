import {
  createStyles,
  Hidden,
  TableBody,
  TableCell,
  TableRow,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableRow as Row } from "../../../store/Homepage/types";
import { constructTableData } from "../../../store/Reefs/helpers";
import { colors } from "../../../layout/App/theme";
import { dhwColorFinder } from "../../../helpers/degreeHeatingWeeks";
import { formatNumber } from "../../../helpers/numberUtils";
import { reefsToDisplayListSelector } from "../../../store/Reefs/reefsListSlice";
import {
  reefOnMapSelector,
  setReefOnMap,
  setSearchResult,
} from "../../../store/Homepage/homepageSlice";
import { getComparator, Order, OrderKeys, stableSort } from "./utils";
import { alertColorFinder } from "../../../helpers/bleachingAlertIntervals";
import { Collection } from "../../Dashboard/collection";

const RowNameCell = ({
  reef: { locationName, region },
  classes,
}: {
  reef: Row;
  classes: ReefTableBodyProps["classes"];
}) => {
  return (
    <TableCell className={classes.nameCells}>
      <Typography align="left" variant="h6" color="textSecondary">
        {locationName}
      </Typography>

      {locationName !== region && region && (
        <Typography className={classes.regionName} variant="subtitle1">
          {region}
        </Typography>
      )}
    </TableCell>
  );
};

const RowNumberCell = ({
  color,
  unit,
  decimalPlaces,
  value,
  classes,
  extended,
}: {
  color?: string;
  unit?: string;
  value: number | null;
  decimalPlaces?: number;
  classes: ReefTableBodyProps["classes"];
  extended?: boolean;
}) => {
  return (
    <TableCell
      className={
        extended ? classes.cellTextAlignExtended : classes.cellTextAlign
      }
    >
      <Typography
        variant="h6"
        style={{ color }}
        className={classes.numberCellsTitle}
      >
        {formatNumber(value, decimalPlaces)}
        <Hidden smUp>
          &nbsp;
          <Typography variant="h6" component="span">
            {unit}
          </Typography>
        </Hidden>
      </Typography>
    </TableCell>
  );
};

const RowAlertCell = ({
  reef: { alertLevel },
  classes,
}: {
  reef: Row;
  classes: ReefTableBodyProps["classes"];
}) => {
  return (
    <TableCell className={classes.cellTextAlign}>
      <ErrorIcon
        style={{
          color: alertColorFinder(alertLevel),
        }}
      />
    </TableCell>
  );
};

RowNumberCell.defaultProps = {
  unit: "",
  color: colors.black,
  decimalPlaces: 1,
  extended: false,
};

const ReefTableBody = ({
  order,
  orderBy,
  extended,
  collection,
  scrollOnSelection,
  classes,
}: ReefTableBodyProps) => {
  const dispatch = useDispatch();
  const storedReefs = useSelector(reefsToDisplayListSelector);
  const reefsList = collection?.reefs || storedReefs || [];
  const reefOnMap = useSelector(reefOnMapSelector);
  const [selectedRow, setSelectedRow] = useState<number>();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"));

  const handleClick = (event: unknown, reef: Row) => {
    setSelectedRow(reef.tableData.id);
    dispatch(setSearchResult());
    dispatch(setReefOnMap(reefsList[reef.tableData.id]));
  };

  useEffect(() => {
    const index = reefsList.findIndex((item) => item.id === reefOnMap?.id);
    setSelectedRow(index);
  }, [reefOnMap, reefsList]);

  // scroll to the relevant reef row when reef is selected.
  useEffect(() => {
    const child = document.getElementById(`homepage-table-row-${selectedRow}`);
    // only scroll if not on mobile (info at the top is more useful than the reef row)
    if (child && !isMobile && scrollOnSelection) {
      child.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [isMobile, scrollOnSelection, selectedRow]);

  return (
    <TableBody>
      {stableSort<Row>(
        constructTableData(reefsList),
        getComparator(order, orderBy)
      ).map((reef) => {
        return (
          <TableRow
            id={`homepage-table-row-${reef.tableData.id}`}
            hover
            className={classes.tableRow}
            style={{
              backgroundColor:
                reef.tableData.id === selectedRow
                  ? colors.lighterBlue
                  : "white",
            }}
            onClick={(event) => handleClick(event, reef)}
            role="button"
            tabIndex={-1}
            key={reef.tableData.id}
          >
            <RowNameCell
              reef={reef}
              classes={{
                ...classes,
                nameCells: extended
                  ? classes.extendedTableNameCells
                  : classes.nameCells,
              }}
            />
            <RowNumberCell
              extended={extended}
              classes={classes}
              value={reef.sst}
              color={extended ? colors.black : colors.lightBlue}
              unit="°C"
            />
            {extended && (
              <RowNumberCell
                extended={extended}
                classes={classes}
                value={reef.historicMax}
                color={colors.black}
                unit="°C"
              />
            )}
            {extended && (
              <RowNumberCell
                extended={extended}
                classes={classes}
                value={reef.sstAnomaly}
                color={colors.black}
                unit="°C"
              />
            )}
            <RowNumberCell
              extended={extended}
              classes={classes}
              value={reef.dhw}
              color={dhwColorFinder(reef.dhw)}
              unit="DHW"
            />
            {extended && (
              <RowNumberCell
                extended={extended}
                classes={classes}
                value={reef.buoyTop}
                color={colors.black}
                unit="°C"
              />
            )}
            {extended && (
              <RowNumberCell
                extended={extended}
                classes={classes}
                value={reef.buoyBottom}
                color={colors.black}
                unit="°C"
              />
            )}
            <RowAlertCell reef={reef} classes={classes} />
          </TableRow>
        );
      })}
    </TableBody>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    nameCells: {
      paddingLeft: 10,
      [theme.breakpoints.down("xs")]: { width: "35%", paddingRight: 0 },
    },
    extendedTableNameCells: {
      paddingLeft: 10,
      [theme.breakpoints.down("xs")]: { width: "10%", paddingRight: 0 },
    },
    regionName: {
      color: "gray",
    },
    numberCellsTitle: {
      [theme.breakpoints.down("xs")]: { fontWeight: 600 },
    },
    cellTextAlign: {
      textAlign: "left",
      [theme.breakpoints.down("xs")]: {
        textAlign: "right",
      },
    },
    cellTextAlignExtended: {
      [theme.breakpoints.down("xs")]: {
        paddingLeft: 10,
        paddingRight: 0,
        textAlign: "left",
      },
    },
    tableRow: {
      cursor: "pointer",
      borderTop: `1px solid ${theme.palette.grey["300"]}`,
    },
  });

type ReefTableBodyIncomingProps = {
  order: Order;
  orderBy: OrderKeys;
  extended?: boolean;
  collection?: Collection;
  scrollOnSelection?: boolean;
};

ReefTableBody.defaultProps = {
  extended: false,
  collection: undefined,
  scrollOnSelection: true,
};

type ReefTableBodyProps = WithStyles<typeof styles> &
  ReefTableBodyIncomingProps;

export default withStyles(styles)(ReefTableBody);
