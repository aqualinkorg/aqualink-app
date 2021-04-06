import React, { useState, useEffect, ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  useTheme,
  useMediaQuery,
  Theme,
  Grid,
  Typography,
  Select,
  FormControl,
  MenuItem,
  Box,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import Timeline from "./Timeline";
import PointSelector from "./PointSelector";
import { setReefPois } from "../../../store/Reefs/selectedReefSlice";
import { userInfoSelector } from "../../../store/User/userSlice";
import {
  surveysRequest,
  updatePoiName,
} from "../../../store/Survey/surveyListSlice";
import { setSelectedPoi } from "../../../store/Survey/surveySlice";
import observationOptions from "../../../constants/uploadDropdowns";
import { SurveyMedia } from "../../../store/Survey/types";
import reefServices from "../../../services/reefServices";
import { Reef } from "../../../store/Reefs/types";
import { isAdmin } from "../../../helpers/user";
import DeletePoiDialog, { Action } from "../../Dialog";
import { useBodyLength } from "../../../helpers/useBodyLength";
import surveyServices from "../../../services/surveyServices";

const Surveys = ({ reef, classes }: SurveysProps) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [point, setPoint] = useState<string>("All");
  const pointOptions = reef.surveyPoints;
  const [deletePoiDialogOpen, setDeletePoiDialogOpen] = useState<boolean>(
    false
  );
  const [editPoiNameDraft, setEditPoiNameDraft] = useState<string | null>();
  const [editPoiNameLoading, setEditPoiNameLoading] = useState<boolean>(false);
  const [poiToDelete, setPoiToDelete] = useState<number | null>(null);
  const [observation, setObservation] = useState<
    SurveyMedia["observations"] | "any"
  >("any");
  const user = useSelector(userInfoSelector);
  const isReefAdmin = isAdmin(user, reef.id);
  const dispatch = useDispatch();

  const bodyLength = useBodyLength();

  useEffect(() => {
    dispatch(setSelectedPoi(point));
  }, [dispatch, point]);

  const onDeletePoiButtonClick = (id: number) => {
    setDeletePoiDialogOpen(true);
    setPoiToDelete(id);
  };

  const handlePointChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPoint(event.target.value as string);
  };

  const handleObservationChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setObservation(event.target.value as SurveyMedia["observations"] | "any");
  };

  const pointIdFinder = (name: string) => {
    return pointOptions.find((option) => option.name === name)?.id || -1;
  };

  const handleDeletePoiDialogClose = () => {
    setDeletePoiDialogOpen(false);
    setPoiToDelete(null);
  };

  const handleSurveyPointDelete = () => {
    if (user && user.token && poiToDelete) {
      reefServices
        .deleteReefPoi(poiToDelete, user.token)
        .then(() =>
          dispatch(
            setReefPois(
              pointOptions.filter((option) => option.id !== poiToDelete)
            )
          )
        )
        .then(() => {
          dispatch(surveysRequest(`${reef.id}`));
        })
        .then(() => {
          setDeletePoiDialogOpen(false);
          setPoiToDelete(null);
        });
    }
  };

  const enableEditPoiName = (id: number) => {
    const initialName = pointOptions.find((item) => item.id === id)?.name;
    setEditPoiNameDraft(initialName);
  };

  const disableEditPoiName = () => setEditPoiNameDraft(undefined);

  const onChangePoiName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setEditPoiNameDraft(event.target.value);

  const submitPoiNameUpdate = (key: number) => {
    const newName = editPoiNameDraft;
    if (newName && user?.token) {
      setEditPoiNameLoading(true);
      surveyServices
        .updatePoi(key, { name: newName }, user.token)
        .then(() => {
          // Update point name for featured image card
          dispatch(updatePoiName({ id: key, name: newName }));

          // If the updated point was previously selected, update its value
          const prevName = pointOptions.find((item) => item.id === key)?.name;
          if (prevName === point) {
            setPoint(newName);
          }

          // Update point options
          dispatch(
            setReefPois(
              pointOptions.map((item) => {
                if (item.id === key) {
                  return {
                    ...item,
                    name: newName,
                  };
                }
                return item;
              })
            )
          );
          setEditPoiNameDraft(undefined);
        })
        .finally(() => setEditPoiNameLoading(false));
    }
  };

  const deletePoiDialogActions: Action[] = [
    {
      size: "small",
      variant: "contained",
      color: "secondary",
      text: "No",
      action: handleDeletePoiDialogClose,
    },
    {
      size: "small",
      variant: "contained",
      color: "primary",
      text: "Yes",
      action: handleSurveyPointDelete,
    },
  ];

  return (
    <>
      <DeletePoiDialog
        open={deletePoiDialogOpen}
        onClose={handleDeletePoiDialogClose}
        header="Are you sure you want to delete this survey point? It will be deleted across all surveys."
        actions={deletePoiDialogActions}
      />
      <Grid className={classes.root} container justify="center" spacing={2}>
        <Box
          bgcolor="#f5f6f6"
          position="absolute"
          height="100%"
          width={bodyLength}
          zIndex="-1"
        />
        <Grid
          className={classes.surveyWrapper}
          container
          justify="space-between"
          item
          lg={12}
          xs={11}
          alignItems="baseline"
          spacing={isTablet ? 4 : 1}
        >
          <Grid
            container
            justify={isTablet ? "flex-start" : "center"}
            item
            md={12}
            lg={3}
          >
            <Typography className={classes.title}>Survey History</Typography>
          </Grid>
          <PointSelector
            reefId={reef.id}
            pointOptions={pointOptions}
            point={point}
            pointId={pointIdFinder(point)}
            editPoiNameDraft={editPoiNameDraft}
            isReefAdmin={isReefAdmin}
            editPoiNameLoading={editPoiNameLoading}
            onChangePoiName={onChangePoiName}
            handlePointChange={handlePointChange}
            enableEditPoiName={enableEditPoiName}
            disableEditPoiName={disableEditPoiName}
            submitPoiNameUpdate={submitPoiNameUpdate}
            onDeleteButtonClick={onDeletePoiButtonClick}
          />
          <Grid
            container
            alignItems="center"
            justify={isTablet ? "flex-start" : "center"}
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
              <FormControl className={classes.formControl}>
                <Select
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
        <Grid container justify="center" item xs={11} lg={12}>
          <Timeline
            isAdmin={isReefAdmin}
            addNewButton
            reefId={reef.id}
            timeZone={reef.timezone}
            observation={observation}
            pointName={point}
            pointId={pointIdFinder(point)}
          />
        </Grid>
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: "5rem",
      position: "relative",
    },
    surveyWrapper: {
      marginTop: "5rem",
    },
    title: {
      fontSize: 22,
      lineHeight: 1.45,
      color: "#2a2a2a",
      marginBottom: "1rem",
    },
    subTitle: {
      lineHeight: 1,
      color: "#474747",
      marginRight: "1rem",
    },
    selectorWrapper: {
      [theme.breakpoints.down("xs")]: {
        width: "100%",
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
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    },
    textField: {
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    },
  });

interface SurveyIncomingProps {
  reef: Reef;
}

type SurveysProps = SurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Surveys);
