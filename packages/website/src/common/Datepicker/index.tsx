import React from 'react';
import { Theme, Grid, Box, Typography, TypographyProps } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DateTime } from 'luxon-extensions';

const DatePicker = ({
  value,
  dateName,
  dateNameTextVariant,
  pickerSize,
  autoOk,
  timeZone,
  onChange,
  classes,
}: DatePickerProps) => {
  return (
    <Grid item>
      <Box display="flex" alignItems="flex-end">
        <Typography variant={dateNameTextVariant || 'h6'} color="textSecondary">
          {`${dateName || 'Date'}:`}
        </Typography>
        <div className={classes.datePicker}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              size={pickerSize}
              className={classes.textField}
              helperText=""
              disableToolbar
              format="MM/dd/yyyy"
              name="datePicker"
              maxDate={DateTime.now()
                .setZone(timeZone || 'UTC')
                .toFormat('yyyy/MM/dd')}
              minDate={DateTime.fromMillis(0).toFormat('yyyy/MM/dd')}
              autoOk={autoOk}
              showTodayButton
              value={value || null}
              onChange={onChange}
              InputProps={{
                className: classes.textField,
                inputProps: { className: classes.smallPadding },
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
      marginLeft: '0.5rem',
    },
    calendarButton: {
      padding: '0 0 2px 0',
    },
    smallPadding: {
      paddingBottom: 2,
    },
    textField: {
      width: 115,
      color: 'black',
      '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  });

interface DatePickerIncomingProps {
  value: string | null;
  dateName?: string;
  dateNameTextVariant?: TypographyProps['variant'];
  pickerSize?: KeyboardDatePickerProps['size'];
  autoOk?: boolean;
  timeZone: string | null | undefined;
  onChange: (date: MaterialUiPickersDate, value?: string | null) => void;
}

DatePicker.defaultProps = {
  dateName: undefined,
  dateNameTextVariant: undefined,
  pickerSize: undefined,
  autoOk: true,
};

type DatePickerProps = DatePickerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DatePicker);
