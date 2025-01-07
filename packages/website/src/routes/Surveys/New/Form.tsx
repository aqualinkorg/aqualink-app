import { useCallback } from 'react';
import { Grid, Collapse, IconButton } from '@mui/material';
import Alert from '@mui/material/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { SurveyData, SurveyState } from 'store/Survey/types';
import {
  surveyErrorSelector,
  surveyAddRequest,
} from 'store/Survey/surveySlice';
import { userInfoSelector } from 'store/User/userSlice';
import Form from 'common/SurveyForm';

const SurveyForm = ({
  siteId,
  timeZone = null,
  changeTab,
}: SurveyFormProps) => {
  const user = useSelector(userInfoSelector);
  const surveyError = useSelector(surveyErrorSelector);

  const dispatch = useDispatch();

  const onSubmit = useCallback(
    (
      diveDateTime: string,
      diveLocation: SurveyState['diveLocation'],
      weatherConditions: SurveyData['weatherConditions'],
      comments: string,
    ) => {
      const surveyData: SurveyData = {
        site: siteId,
        diveDate: diveDateTime,
        diveLocation,
        weatherConditions,
        comments,
        token: user?.token,
      };
      dispatch(
        surveyAddRequest({
          siteId: `${siteId}`,
          surveyData,
          changeTab,
        }),
      );
    },
    [dispatch, changeTab, siteId, user],
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
      <Form siteId={siteId} timeZone={timeZone} onSubmit={onSubmit} />
    </>
  );
};

interface SurveyFormProps {
  changeTab: (index: number) => void;
  siteId: number;
  timeZone?: string | null;
}

export default SurveyForm;
