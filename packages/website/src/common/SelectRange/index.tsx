import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { Range } from 'store/Sites/types';

function SelectRange({
  open,
  value,
  setOpen,
  onRangeChange,
  classes,
}: SelectRangeProps) {
  return (
    <Grid item className={classes.selectorWrapper}>
      <Box display="flex" alignItems="flex-end">
        <Typography variant="h6" color="textSecondary">
          Time range:
        </Typography>
        <Select
          variant="standard"
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
}

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
  onRangeChange: (event: SelectChangeEvent<unknown>) => void;
}

type SelectRangeProps = SelectRangeIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SelectRange);
