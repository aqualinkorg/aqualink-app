import { Theme, Grid, Box, Typography, TypographyProps } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { DateTime } from 'luxon-extensions';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO } from 'date-fns';

const DatePicker = ({
  value,
  dateName,
  dateNameTextVariant,
  autoOk = true,
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
              format="MM/dd/yyyy"
              maxDate={DateTime.now()
                .setZone(timeZone || 'UTC')
                .toJSDate()}
              minDate={DateTime.fromMillis(0).toJSDate()}
              closeOnSelect={autoOk}
              value={parseISO(value ?? '')}
              onChange={(v) => onChange(v)}
              slotProps={{
                textField: {
                  variant: 'standard',
                  className: classes.textField,
                },
                toolbar: { hidden: true },
              }}
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
    textField: {
      width: 120,
      color: 'black',
      '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '& input': {
        paddingTop: 0,
        paddingBottom: 0,
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

type DatePickerProps = DatePickerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DatePicker);
