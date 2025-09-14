import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  useTheme,
  useMediaQuery,
  Theme,
  Grid,
  Typography,
  Select,
  FormControl,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useDispatch, useSelector } from 'react-redux';

import observationOptions from 'constants/uploadDropdowns';
import { setSiteSurveyPoints } from 'store/Sites/selectedSiteSlice';
import { userInfoSelector } from 'store/User/userSlice';
import {
  surveysRequest,
  updateSurveyPointName,
} from 'store/Survey/surveyListSlice';
import { setSelectedPoi } from 'store/Survey/surveySlice';
import { SurveyMedia } from 'store/Survey/types';
import { Site } from 'store/Sites/types';
import { useBodyLength } from 'hooks/useBodyLength';
import { isAdmin } from 'helpers/user';
import { getAxiosErrorMessage } from 'helpers/errors';
import siteServices from 'services/siteServices';
import surveyServices from 'services/surveyServices';
import PointSelector from './PointSelector';
import Timeline from './Timeline';
import DeleteSurveyPointDialog, { Action } from '../../Dialog';

function Surveys({ site }: SurveysProps) {
  const classes = useStyles();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isLoading = !site;
  const [point, setPoint] = useState<string>('All');
  const pointOptions = site?.surveyPoints || [];
  const [deleteSurveyPointDialogOpen, setDeleteSurveyPointDialogOpen] =
    useState<boolean>(false);
  const [editSurveyPointNameDraft, seteditSurveyPointNameDraft] = useState<
    string | null
  >();
  const [editSurveyPointNameLoading, seteditSurveyPointNameLoading] =
    useState<boolean>(false);
  const [surveyPointToDelete, setSurveyPointToDelete] = useState<number | null>(
    null,
  );
  const [isDeletePointLoading, setIsDeletePointLoading] = useState(false);
  const [deletePointError, setDeletePointError] = useState<string>();
  const [observation, setObservation] = useState<
    SurveyMedia['observations'] | 'any'
  >('any');
  const user = useSelector(userInfoSelector);
  const isSiteAdmin = site ? isAdmin(user, site.id) : false;
  const dispatch = useDispatch();

  const bodyLength = useBodyLength();

  const surveyPointToDeleteName = pointOptions.find(
    ({ id }) => id === surveyPointToDelete,
  )?.name;

  useEffect(() => {
    dispatch(setSelectedPoi(point));
  }, [dispatch, point]);

  const onDeleteSurveyPointButtonClick = (id: number) => {
    setDeleteSurveyPointDialogOpen(true);
    setSurveyPointToDelete(id);
  };

  const handlePointChange = (event: SelectChangeEvent<unknown>) => {
    setPoint(event.target.value as string);
  };

  const handleObservationChange = (event: SelectChangeEvent<unknown>) => {
    setObservation(event.target.value as SurveyMedia['observations'] | 'any');
  };

  const pointIdFinder = (name: string) =>
    pointOptions.find((option) => option.name === name)?.id || -1;

  const handleDeleteSurveyPointDialogClose = () => {
    setDeleteSurveyPointDialogOpen(false);
    setSurveyPointToDelete(null);
    setIsDeletePointLoading(false);
    setDeletePointError(undefined);
  };

  const handleSurveyPointDelete = async () => {
    if (site && typeof surveyPointToDelete === 'number') {
      setIsDeletePointLoading(true);
      try {
        await siteServices.deleteSiteSurveyPoint(
          surveyPointToDelete,
          user?.token,
        );

        dispatch(
          setSiteSurveyPoints(
            pointOptions.filter((option) => option.id !== surveyPointToDelete),
          ),
        );
        dispatch(surveysRequest(`${site.id}`));
        setDeleteSurveyPointDialogOpen(false);
        setSurveyPointToDelete(null);
      } catch (error) {
        setDeletePointError(getAxiosErrorMessage(error));
      } finally {
        setIsDeletePointLoading(false);
      }
    }
  };

  const enableeditSurveyPointName = (id: number) => {
    const initialName = pointOptions.find((item) => item.id === id)?.name;
    seteditSurveyPointNameDraft(initialName);
  };

  const disableeditSurveyPointName = () =>
    seteditSurveyPointNameDraft(undefined);

  const onChangeSurveyPointName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => seteditSurveyPointNameDraft(event.target.value);

  const submitSurveyPointNameUpdate = (key: number) => {
    const newName = editSurveyPointNameDraft;
    if (newName && user?.token) {
      seteditSurveyPointNameLoading(true);
      surveyServices
        .updatePoi(key, { name: newName }, user.token)
        .then(() => {
          // Update point name for featured image card
          dispatch(updateSurveyPointName({ id: key, name: newName }));

          // If the updated point was previously selected, update its value
          const prevName = pointOptions.find((item) => item.id === key)?.name;
          if (prevName === point) {
            setPoint(newName);
          }

          // Update point options
          dispatch(
            setSiteSurveyPoints(
              pointOptions.map((item) => {
                if (item.id === key) {
                  return {
                    ...item,
                    name: newName,
                  };
                }
                return item;
              }),
            ),
          );
          seteditSurveyPointNameDraft(undefined);
        })
        .catch(console.error)
        .finally(() => seteditSurveyPointNameLoading(false));
    }
  };

  const deleteSurveyPointDialogActions: Action[] = [
    {
      size: 'small',
      variant: 'contained',
      color: 'secondary',
      text: 'No',
      disabled: isDeletePointLoading,
      action: handleDeleteSurveyPointDialogClose,
    },
    {
      size: 'small',
      variant: 'contained',
      color: 'primary',
      text: 'Yes',
      loading: isDeletePointLoading,
      disabled: isDeletePointLoading,
      action: handleSurveyPointDelete,
    },
  ];

  return (
    <>
      <DeleteSurveyPointDialog
        open={deleteSurveyPointDialogOpen}
        onClose={handleDeleteSurveyPointDialogClose}
        error={deletePointError}
        header={`Delete ${surveyPointToDeleteName}`}
        content={
          <Typography color="textSecondary">
            Are you sure you want to delete this survey point? It will be
            deleted across all surveys.
          </Typography>
        }
        actions={deleteSurveyPointDialogActions}
      />
      <Grid
        className={classes.root}
        container
        justifyContent="center"
        spacing={2}
      >
        <Box
          id="surveys"
          bgcolor="#f5f6f6"
          position="absolute"
          height="100%"
          width={bodyLength}
          zIndex="-1"
        />
        {!isLoading && (
          <Grid
            className={classes.surveyWrapper}
            container
            justifyContent="space-between"
            item
            lg={12}
            xs={12}
            alignItems="baseline"
            spacing={isTablet ? 4 : 1}
          >
            <Grid
              container
              justifyContent={isTablet ? 'flex-start' : 'center'}
              item
              md={12}
              lg={3}
            >
              <Typography className={classes.title}>Survey History</Typography>
            </Grid>
            <PointSelector
              siteId={site?.id}
              pointOptions={pointOptions}
              point={point}
              pointId={pointIdFinder(point)}
              editSurveyPointNameDraft={editSurveyPointNameDraft}
              isSiteAdmin={isSiteAdmin}
              editSurveyPointNameLoading={editSurveyPointNameLoading}
              onChangeSurveyPointName={onChangeSurveyPointName}
              handlePointChange={handlePointChange}
              enableeditSurveyPointName={enableeditSurveyPointName}
              disableeditSurveyPointName={disableeditSurveyPointName}
              submitSurveyPointNameUpdate={submitSurveyPointNameUpdate}
              onDeleteButtonClick={onDeleteSurveyPointButtonClick}
            />
            <Grid
              container
              alignItems="center"
              justifyContent={isTablet ? 'flex-start' : 'center'}
              item
              md={12}
              lg={4}
              spacing={1}
            >
              {/* TODO - Make observation a required field. */}
              <Grid item>
                <Typography variant="h6" className={classes.subTitle}>
                  Observation:
                </Typography>
              </Grid>
              <Grid item className={classes.selectorWrapper}>
                <FormControl variant="standard" className={classes.formControl}>
                  <Select
                    variant="standard"
                    labelId="survey-observation"
                    id="survey-observation"
                    name="survey-observation"
                    value={observation}
                    onChange={handleObservationChange}
                    className={classes.selectedItem}
                    inputProps={{ className: classes.textField }}
                  >
                    <MenuItem value="any">
                      <Typography className={classes.menuItem} variant="h6">
                        Any
                      </Typography>
                    </MenuItem>
                    {observationOptions.map((item) => (
                      <MenuItem
                        className={classes.menuItem}
                        value={item.key}
                        key={item.key}
                        title={item.value}
                      >
                        {item.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid container justifyContent="center" item xs={12} lg={12}>
          <Timeline
            isAdmin={isSiteAdmin}
            loading={isLoading}
            addNewButton
            siteId={site?.id}
            timeZone={site?.timezone}
            observation={observation}
            pointName={point}
            pointId={pointIdFinder(point)}
          />
        </Grid>
      </Grid>
    </>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: '5rem',
      position: 'relative',
    },
    surveyWrapper: {
      marginTop: '5rem',
    },
    title: {
      fontSize: 22,
      lineHeight: 1.45,
      color: '#2a2a2a',
      marginBottom: '1rem',
    },
    subTitle: {
      lineHeight: 1,
      color: '#474747',
      marginRight: '1rem',
    },
    selectorWrapper: {
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    formControl: {
      minWidth: 120,
      maxWidth: 240,
    },
    selectedItem: {
      color: theme.palette.primary.main,
    },
    menuItem: {
      color: theme.palette.primary.main,
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block',
    },
    textField: {
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block',
    },
  }),
);

interface SurveysProps {
  site?: Site;
}

export default Surveys;
