import React, { useState, useCallback, ChangeEvent } from "react";
import { Grid, Collapse, IconButton } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useSelector, useDispatch } from "react-redux";
import { SurveyData } from "../../../store/Survey/types";
import {
  diveLocationSelector,
  surveyErrorSelector,
  surveyAddRequest,
} from "../../../store/Survey/surveySlice";
import { userInfoSelector } from "../../../store/User/userSlice";
import Form from "../../../common/SurveyForm";

const SurveyForm = ({ reefId, changeTab }: SurveyFormProps) => {
  const diveLocation = useSelector(diveLocationSelector);
  const user = useSelector(userInfoSelector);
  const [weather, setWeather] = useState<SurveyData["weatherConditions"]>(
    "calm"
  );
  const surveyError = useSelector(surveyErrorSelector);

  const dispatch = useDispatch();

  const handleWeatherChange = (event: ChangeEvent<{ value: unknown }>) => {
    setWeather(event.target.value as SurveyData["weatherConditions"]);
  };

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
        diveLocation,
        weatherConditions,
        comments,
        token: user?.token,
      };
      dispatch(
        surveyAddRequest({
          reefId: `${reefId}`,
          surveyData,
          changeTab,
        })
      );
    },
    [dispatch, weather, diveLocation, changeTab, user, reefId]
  );

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
      <Form
        reefId={reefId}
        onSubmit={onSubmit}
        handleWeatherChange={handleWeatherChange}
        weather={weather}
      />
    </>
  );
};

interface SurveyFormProps {
  changeTab: (index: number) => void;
  reefId: number;
}

export default SurveyForm;
