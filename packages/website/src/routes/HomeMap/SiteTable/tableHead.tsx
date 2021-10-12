import React from "react";
import {
  createStyles,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { Order, OrderKeys } from "./utils";

const ColumnTitle = ({
  title,
  unit,
  bigText,
}: {
  title: string;
  unit?: string;
  bigText?: boolean;
}) => (
  <Typography
    variant={bigText ? "h6" : "subtitle1"}
    style={{ color: "black" }}
    noWrap
  >
    {title}
    {unit && (
      <Typography
        variant="subtitle2"
        style={{ color: "black" }}
        component="span"
      >{` (${unit})`}</Typography>
    )}
  </Typography>
);

ColumnTitle.defaultProps = {
  unit: undefined,
  bigText: undefined,
};

const EnhancedTableHead = (props: EnhancedTableProps) => {
  const createSortHandler = (property: OrderKeys) => (
    event: React.MouseEvent<unknown>
  ) => {
    props.onRequestSort(event, property);
  };

  const { isExtended } = props;

  const headCells: HeadCell[] = [
    {
      id: OrderKeys.LOCATION_NAME,
      label: "SITE",
      width: isExtended ? "20%" : "40%",
      display: true,
    },
    {
      id: OrderKeys.SST,
      label: "SST",
      unit: "°C",
      display: true,
    },
    {
      id: OrderKeys.HISTORIC_MAX,
      label: "HISTORIC MAX",
      unit: "°C",
      display: !!isExtended,
    },
    {
      id: OrderKeys.SST_ANOMALY,
      label: "SST ANOMALY",
      unit: "°C",
      display: !!isExtended,
    },
    {
      id: OrderKeys.DHW,
      label: "STRESS",
      unit: "DHW",
      display: true,
    },
    {
      id: OrderKeys.BUOY_TOP,
      label: "BUOY",
      unit: "1m",
      display: !!isExtended,
    },
    {
      id: OrderKeys.BUOY_BOTTOM,
      label: "BUOY",
      unit: "DEPTH",
      display: !!isExtended,
    },
    {
      id: OrderKeys.ALERT,
      label: "ALERT",
      display: true,
      width: isExtended ? undefined : "5%",
    },
  ];

  return (
    <TableHead style={{ backgroundColor: "rgb(244, 244, 244)" }}>
      <TableRow>
        {headCells.map(
          (headCell) =>
            headCell.display && (
              <TableCell
                className={props.classes.headCells}
                key={headCell.id}
                style={{ width: headCell.width }}
                align="left"
                padding="default"
                sortDirection={
                  props.orderBy === headCell.id ? props.order : false
                }
              >
                <TableSortLabel
                  active={props.orderBy === headCell.id}
                  direction={
                    props.orderBy === headCell.id ? props.order : "asc"
                  }
                  onClick={createSortHandler(headCell.id)}
                >
                  <ColumnTitle
                    title={headCell.label}
                    unit={headCell.unit}
                    bigText={!isExtended}
                  />
                </TableSortLabel>
              </TableCell>
            )
        )}
      </TableRow>
    </TableHead>
  );
};

interface HeadCell {
  id: OrderKeys;
  label: string;
  unit?: string;
  width?: string;
  display: boolean;
}

interface EnhancedTableIncomingProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: OrderKeys
  ) => void;
  order: Order;
  orderBy: OrderKeys;
  isExtended?: boolean;
}

const styles = () =>
  createStyles({
    headCells: {
      paddingRight: 0,
      paddingLeft: 10,
    },
  });

EnhancedTableHead.defaultProps = {
  isExtended: false,
};

type EnhancedTableProps = WithStyles<typeof styles> &
  EnhancedTableIncomingProps;

export default withStyles(styles)(EnhancedTableHead);
