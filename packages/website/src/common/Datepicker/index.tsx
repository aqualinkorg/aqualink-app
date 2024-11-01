import React from 'react';
import {
  Theme,
  Grid,
  Box,
  Typography,
  TypographyProps,
  TextField,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { DateTime } from 'luxon-extensions';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const DatePicker = ({
  value,
  dateName,
  dateNameTextVariant,
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MuiDatePicker
              className={classes.textField}
              showToolbar={false}
              inputFormat="MM/dd/yyyy"
              maxDate={DateTime.now()
                .setZone(timeZone || 'UTC')
                .toFormat('yyyy/MM/dd')}
              minDate={DateTime.fromMillis(0).toFormat('yyyy/MM/dd')}
              closeOnSelect={autoOk}
              value={value || null}
              onChange={(v) => onChange(new Date(v as string))}
              renderInput={(params) => <TextField {...params} />}
              InputProps={{
                className: classes.textField,
                inputProps: { className: classes.smallPadding },
              }}
              // slots={{
              //   openPickerButton: <CalendarTodayIcon fontSize="small" />,
              // }}
              OpenPickerButtonProps={{ className: classes.calendarButton }}
            />
          </LocalizationProvider>
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
  autoOk?: boolean;
  timeZone: string | null | undefined;
  onChange: (date: Date | null, keyboardInput?: string) => void;
}

DatePicker.defaultProps = {
  dateName: undefined,
  dateNameTextVariant: undefined,
  autoOk: true,
};

type DatePickerProps = DatePickerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DatePicker);
