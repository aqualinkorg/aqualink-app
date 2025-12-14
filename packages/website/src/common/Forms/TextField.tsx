import React, { ChangeEvent, FocusEvent } from 'react';
import { TextField, BaseTextFieldProps } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { FormField } from 'hooks/useFormField';

function CustomTextfield({
  formField,
  label,
  placeholder,
  name,
  isNumeric = false,
  step = 0,
  fullWidth = true,
  size,
  disabled,
  onChange,
  onBlur,
  onFocus,
  classes,
  select = false,
}: CustomTextfieldProps) {
  return (
    <TextField
      disabled={disabled}
      className={classes.textField}
      variant="outlined"
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
      slotProps={{
        htmlInput: { className: classes.textField, step: step || undefined },
      }}
    />
  );
}

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

type CustomTextfieldProps = CustomTextfieldIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CustomTextfield);
