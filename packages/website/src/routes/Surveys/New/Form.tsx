import React, { useState, useCallback, ChangeEvent } from "react";

import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  TextField,
  Typography,
  Button,
  Collapse,
  IconButton,
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
import Alert from "@material-ui/lab/Alert";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { SurveyData } from "../../../store/Survey/types";
import {
  diveLocationSelector,
  surveyErrorSelector,
  surveyAddRequest,
} from "../../../store/Survey/surveySlice";
import { userInfoSelector } from "../../../store/User/userSlice";

const SurveyForm = ({ reefId, changeTab, classes }: SurveyFormProps) => {
  const diveLocation = useSelector(diveLocationSelector);
  const user = useSelector(userInfoSelector);
  const [diveDate, setDiveDate] = useState<string | null>(null);
  const [diveTime, setDiveTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<string>("calm");
  const surveyError = useSelector(surveyErrorSelector);

  const dispatch = useDispatch();

  const { register, errors, handleSubmit, reset } = useForm({
    reValidateMode: "onSubmit",
  });

  const onSubmit = useCallback(
    (data: any) => {
      const diveDateTime = new Date(
        `${data.diveDate}, ${data.diveTime}`
      ).toISOString();
      const weatherConditions = weather;
      const { comments } = data;
      const surveyData: SurveyData = {
        reef: reefId,
        diveDate: diveDateTime,
        weatherConditions,
        comments,
        token: user?.token,
      };
      dispatch(surveyAddRequest({ surveyData, changeTab }));
    },
    [dispatch, weather, changeTab, user, reefId]
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

  return (
    <>
      <Grid item xs={12}>
        <Collapse in={!!surveyError}>
          <Alert
            severity="error"
            action={
              <IconButton aria-label="close" color="inherit" size="small" />
            }
          >
            There was an error creating the survey.
          </Alert>
        </Collapse>
      </Grid>
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
          <Grid item xs={2}>
            <Button
              style={{ marginRight: "1rem" }}
              onClick={resetForm}
              color="primary"
              variant="outlined"
            >
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
    </>
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
  reefId: number;
}

type SurveyFormProps = SurveyFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyForm);
