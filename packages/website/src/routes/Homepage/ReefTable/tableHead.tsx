import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
} from "@material-ui/core";
import type { Order, OrderKeys } from "./utils";

const columnTitle = (title: string, unit?: string) => (
  <>
    <Typography variant="h6" style={{ color: "black" }}>
      {title}
      {unit && (
        <Typography
          variant="subtitle2"
          style={{ color: "black" }}
          component="span"
        >{`\u00a0 (${unit})`}</Typography>
      )}
    </Typography>
  </>
);

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
      disablePadding: true,
      label: "REEF",
    },
    {
      id: "temp",
      numeric: false,
      disablePadding: false,
      label: "TEMP",
      unit: "°C",
    },
    {
      id: "depth",
      numeric: true,
      disablePadding: false,
      label: "DEPTH",
      unit: "m",
    },
    {
      id: "dhw",
      numeric: true,
      disablePadding: false,
      label: "STRESS",
      unit: "DHW",
    },
    {
      id: "alert",
      numeric: true,
      disablePadding: false,
      label: "ALERT",
    },
  ];

  return (
    <TableHead style={{ backgroundColor: "#cacbd1" }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={props.orderBy === headCell.id ? props.order : false}
          >
            <TableSortLabel
              active={props.orderBy === headCell.id}
              direction={props.orderBy === headCell.id ? props.order : "asc"}
              onClick={
                headCell.id !== "alert"
                  ? createSortHandler(headCell.id)
                  : () => {}
              }
            >
              {columnTitle(headCell.label, headCell.unit)}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

interface HeadCell {
  disablePadding: boolean;
  id: OrderKeys | "alert";
  label: string;
  numeric: boolean;
  unit?: string;
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
