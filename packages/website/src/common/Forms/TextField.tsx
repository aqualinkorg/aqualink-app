import React, { ChangeEvent, FocusEvent } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  TextField,
  BaseTextFieldProps,
} from '@material-ui/core';

import { FormField } from 'hooks/useFormField';

const CustomTextfield = ({
  formField,
  label,
  placeholder,
  name,
  isNumeric,
  step,
  fullWidth,
  size,
  disabled,
  onChange,
  onBlur,
  onFocus,
  classes,
  select = false,
}: CustomTextfieldProps) => {
  return (
    <TextField
      disabled={disabled}
      className={classes.textField}
      variant="outlined"
      inputProps={{ className: classes.textField, step: step || undefined }}
      fullWidth={fullWidth}
      type={isNumeric ? 'number' : 'text'}
      value={formField.value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      label={label}
      placeholder={placeholder}
      name={name}
      error={Boolean(formField.error)}
      helperText={formField.error}
      size={size}
      select={select}
    />
  );
};

const styles = () =>
  createStyles({
    textField: {
      color: 'black',
      alignItems: 'center',
    },
  });

interface CustomTextfieldIncomingProps {
  formField: FormField<string>;
  label: string;
  placeholder: string;
  name: string;
  isNumeric?: boolean;
  step?: number;
  fullWidth?: boolean;
  size?: BaseTextFieldProps['size'];
  disabled?: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  select?: boolean;
}

CustomTextfield.defaultProps = {
  isNumeric: false,
  fullWidth: true,
  size: undefined,
  step: 0,
};

type CustomTextfieldProps = CustomTextfieldIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CustomTextfield);
