import { useState, ChangeEvent, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Theme,
  Grid,
  Typography,
  MenuItem,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';

import { diveLocationSelector } from 'store/Survey/surveySlice';
import { SurveyData, SurveyState } from 'store/Survey/types';
import { setTimeZone } from 'helpers/dates';
import { DateTime } from 'luxon-extensions';
import {
  LocalizationProvider,
  TimePicker,
  DatePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface SurveyFormFields {
  diveDate: string;
  diveTime: string;
  comments: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      color: 'black',
      '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    section: {
      marginBottom: '1rem',
    },
    extraMargin: {
      marginBottom: '2rem',
    },
  }),
);

function SurveyForm({ siteId, timeZone = null, onSubmit }: SurveyFormProps) {
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const diveLocation = useSelector(diveLocationSelector);
  const [diveDateTime, setDiveDateTime] = useState<Date | null>(null);
  const [weather, setWeather] =
    useState<SurveyData['weatherConditions']>('calm');
  const itemsSize = isMobile ? 'small' : 'medium';

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    control,
  } = useForm<SurveyFormFields>({
    reValidateMode: 'onSubmit',
  });

  const handleDiveDateTimeChange = (date: Date | null) => {
    if (date) {
      setDiveDateTime(date);
    }
  };

  const handleWeatherChange = (event: ChangeEvent<{ value: unknown }>) => {
    setWeather(event.target.value as SurveyData['weatherConditions']);
  };

  const nativeSubmit = useCallback(
    (data: { comments: string }) => {
      if (diveDateTime) {
        const dateTime = new Date(
          setTimeZone(diveDateTime, timeZone) || diveDateTime,
        ).toISOString();
        const weatherConditions = weather;
        const { comments } = data;
        onSubmit(dateTime, diveLocation, weatherConditions, comments);
      }
    },
    [onSubmit, diveDateTime, timeZone, weather, diveLocation],
  );

  const resetForm = () => {
    reset({
      diveTime: undefined,
      diveDate: undefined,
      comments: undefined,
    });
    setDiveDateTime(null);
    setWeather('calm');
  };

  return (
    <form onSubmit={handleSubmit(nativeSubmit)}>
      {/* Dive Date and Time */}
      <Grid
        className={classes.section}
        container
        justifyContent="space-between"
        spacing={2}
      >
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Dive Date
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="diveDate"
              control={control}
              rules={{
                required: 'This is a required field',
                validate: {
                  validDate: (value) =>
                    DateTime.fromFormat(value, 'LL/dd/yyyy', { zone: 'UTC' })
                      .isValid || 'Invalid date',
                },
              }}
              render={({ field }) => (
                <DatePicker
                  className={classes.textField}
                  format="MM/dd/yyyy"
                  closeOnSelect
                  value={diveDateTime}
                  ref={field.ref}
                  onChange={(e) => {
                    field.onChange(e);
                    setValue(
                      'diveTime',
                      DateTime.fromJSDate(e || new Date(NaN)).toFormat('HH:mm'),
                    );
                    setValue(
                      'diveDate',
                      DateTime.fromJSDate(e || new Date(NaN)).toFormat(
                        'LL/dd/yyyy',
                      ),
                    );
                    handleDiveDateTimeChange(e);
                  }}
                  slotProps={{
                    toolbar: {
                      hidden: true,
                    },
                    textField: {
                      className: classes.textField,
                      variant: 'outlined',
                      helperText: errors?.diveDate?.message || '',
                    },

                    openPickerButton: {
                      'aria-label': 'change date',
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Dive Local Time
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="diveTime"
              control={control}
              rules={{
                required: 'This is a required field',
                pattern: {
                  value: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
                  message: 'Invalid time format',
                },
              }}
              render={({ field }) => (
                <TimePicker
                  className={classes.textField}
                  closeOnSelect
                  format="HH:mm"
                  value={diveDateTime}
                  ref={field.ref}
                  onChange={(e) => {
                    field.onChange(e);
                    handleDiveDateTimeChange(e);
                  }}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      helperText: errors?.diveTime?.message || '',
                      error: !!errors.diveTime,
                      className: classes.textField,
                    },
                    openPickerButton: {
                      'aria-label': 'change time',
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom>
        Dive Location
      </Typography>
      <Grid className={classes.section} container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="LAT"
            label="Latitude"
            value={diveLocation?.lat || ''}
            disabled
            size={itemsSize}
            slotProps={{
              htmlInput: { className: classes.textField },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="LONG"
            label="Longitude"
            value={diveLocation?.lng || ''}
            disabled
            size={itemsSize}
            slotProps={{
              htmlInput: { className: classes.textField },
            }}
          />
        </Grid>
      </Grid>
      {/* Weather Conditions */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Weather Conditions
        </Typography>
      </Grid>
      <Grid className={classes.extraMargin} item xs={12}>
        <TextField
          className={classes.textField}
          select
          id="weather"
          name="weather"
          value={weather}
          onChange={handleWeatherChange}
          placeholder="Select One"
          fullWidth
          variant="outlined"
          size={itemsSize}
          slotProps={{
            htmlInput: {
              className: classes.textField,
              'data-testid': 'weather',
            },
          }}
        >
          <MenuItem className={classes.textField} value="calm">
            Calm
          </MenuItem>
          <MenuItem className={classes.textField} value="waves">
            Waves
          </MenuItem>
          <MenuItem className={classes.textField} value="storm">
            Stormy
          </MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
      </Grid>
      <Grid className={classes.extraMargin} item xs={12}>
        <Controller
          name="comments"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className={classes.textField}
              variant="outlined"
              multiline
              placeholder="Did anything stand out during this survey?"
              fullWidth
              size={itemsSize}
              slotProps={{
                htmlInput: {
                  className: classes.textField,
                  'data-testid': 'comments',
                },
              }}
            />
          )}
        />
      </Grid>
      {/* SUBMIT */}
      <Grid
        className={classes.section}
        container
        justifyContent="flex-end"
        item
        spacing={2}
      >
        <Grid item>
          <Button
            component={Link}
            href={`/sites/${siteId}`}
            onClick={resetForm}
            color="primary"
            variant="outlined"
            size={itemsSize}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            size={itemsSize}
            onClick={resetForm}
            color="primary"
            variant="outlined"
          >
            Clear
          </Button>
        </Grid>
        <Grid item>
          <Button
            size={itemsSize}
            type="submit"
            color="primary"
            variant="contained"
            data-testid="submit"
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

interface SurveyFormProps {
  siteId: number;
  timeZone?: string | null;
  onSubmit: (
    diveDateTime: string,
    diveLocation: SurveyState['diveLocation'],
    weatherConditions: SurveyData['weatherConditions'],
    comments: string,
  ) => void;
}

export default SurveyForm;
