import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
} from "@material-ui/core";
import type { Order, OrderKeys } from "./utils";

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
      id: "locationName",
      numeric: false,
      label: "REEF",
      width: "25%",
    },
    {
      id: "temp",
      numeric: false,
      label: "TEMP",
      unit: "°C",
    },
    {
      id: "depth",
      numeric: true,
      label: "DEPTH",
      unit: "m",
    },
    {
      id: "dhw",
      numeric: true,
      label: "STRESS",
      unit: "DHW",
    },
    {
      id: "alert",
      numeric: true,
      label: "ALERT",
      width: "5%",
    },
  ];

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
  id: OrderKeys | "alert";
  label: string;
  numeric: boolean;
  unit?: string;
  width?: string;
}

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: OrderKeys
  ) => void;
  order: Order;
  orderBy: string;
}

export default EnhancedTableHead;
