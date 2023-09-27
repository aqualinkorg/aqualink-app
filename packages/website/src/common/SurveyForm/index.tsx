import React, { useState, useCallback, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Typography,
  MenuItem,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import EventIcon from '@material-ui/icons/Event';
import { Link } from 'react-router-dom';
import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useForm, Controller } from 'react-hook-form';

import { diveLocationSelector } from 'store/Survey/surveySlice';
import { SurveyData, SurveyState } from 'store/Survey/types';
import { setTimeZone } from 'helpers/dates';
import { DateTime } from 'luxon-extensions';

interface SurveyFormFields {
  diveDate: string;
  diveTime: string;
  comments: string;
}

const SurveyForm = ({
  siteId,
  timeZone,
  onSubmit,
  classes,
}: SurveyFormProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const diveLocation = useSelector(diveLocationSelector);
  const [diveDateTime, setDiveDateTime] = useState<Date | null>(null);
  const [weather, setWeather] =
    useState<SurveyData['weatherConditions']>('calm');
  const itemsSize = isMobile ? 'small' : 'medium';
  const iconSize = isMobile ? 'small' : 'default';

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
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
                <KeyboardDatePicker
                  className={classes.textField}
                  disableToolbar
                  format="MM/dd/yyyy"
                  fullWidth
                  id="dive-date"
                  autoOk
                  showTodayButton
                  size={itemsSize}
                  helperText={errors?.diveDate?.message || ''}
                  error={!!errors.diveDate}
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
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  inputProps={{
                    className: classes.textField,
                  }}
                  inputVariant="outlined"
                  keyboardIcon={<EventIcon fontSize={iconSize} />}
                />
              )}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Dive Local Time
          </Typography>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
                <KeyboardTimePicker
                  className={classes.textField}
                  id="time-picker"
                  fullWidth
                  autoOk
                  size={itemsSize}
                  helperText={errors?.diveTime?.message || ''}
                  error={!!errors.diveTime}
                  format="HH:mm"
                  value={diveDateTime}
                  ref={field.ref}
                  onChange={(e) => {
                    field.onChange(e);
                    handleDiveDateTimeChange(e);
                  }}
                  KeyboardButtonProps={{
                    'aria-label': 'change time',
                  }}
                  InputProps={{
                    className: classes.textField,
                  }}
                  keyboardIcon={<AccessTimeIcon fontSize={iconSize} />}
                  inputVariant="outlined"
                />
              )}
            />
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom>
        Dive Location
      </Typography>
      <Grid className={classes.section} container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            placeholder="LAT"
            label="Latitude"
            value={diveLocation?.lat || ''}
            disabled
            size={itemsSize}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            placeholder="LONG"
            label="Longitude"
            value={diveLocation?.lng || ''}
            disabled
            size={itemsSize}
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
          inputProps={{
            className: classes.textField,
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
              inputProps={{
                className: classes.textField,
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
            to={`/sites/${siteId}`}
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
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

const styles = (theme: Theme) =>
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
  });

interface SurveyFormIncomingProps {
  siteId: number;
  timeZone?: string | null;
  onSubmit: (
    diveDateTime: string,
    diveLocation: SurveyState['diveLocation'],
    weatherConditions: SurveyData['weatherConditions'],
    comments: string,
  ) => void;
}

SurveyForm.defaultProps = {
  timeZone: null,
};

type SurveyFormProps = SurveyFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyForm);
