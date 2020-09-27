import {
  Hidden,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@material-ui/core";
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
import { useIsMobile } from "../../../helpers/useIsMobile";

type ReefTableBodyProps = {
  order: Order;
  orderBy: OrderKeys;
};

const ReefNameCell = ({
  reef: { dhw, locationName, maxMonthlyMean, region = "Sample Region", temp },
}: {
  reef: Row;
}) => {
  const { color, level } = alertFinder(maxMonthlyMean, temp, dhw);
  const style: CSSProperties = { color };
  const isMobile = useIsMobile();
  const showWarning = level !== 0 && isMobile;
  return (
    <TableCell style={isMobile ? { width: "40%" } : undefined}>
      <Typography
        align="left"
        variant="h5"
        color="textSecondary"
        style={showWarning ? style : undefined}
      >
        {locationName}
        {showWarning && (
          <>
            {"   "}
            <ErrorIcon style={style} />
          </>
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
  const isMobile = useIsMobile();
  return (
    <TableCell align={isMobile ? "right" : "left"}>
      {isMobile && (
        <Typography
          variant="caption"
          color="textSecondary"
          style={{ fontSize: "1em" }}
        >
          {name.toUpperCase()}
        </Typography>
      )}
      <Typography variant="h5" style={{ color, fontWeight: 600 }}>
        {formatNumber(value, decimalPlaces)}
        {isMobile && unit}
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
              borderTop: "1px solid rgba(224, 224, 224, 1)",
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
            <Hidden xsDown>
              <TableCell>
                <ErrorIcon
                  style={{
                    color: alertFinder(reef.maxMonthlyMean, reef.temp, reef.dhw)
                      .color,
                  }}
                />
              </TableCell>
            </Hidden>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default ReefTableBody;
