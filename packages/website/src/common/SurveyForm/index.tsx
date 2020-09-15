import React, { useState, ChangeEvent } from "react";
import { useSelector } from "react-redux";
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
} from "@material-ui/core";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useForm } from "react-hook-form";

import { diveLocationSelector } from "../../store/Survey/surveySlice";
import { SurveyData } from "../../store/Survey/types";

const SurveyForm = ({
  onSubmit,
  handleWeatherChange,
  weather,
  classes,
}: SurveyFormProps) => {
  const diveLocation = useSelector(diveLocationSelector);
  const [diveDate, setDiveDate] = useState<string | null>(null);
  const [diveTime, setDiveTime] = useState<string | null>(null);

  const { register, errors, handleSubmit, reset } = useForm({
    reValidateMode: "onSubmit",
  });

  const handleDiveDateChange = (date: Date | null) => {
    setDiveDate(
      `${
        date ? date.getMonth() + 1 : ""
      }/${date?.getDate()}/${date?.getFullYear()}`
    );
  };
  const handleDiveTimeChange = (date: Date | null) => {
    setDiveTime(`${date?.getHours()}:${date?.getMinutes()}`);
  };

  const resetForm = () => {
    reset({
      diveTime: null,
      diveDate: null,
      comments: "",
    });
  };

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
              className={classes.textField}
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
              className={classes.textField}
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
      <Grid style={{ marginBottom: "1rem" }} item xs={12}>
        <Typography variant="h6">Comments</Typography>
      </Grid>
      <Grid style={{ marginBottom: "2rem" }} item xs={12}>
        <TextField
          className={classes.textField}
          variant="outlined"
          multiline
          name="comments"
          placeholder="Did anything stand out during this survey"
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
      >
        <Grid style={{ marginRight: "3rem" }} item xs={2}>
          <Button onClick={resetForm} color="primary" variant="outlined">
            Clear
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

const styles = (theme: Theme) =>
  createStyles({
    textField: {
      color: "black",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
  });

interface SurveyFormIncomingProps {
  onSubmit: (data: any) => void;
  handleWeatherChange: (
    event: ChangeEvent<{
      value: unknown;
    }>
  ) => void;
  weather: SurveyData["weatherConditions"];
}

type SurveyFormProps = SurveyFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyForm);
