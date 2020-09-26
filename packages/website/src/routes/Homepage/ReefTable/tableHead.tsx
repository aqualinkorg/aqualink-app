import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
  Box,
} from "@material-ui/core";
import type { Order, OrderKeys } from "./utils";

const headCells: HeadCell[] = [
  {
    id: "locationName",
    label: "SITE",
    // TODO should be different on desktop (30% maybe)
    width: "40%",
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
    <div>
      <Typography variant="h4" color="textSecondary" style={{ margin: "10px" }}>
        All Reefs
      </Typography>
    </div>
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
