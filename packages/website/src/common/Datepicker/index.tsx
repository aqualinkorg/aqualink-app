import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Box,
  Typography,
} from "@material-ui/core";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const DatePicker = ({ value, onChange, classes }: DatePickerProps) => {
  return (
    <Grid item>
      <Box display="flex" alignItems="flex-end">
        <Typography variant="h6" color="textSecondary">
          Until:
        </Typography>
        <div className={classes.datePicker}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              className={classes.textField}
              disableToolbar
              format="MM/dd/yyyy"
              id="date-picker"
              name="datePicker"
              autoOk
              showTodayButton
              disableFuture
              value={value || null}
              onChange={onChange}
              inputProps={{
                className: classes.textField,
              }}
              inputVariant="standard"
            />
          </MuiPickersUtilsProvider>
        </div>
      </Box>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    datePicker: {
      marginLeft: "0.5rem",
    },
    textField: {
      width: "10rem",
      color: "black",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
  });

interface DatePickerIncomingProps {
  value: string | null;
  onChange: (date: MaterialUiPickersDate, value?: string | null) => void;
}

type DatePickerProps = DatePickerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DatePicker);
