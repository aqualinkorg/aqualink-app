import React, { ChangeEvent } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Box,
  Typography,
  Select,
  MenuItem,
} from '@material-ui/core';

import { Range } from 'store/Sites/types';

const SelectRange = ({
  open,
  value,
  setOpen,
  onRangeChange,
  classes,
}: SelectRangeProps) => {
  return (
    <Grid item className={classes.selectorWrapper}>
      <Box display="flex" alignItems="flex-end">
        <Typography variant="h6" color="textSecondary">
          Time range:
        </Typography>
        <Select
          className={classes.selector}
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
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
      </Box>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    selectorWrapper: {
      height: '3rem',
    },
    selector: {
      marginLeft: '0.5rem',
      height: '2rem',
    },
  });

interface SelectRangeIncomingProps {
  open: boolean;
  value: Range;
  setOpen: (open: boolean) => void;
  onRangeChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

type SelectRangeProps = SelectRangeIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SelectRange);
