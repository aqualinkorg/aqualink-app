import { MenuItem, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { colors } from 'layout/App/theme';
import React from 'react';
import { Status } from 'store/Sites/types';

const options: Status[] = [
  'in_review',
  'rejected',
  'approved',
  'shipped',
  'deployed',
  'maintenance',
  'lost',
  'end_of_life',
];

const useStyles = makeStyles(() => ({
  menuItem: {
    color: colors.black,
    height: '2rem',
  },
}));

interface StatusSelectorProps {
  status: Status | '';
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  textFieldStyle?: string;
  name?: string;
}

function StatusSelector({
  status,
  onChange,
  textFieldStyle,
  name,
}: StatusSelectorProps) {
  const classes = useStyles();

  return (
    <TextField
      className={textFieldStyle}
      select
      label="Status"
      value={status}
      onChange={onChange}
      variant="outlined"
      style={{ minWidth: '10rem' }}
      name={name}
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

export default StatusSelector;
