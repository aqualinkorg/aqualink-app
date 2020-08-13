import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import DateFnsUtils from "@date-io/date-fns";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

import {
  diveLocationSelector,
  setSurveyData,
  commentsSelector,
  diveDateTimeSelector,
  weatherConditionsSelector,
} from "../../../store/Survey/surveySlice";

const SurveyForm = ({ changeTab, classes }: SurveyFormProps) => {
  const diveLocation = useSelector(diveLocationSelector);
  const surveyDiveDateTime = useSelector(diveDateTimeSelector);
  const surveyWeatherConditions = useSelector(weatherConditionsSelector);
  const surveyComments = useSelector(commentsSelector);
  const [diveDate, setDiveDate] = useState<string | null>(null);
  const [diveTime, setDiveTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<string>("calm");
  const dispatch = useDispatch();

  const { register, errors, handleSubmit, reset, setValue } = useForm({
    reValidateMode: "onSubmit",
  });

  const onSubmit = useCallback(
    (data: any) => {
      const diveDateTime = new Date(
        `${data.diveDate}, ${data.diveTime}`
      ).toISOString();
      const weatherConditions = weather;
      const { comments } = data;
      dispatch(
        setSurveyData({
          diveDateTime,
          comments,
          weatherConditions,
        })
      );
      changeTab(1);
    },
    [dispatch, weather, changeTab]
  );

  const handleDiveDateChange = (date: Date | null) => {
    setDiveDate(
      `${date?.getMonth()}/${date?.getDate()}/${date?.getFullYear()}`
    );
  };
  const handleDiveTimeChange = (date: Date | null) => {
    setDiveTime(`${date?.getHours()}:${date?.getMinutes()}`);
  };

  const handleWeatherChange = (event: ChangeEvent<{ value: unknown }>) => {
    setWeather(event.target.value as string);
  };

  const resetForm = () => {
    reset({
      diveTime: null,
      diveDate: null,
      comments: "",
    });
  };

  useEffect(() => {
    if (surveyWeatherConditions) {
      setWeather(surveyWeatherConditions);
    }
    if (surveyComments) {
      setValue("comments", surveyComments);
    }
    if (surveyDiveDateTime) {
      const date = new Date(surveyDiveDateTime);
      setDiveDate(`${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`);
      setDiveTime(`${date.getHours()}:${date.getMinutes()}`);
    }
  }, [surveyWeatherConditions, surveyComments, surveyDiveDateTime, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Dive Date and Time */}
      <Grid
        style={{ marginBottom: "1rem" }}
        container
        justify="space-between"
        item
        xs={12}
      >
        <Grid item xs={5}>
          <Typography variant="h6">Dive Date</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography variant="h6">Dive Time</Typography>
        </Grid>
      </Grid>
      <Grid
        style={{ marginBottom: "1rem" }}
        container
        justify="space-between"
        item
        xs={12}
      >
        <Grid item xs={5}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              format="MM/dd/yyyy"
              id="dive-date"
              name="diveDate"
              helperText={errors.diveDate ? errors.diveDate.message : ""}
              inputRef={register({
                required: "This is a required field",
              })}
              error={!!errors.diveDate}
              value={diveDate ? new Date(diveDate) : null}
              onChange={handleDiveDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              inputProps={{
                className: classes.textField,
              }}
              inputVariant="outlined"
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={5}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker
              id="time-picker"
              name="diveTime"
              helperText={errors.diveTime ? errors.diveTime.message : ""}
              inputRef={register({
                required: "This is a required field",
              })}
              error={!!errors.diveTime}
              format="H:mm"
              value={
                // eslint-disable-next-line no-nested-ternary
                diveTime
                  ? diveDate
                    ? new Date(`${diveDate}, ${diveTime}`)
                    : new Date(`08/12/2020, ${diveTime}`)
                  : null
              }
              onChange={handleDiveTimeChange}
              KeyboardButtonProps={{
                "aria-label": "change time",
              }}
              InputProps={{
                className: classes.textField,
              }}
              keyboardIcon={<AccessTimeIcon />}
              inputVariant="outlined"
            />
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>
      {/* Dive Location */}
      <Grid style={{ marginBottom: "1rem" }} item xs={12}>
        <Typography variant="h6">Dive Location</Typography>
      </Grid>
      <Grid
        style={{ marginBottom: "2rem" }}
        container
        justify="space-between"
        item
        xs={12}
      >
        <Grid item xs={5}>
          <TextField
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            placeholder="LAT"
            label="Latitude"
            value={diveLocation ? diveLocation.lat : ""}
            disabled
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            placeholder="LONG"
            label="Longitude"
            value={diveLocation ? diveLocation.lng : ""}
            disabled
          />
        </Grid>
      </Grid>
      {/* Weather Conditions */}
      <Grid style={{ marginBottom: "1rem" }} item xs={12}>
        <Typography variant="h6">Weather Conditions</Typography>
      </Grid>
      <Grid style={{ marginBottom: "2rem" }} item xs={12}>
        <Select
          id="weather"
          name="weather"
          value={weather}
          onChange={handleWeatherChange}
          placeholder="Select One"
          fullWidth
          variant="outlined"
          inputProps={{
            className: classes.textField,
          }}
        >
          <MenuItem className={classes.textField} value="calm">
            Calm
          </MenuItem>
          <MenuItem className={classes.textField} value="wavy">
            Waves
          </MenuItem>
          <MenuItem className={classes.textField} value="stormy">
            Stormy
          </MenuItem>
        </Select>
      </Grid>
      <Grid style={{ marginBottom: "1rem" }} item xs={12}>
        <Typography variant="h6">Comments</Typography>
      </Grid>
      <Grid style={{ marginBottom: "2rem" }} item xs={12}>
        <TextField
          variant="outlined"
          multiline
          name="comments"
          inputRef={register()}
          fullWidth
          inputProps={{
            className: classes.textField,
          }}
        />
      </Grid>
      {/* SUBMIT */}
      <Grid
        style={{ marginBottom: "1rem" }}
        container
        justify="flex-end"
        item
        xs={12}
        spacing={3}
      >
        <Grid item xs={2}>
          <Button onClick={resetForm} color="primary" variant="outlined">
            Cancel
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button type="submit" color="primary" variant="contained">
            Next
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

const styles = () =>
  createStyles({
    textField: {
      color: "black",
    },
  });

interface SurveyFormIncomingProps {
  changeTab: (index: number) => void;
}

type SurveyFormProps = SurveyFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyForm);
