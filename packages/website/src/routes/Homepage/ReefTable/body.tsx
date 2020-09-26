import { TableBody, TableCell, TableRow, Typography } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import React, { CSSProperties, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableRow as Row } from "../../../store/Homepage/types";
import { constructTableData } from "../../../store/Reefs/helpers";
import { colors } from "../../../layout/App/theme";
import { dhwColorFinder } from "../../../helpers/degreeHeatingWeeks";
import { alertFinder } from "../../../helpers/bleachingAlertIntervals";
import { formatNumber } from "../../../helpers/numberUtils";
import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { setReefOnMap } from "../../../store/Homepage/homepageSlice";
import { getComparator, Order, OrderKeys, stableSort } from "./utils";

type ReefTableBodyProps = {
  order: Order;
  orderBy: OrderKeys;
};

const ReefNameCell = ({
  reef: { dhw, locationName, maxMonthlyMean, region, temp },
}: {
  reef: Row;
}) => {
  const { color, level } = alertFinder(maxMonthlyMean, temp, dhw);
  const style: CSSProperties = { color };
  const showWarning = level !== 0;
  // eslint-disable-next-line no-param-reassign
  region = region || "Sample Region";
  return (
    <TableCell>
      <Typography
        align="left"
        variant="h5"
        style={showWarning ? style : undefined}
      >
        {locationName}
        {showWarning && (
          <span style={{ marginLeft: "6px" }}>
            <ErrorIcon style={style} />
          </span>
        )}
      </Typography>

      {locationName !== region && <p style={{ color: "gray" }}>{region}</p>}
    </TableCell>
  );
};
const RowNumberCell = ({
  color,
  name,
  unit,
  decimalPlaces,
  value,
}: {
  color?: string;
  name: string;
  unit?: string;
  value: number | null;
  decimalPlaces?: number;
}) => {
  return (
    <TableCell align="right">
      <Typography
        variant="caption"
        color="textSecondary"
        style={{ fontSize: "1em" }}
      >
        {name.toUpperCase()}
      </Typography>
      <Typography variant="h5" style={{ color, fontWeight: 600 }}>
        {formatNumber(value, decimalPlaces)}
        {unit}
      </Typography>
    </TableCell>
  );
};
RowNumberCell.defaultProps = {
  unit: "",
  color: "black",
  decimalPlaces: 1,
};

const ReefTableBody = ({ order, orderBy }: ReefTableBodyProps) => {
  const dispatch = useDispatch();
  const reefsList = useSelector(reefsListSelector);
  const [selectedRow, setSelectedRow] = useState<number>();

  const handleClick = (event: unknown, reef: Row) => {
    setSelectedRow(reef.tableData.id);
    dispatch(setReefOnMap(reefsList[reef.tableData.id]));
  };

  return (
    <TableBody>
      {stableSort<Row>(
        constructTableData(reefsList),
        getComparator(order, orderBy)
      ).map((reef) => {
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
            key={reef.tableData.id}
          >
            <ReefNameCell reef={reef} />
            <RowNumberCell
              name="Temp"
              value={reef.temp}
              color={colors.lightBlue}
              unit="°C"
            />
            <RowNumberCell
              name="Depth"
              value={reef.depth}
              unit="m"
              decimalPlaces={0}
            />
            <RowNumberCell
              name="DHW"
              value={reef.dhw}
              color={dhwColorFinder(reef.dhw)}
            />
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default ReefTableBody;
