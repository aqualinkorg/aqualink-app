import { makeStyles, MenuItem, TextField } from '@material-ui/core';
import { colors } from 'layout/App/theme';
import React from 'react';
import { Status } from 'store/Sites/types';

const options: Status[] = [
  'in_review',
  'rejected',
  'approved',
  'shipped',
  'deployed',
];

interface StatusSelectorProps {
  status: Status | '';
  setStatus: React.Dispatch<React.SetStateAction<'' | Status>>;
  textFieldStyle?: string;
}

function StatusSelector({
  status,
  setStatus,
  textFieldStyle,
}: StatusSelectorProps) {
  const classes = useStyles();

  return (
    <TextField
      className={textFieldStyle}
      select
      label="Status"
      value={status}
      onChange={(e) => setStatus(e.target.value as Status | '')}
      variant="outlined"
      style={{ minWidth: '10rem' }}
    >
      <MenuItem className={classes.menuItem} value="" />
      {options.map((x) => (
        <MenuItem key={x} className={classes.menuItem} value={x}>
          {x}
        </MenuItem>
      ))}
    </TextField>
  );
}

const useStyles = makeStyles(() => ({
  menuItem: {
    color: colors.black,
    height: '2rem',
  },
}));

export default StatusSelector;
