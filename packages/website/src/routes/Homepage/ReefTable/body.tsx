import {
  TableBody,
  TableCell,
  TableRow,
  Typography,
  createStyles,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableRow as Row } from "../../../store/Homepage/types";
import { constructTableData } from "../../../store/Reefs/helpers";
import { colors } from "../../../layout/App/theme";
import { dhwColorFinder } from "../../../helpers/degreeHeatingWeeks";
import { formatNumber } from "../../../helpers/numberUtils";
import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import {
  reefOnMapSelector,
  setReefOnMap,
} from "../../../store/Homepage/homepageSlice";
import { getComparator, Order, OrderKeys, stableSort } from "./utils";
import { useIsMobile } from "../../../helpers/useIsMobile";
import { alertColorFinder } from "../../../helpers/bleachingAlertIntervals";

const RowNameCell = ({
  reef: { locationName, region },
  ...rest
}: {
  reef: Row;
  className: string;
}) => {
  const isMobile = useIsMobile();
  return (
    <TableCell
      style={isMobile ? { width: "35%", paddingRight: 0 } : undefined}
      {...rest}
    >
      <Typography align="left" variant="h6" color="textSecondary">
        {locationName}
      </Typography>

      {locationName !== region && region && (
        <p style={{ color: "gray" }}>{region}</p>
      )}
    </TableCell>
  );
};

const RowNumberCell = ({
  color,
  unit,
  decimalPlaces,
  value,
}: {
  color?: string;
  unit?: string;
  value: number | null;
  decimalPlaces?: number;
}) => {
  const isMobile = useIsMobile();
  return (
    <TableCell align={isMobile ? "right" : "left"}>
      <Typography
        variant={isMobile ? "h6" : "subtitle1"}
        style={{ color, fontWeight: isMobile ? 600 : undefined }}
      >
        {formatNumber(value, decimalPlaces)}
        &nbsp;
        {isMobile && (
          <Typography variant="h6" component="span">
            {unit}
          </Typography>
        )}
      </Typography>
    </TableCell>
  );
};

const RowAlertCell = ({ reef: { alertLevel } }: { reef: Row }) => {
  const isMobile = useIsMobile();
  return (
    <TableCell align={isMobile ? "right" : "left"}>
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
  color: "black",
  decimalPlaces: 1,
};

const ReefTableBody = ({ order, orderBy, classes }: ReefTableBodyProps) => {
  const dispatch = useDispatch();
  const reefsList = useSelector(reefsListSelector);
  const reefOnMap = useSelector(reefOnMapSelector);
  const [selectedRow, setSelectedRow] = useState<number>();

  const handleClick = (event: unknown, reef: Row) => {
    setSelectedRow(reef.tableData.id);
    dispatch(setReefOnMap(reefsList[reef.tableData.id]));
  };

  useEffect(() => {
    const index = reefsList.findIndex((item) => item.id === reefOnMap?.id);
    setSelectedRow(index);
  }, [reefOnMap, reefsList]);

  useEffect(() => {
    const child = document.getElementById(`homepage-table-row-${selectedRow}`);
    if (child) {
      child.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [selectedRow]);

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
            style={{
              backgroundColor:
                reef.tableData.id === selectedRow
                  ? colors.lighterBlue
                  : "white",
              cursor: "pointer",
              borderTop: "1px solid rgba(224, 224, 224, 1)",
            }}
            onClick={(event) => handleClick(event, reef)}
            role="button"
            tabIndex={-1}
            key={reef.tableData.id}
          >
            <RowNameCell reef={reef} className={classes.nameCells} />
            <RowNumberCell
              value={reef.temp}
              color={colors.lightBlue}
              unit="°C"
            />
            <RowNumberCell
              value={reef.dhw}
              color={dhwColorFinder(reef.dhw)}
              unit="DHW"
            />
            <RowAlertCell reef={reef} />
          </TableRow>
        );
      })}
    </TableBody>
  );
};

const styles = () =>
  createStyles({
    nameCells: {
      paddingLeft: 10,
    },
  });

type ReefTableBodyIncomingProps = {
  order: Order;
  orderBy: OrderKeys;
};

type ReefTableBodyProps = WithStyles<typeof styles> &
  ReefTableBodyIncomingProps;

export default withStyles(styles)(ReefTableBody);
