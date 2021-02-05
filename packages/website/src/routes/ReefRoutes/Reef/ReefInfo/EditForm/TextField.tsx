import React, { ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  TextField,
} from "@material-ui/core";

import { FormField } from "./useFormField";

const CustomTextfield = ({
  formField,
  label,
  placeholder,
  name,
  isNumeric,
  step,
  onChange,
  classes,
}: CustomTextfieldProps) => {
  return (
    <TextField
      className={classes.textField}
      variant="outlined"
      inputProps={{ className: classes.textField, step: step || undefined }}
      fullWidth
      type={isNumeric ? "number" : "text"}
      value={formField.value}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      name={name}
      error={Boolean(formField.error)}
      helperText={formField.error}
    />
  );
};

const styles = () =>
  createStyles({
    textField: {
      color: "black",
      alignItems: "center",
    },
  });

interface CustomTextfieldIncomingProps {
  formField: FormField;
  label: string;
  placeholder: string;
  name: string;
  isNumeric?: boolean;
  step?: number;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

CustomTextfield.defaultProps = {
  isNumeric: false,
  step: 0,
};

type CustomTextfieldProps = CustomTextfieldIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CustomTextfield);
