import React, { ChangeEvent } from "react";
import {
  Grid,
  Typography,
  Select,
  MenuItem,
  GridSize,
} from "@material-ui/core";

import { Range } from "../../store/Reefs/types";

const SelectRange = ({
  open,
  value,
  width,
  onClose,
  onOpen,
  onRangeChange,
}: SelectRangeProps) => {
  return (
    <Grid
      alignItems="baseline"
      container
      justify="flex-end"
      item
      xs={width}
      spacing={2}
    >
      <Grid item>
        <Typography variant="h6" color="textSecondary">
          Time range:
        </Typography>
      </Grid>
      <Grid item>
        <Select
          open={open}
          onClose={onClose}
          onOpen={onOpen}
          value={value}
          onChange={onRangeChange}
        >
          <MenuItem value="day">
            <Typography color="textSecondary">One day</Typography>
          </MenuItem>
          <MenuItem value="week">
            <Typography color="textSecondary">One week</Typography>
          </MenuItem>
        </Select>
      </Grid>
    </Grid>
  );
};

interface SelectRangeProps {
  open: boolean;
  value: Range;
  width: GridSize;
  onClose: () => void;
  onOpen: () => void;
  onRangeChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

export default SelectRange;
