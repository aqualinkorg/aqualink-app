import React, { useState, useCallback, useEffect, ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Typography,
  Select,
  FormControl,
  MenuItem,
  Box,
  IconButton,
  TextField,
} from "@material-ui/core";
import { Check, Close, Create, DeleteOutline } from "@material-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";

import Timeline from "./Timeline";
import { userInfoSelector } from "../../../../store/User/userSlice";
import { surveysRequest } from "../../../../store/Survey/surveyListSlice";
import { setSelectedPoi } from "../../../../store/Survey/surveySlice";
import observationOptions from "../../../../constants/uploadDropdowns";
import { SurveyMedia } from "../../../../store/Survey/types";
import reefServices from "../../../../services/reefServices";
import { Pois } from "../../../../store/Reefs/types";
import { isAdmin } from "../../../../helpers/isAdmin";
import DeletePoiDialog, { Action } from "../../../../common/Dialog";
import { useBodyLength } from "../../../../helpers/useBodyLength";
import surveyServices from "../../../../services/surveyServices";

interface EditPoiNameEnabled {
  [key: number]: boolean;
}

interface EditPoiNameDraft {
  [key: number]: string;
}

const Surveys = ({ reefId, classes }: SurveysProps) => {
  const [point, setPoint] = useState<string>("All");
  const [pointOptions, setPointOptions] = useState<Pois[]>([]);
  const [deletePoiDialogOpen, setDeletePoiDialogOpen] = useState<boolean>(
    false
  );
  const [editPoiNameEnabled, setEditPoiNameEnabled] = useState<
    EditPoiNameEnabled
  >({});
  const [editPoiNameDraft, setEditPoiNameDraft] = useState<EditPoiNameDraft>(
    {}
  );
  const [editPoiNameLoading, setEditPoiNameLoading] = useState<boolean>(false);
  const [poiToDelete, setPoiToDelete] = useState<number | null>(null);
  const [mountPois, setMountPois] = useState<boolean>(false);
  const [observation, setObservation] = useState<
    SurveyMedia["observations"] | "any"
  >("any");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const user = useSelector(userInfoSelector);
  const isReefAdmin = isAdmin(user, reefId);
  const dispatch = useDispatch();

  const bodyLength = useBodyLength();

  useEffect(() => {
    const source = Axios.CancelToken.source();
    reefServices
      .getReefPois(`${reefId}`, source.token)
      .then(({ data }) => {
        setPointOptions(data);
        if (data.length > 0) {
          setEditPoiNameEnabled(
            data.reduce((acc, poi) => ({ ...acc, [poi.id]: false }), {})
          );
          setEditPoiNameDraft(
            data.reduce((acc, poi) => ({ ...acc, [poi.id]: poi.name }), {})
          );
        }
        setMountPois(true);
      })
      .catch((error) => {
        if (!Axios.isCancel(error)) {
          setMountPois(false);
        }
      });
    return () => {
      source.cancel();
    };
  }, [setPointOptions, reefId]);

  useEffect(() => {
    dispatch(setSelectedPoi(point));
  }, [dispatch, point]);

  const onResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const handlePointChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const poiName = event.target.value as string;
    setPoint(poiName);
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
          setPointOptions(
            pointOptions.filter((option) => option.id !== poiToDelete)
          )
        )
        .then(() => {
          dispatch(surveysRequest(`${reefId}`));
        })
        .then(() => {
          setDeletePoiDialogOpen(false);
          setPoiToDelete(null);
        });
    }
  };

  const toggleEditPoiNameEnabled = useCallback(
    (enabled: boolean, key?: number) => {
      if (key) {
        // If key provided then change that specific poi edit status
        setEditPoiNameEnabled({ ...editPoiNameEnabled, [key]: enabled });
        // Reset Poi name draft on close
        const poiName = pointOptions.find((item) => item.id === key)?.name;
        if (poiName && !enabled) {
          setEditPoiNameDraft({ ...editPoiNameDraft, [key]: poiName });
        }
      } else {
        // If no key provided then change all
        setEditPoiNameEnabled(
          pointOptions.reduce((acc, poi) => ({ ...acc, [poi.id]: enabled }), {})
        );
        // Reset Poi name draft for all Pois on close
        if (!enabled) {
          setEditPoiNameDraft(
            pointOptions.reduce(
              (acc, poi) => ({ ...acc, [poi.id]: poi.name }),
              {}
            )
          );
        }
      }
    },
    [editPoiNameEnabled, pointOptions, editPoiNameDraft]
  );

  const onChangePoiName = useCallback(
    (key: number) => (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) =>
      setEditPoiNameDraft({
        ...editPoiNameDraft,
        [key]: event.target.value,
      }),
    [editPoiNameDraft]
  );

  const submitPoiNameUpdate = useCallback(
    (key: number) => {
      const newName = editPoiNameDraft[key];
      if (newName !== "" && user?.token) {
        setEditPoiNameLoading(true);
        surveyServices
          .updatePoi(key, newName, user.token)
          .then(() => reefServices.getReefPois(`${reefId}`))
          .then(({ data }) => {
            const prevName = pointOptions.find((item) => item.id === key)?.name;
            setPointOptions(data);
            // If the updated point was previously selected, update its value
            if (prevName === point) {
              setPoint(newName);
            }
            setEditPoiNameDraft({ ...editPoiNameDraft, [key]: newName });
            setEditPoiNameEnabled({ ...editPoiNameEnabled, [key]: false });
          })
          .finally(() => setEditPoiNameLoading(false));
      }
    },
    [editPoiNameDraft, editPoiNameEnabled, point, pointOptions, reefId, user]
  );

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
        >
          <Grid
            container
            justify={windowWidth < 1280 ? "flex-start" : "center"}
            item
            md={12}
            lg={4}
          >
            <Typography className={classes.title}>Survey History</Typography>
          </Grid>
          <Grid container alignItems="center" item md={12} lg={4}>
            <Grid item>
              <Typography variant="h6" className={classes.subTitle}>
                Survey Point:
              </Typography>
            </Grid>
            {mountPois && (
              <Grid item>
                <FormControl className={classes.formControl}>
                  <Select
                    labelId="survey-point"
                    id="survey-point"
                    name="survey-point"
                    value={
                      pointOptions.map((item) => item.name).includes(point)
                        ? point
                        : "All"
                    }
                    onChange={handlePointChange}
                    onClose={() => toggleEditPoiNameEnabled(false)}
                    className={classes.selectedItem}
                    renderValue={(selected) => selected as string}
                  >
                    <MenuItem value="All">
                      <Typography className={classes.menuItem} variant="h6">
                        All
                      </Typography>
                    </MenuItem>
                    {pointOptions.map(
                      (item) =>
                        item.name !== null && (
                          <MenuItem
                            className={classes.menuItem}
                            value={item.name}
                            key={item.id}
                          >
                            <Grid
                              container
                              alignItems="center"
                              justify="space-between"
                              spacing={2}
                            >
                              <Grid item>
                                {editPoiNameEnabled[item.id] ? (
                                  <TextField
                                    className={classes.editPoiTextField}
                                    variant="outlined"
                                    inputProps={{
                                      className: classes.editPoiTextField,
                                    }}
                                    fullWidth
                                    value={editPoiNameDraft[item.id]}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={onChangePoiName(item.id)}
                                    error={editPoiNameDraft[item.id] === ""}
                                    helperText={
                                      editPoiNameDraft[item.id] === ""
                                        ? "Cannot be empty"
                                        : ""
                                    }
                                  />
                                ) : (
                                  `${item.name}`
                                )}
                              </Grid>
                              {isReefAdmin &&
                                (editPoiNameEnabled[item.id] ? (
                                  <Grid item>
                                    <Grid
                                      container
                                      justify="space-between"
                                      spacing={2}
                                    >
                                      <Grid item>
                                        <IconButton
                                          disabled={editPoiNameLoading}
                                          className={classes.menuButton}
                                          onClick={(event) => {
                                            submitPoiNameUpdate(item.id);
                                            event.stopPropagation();
                                          }}
                                        >
                                          <Check
                                            className={classes.checkIcon}
                                          />
                                        </IconButton>
                                      </Grid>
                                      <Grid item>
                                        <IconButton
                                          className={classes.menuButton}
                                          onClick={(event) => {
                                            toggleEditPoiNameEnabled(
                                              false,
                                              item.id
                                            );
                                            event.stopPropagation();
                                          }}
                                        >
                                          <Close
                                            className={classes.closeIcon}
                                          />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                ) : (
                                  <Grid item>
                                    <Grid
                                      container
                                      justify="space-between"
                                      spacing={2}
                                    >
                                      <Grid item>
                                        <IconButton
                                          className={classes.menuButton}
                                          onClick={(event) => {
                                            toggleEditPoiNameEnabled(
                                              true,
                                              item.id
                                            );
                                            event.stopPropagation();
                                          }}
                                        >
                                          <Create color="primary" />
                                        </IconButton>
                                      </Grid>
                                      <Grid item>
                                        <IconButton
                                          className={classes.menuButton}
                                          onClick={(event) => {
                                            setDeletePoiDialogOpen(true);
                                            setPoiToDelete(item.id);
                                            event.stopPropagation();
                                          }}
                                        >
                                          <DeleteOutline color="secondary" />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                ))}
                            </Grid>
                          </MenuItem>
                        )
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
          <Grid
            container
            alignItems="center"
            justify={windowWidth < 1280 ? "flex-start" : "center"}
            item
            md={12}
            lg={4}
          >
            {/* TODO - Make observation a required field. */}
            <Grid item>
              <Typography variant="h6" className={classes.subTitle}>
                Observation:
              </Typography>
            </Grid>
            <Grid item>
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
            reefId={reefId}
            observation={observation}
            point={pointIdFinder(point)}
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
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.45,
      letterSpacing: "normal",
      color: "#2a2a2a",
      marginBottom: "1rem",
    },
    subTitle: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1,
      letterSpacing: "normal",
      color: "#474747",
      marginRight: "1rem",
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
    },
    menuButton: {
      padding: 0,
    },
    checkIcon: {
      color: theme.palette.success.main,
    },
    closeIcon: {
      color: theme.palette.error.main,
    },
    textField: {
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    },
    editPoiTextField: {
      color: "black",
      height: "2.5rem",
      alignItems: "center",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
  });

interface SurveyIncomingProps {
  reefId: number;
}

type SurveysProps = SurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Surveys);
