import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
} from "@material-ui/core";
import type { Order } from "./types";

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
  const createSortHandler = (
    property: "locationName" | "temp" | "depth" | "dhw"
  ) => (event: React.MouseEvent<unknown>) => {
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
      id: "dhw",
      numeric: true,
      disablePadding: false,
      label: "ALERT",
    },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={props.orderBy === headCell.id ? props.order : false}
          >
            <TableSortLabel
              active={props.orderBy === headCell.id}
              direction={props.orderBy === headCell.id ? props.order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {columnTitle(headCell.label, headCell.unit)}
              {props.orderBy === headCell.id ? (
                <span>
                  {props.order === "desc"
                    ? "sorted descending"
                    : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

interface HeadCell {
  disablePadding: boolean;
  id: "locationName" | "temp" | "depth" | "dhw";
  label: string;
  numeric: boolean;
  unit?: string;
}

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: "locationName" | "temp" | "depth" | "dhw"
  ) => void;
  order: Order;
  orderBy: string;
}

export default EnhancedTableHead;
