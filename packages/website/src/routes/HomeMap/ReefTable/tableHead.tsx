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

const ColumnTitle = ({ title, unit }: { title: string; unit?: string }) => (
  <Typography variant="h6" style={{ color: "black" }} noWrap>
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
};

const EnhancedTableHead = (props: EnhancedTableProps) => {
  const createSortHandler = (property: OrderKeys) => (
    event: React.MouseEvent<unknown>
  ) => {
    props.onRequestSort(event, property);
  };

  const headCells: HeadCell[] = [
    {
      id: OrderKeys.LOCATION_NAME,
      label: "SITE",
      width: "40%",
    },
    {
      id: OrderKeys.TEMP,
      label: "SST",
      unit: "°C",
    },
    {
      id: OrderKeys.DHW,
      label: "STRESS",
      unit: "DHW",
    },
    {
      id: OrderKeys.ALERT,
      label: "ALERT",
      width: "5%",
    },
  ];

  return (
    <TableHead style={{ backgroundColor: "rgb(244, 244, 244)" }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            className={props.classes.headCells}
            key={headCell.id}
            style={{ width: headCell.width }}
            align="left"
            padding="default"
            sortDirection={props.orderBy === headCell.id ? props.order : false}
          >
            <TableSortLabel
              active={props.orderBy === headCell.id}
              direction={props.orderBy === headCell.id ? props.order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              <ColumnTitle title={headCell.label} unit={headCell.unit} />
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

interface HeadCell {
  id: OrderKeys;
  label: string;
  unit?: string;
  width?: string;
}

interface EnhancedTableIncomingProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: OrderKeys
  ) => void;
  order: Order;
  orderBy: OrderKeys;
}

const styles = () =>
  createStyles({
    headCells: {
      paddingRight: 0,
      paddingLeft: 10,
    },
  });

type EnhancedTableProps = WithStyles<typeof styles> &
  EnhancedTableIncomingProps;

export default withStyles(styles)(EnhancedTableHead);
