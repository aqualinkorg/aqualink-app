import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
} from "@material-ui/core";
import type { Order, OrderKeys } from "./utils";

const headCells: HeadCell[] = [
  {
    id: "locationName",
    label: "REEF",
    width: "25%",
  },
  {
    id: "temp",
    label: "TEMP",
    unit: "°C",
  },
  {
    id: "depth",
    label: "DEPTH",
    unit: "m",
  },
  {
    id: "dhw",
    label: "STRESS",
    unit: "DHW",
  },
];

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

  return (
    <TableHead style={{ backgroundColor: "rgb(244, 244, 244)" }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            style={{ width: headCell.width, paddingRight: 0 }}
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

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: OrderKeys
  ) => void;
  order: Order;
  orderBy: OrderKeys;
}

export default EnhancedTableHead;
