import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Box,
  Typography,
  TypographyProps,
} from "@material-ui/core";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const DatePicker = ({
  value,
  dateName,
  nameVariant,
  pickerSize,
  minDate,
  maxDate,
  autoOk,
  onChange,
  classes,
}: DatePickerProps) => {
  return (
    <Grid item>
      <Box display="flex" alignItems="flex-end">
        <Typography variant={nameVariant || "h6"} color="textSecondary">
          {`${dateName || "Date"}:`}
        </Typography>
        <div className={classes.datePicker}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              size={pickerSize}
              className={classes.textField}
              disableToolbar
              format="MM/dd/yyyy"
              name="datePicker"
              autoOk={autoOk}
              minDate={minDate}
              maxDate={maxDate}
              showTodayButton
              disableFuture
              value={value || null}
              onChange={onChange}
              inputProps={{
                className: classes.textField,
              }}
              inputVariant="standard"
              KeyboardButtonProps={{ className: classes.calendarButton }}
              keyboardIcon={<CalendarTodayIcon fontSize="small" />}
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
    calendarButton: {
      padding: 0,
    },
    textField: {
      width: "7.5rem",
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
  dateName?: string;
  nameVariant?: TypographyProps["variant"];
  pickerSize?: KeyboardDatePickerProps["size"];
  minDate?: KeyboardDatePickerProps["minDate"];
  maxDate?: KeyboardDatePickerProps["minDate"];
  autoOk?: boolean;
  onChange: (date: MaterialUiPickersDate, value?: string | null) => void;
}

DatePicker.defaultProps = {
  dateName: undefined,
  nameVariant: undefined,
  pickerSize: undefined,
  minDate: undefined,
  maxDate: undefined,
  autoOk: true,
};

type DatePickerProps = DatePickerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DatePicker);
