import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  useMediaQuery,
  useTheme,
  Theme,
  Grid,
  Typography,
  MenuItem,
  Select,
  IconButton,
  Button,
  Tooltip,
  TextField,
} from "@material-ui/core";
import { Create, DeleteOutline, Launch } from "@material-ui/icons";
import { Link } from "react-router-dom";

import { Pois } from "../../../../store/Reefs/types";
import { EditPoiNameDraft } from "../types";
import EditDialog, { Action } from "../../../Dialog";

const PointSelector = ({
  reefId,
  pointOptions,
  point,
  pointId,
  editPoiNameDraft,
  isReefAdmin,
  editPoiNameLoading,
  onChangePoiName,
  handlePointChange,
  toggleEditPoiNameEnabled,
  submitPoiNameUpdate,
  onDeleteButtonClick,
  classes,
}: PointSelectorProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPoi, setEditPoi] = useState<Pois>();

  const onEditDialogClose = useCallback(() => {
    toggleEditPoiNameEnabled(false, editPoi?.id);
    setEditPoi(undefined);
    setEditDialogOpen(false);
  }, [editPoi, toggleEditPoiNameEnabled]);

  const onEditPoiSubmit = useCallback(() => {
    if (editPoi) {
      submitPoiNameUpdate(editPoi.id);
    }
  }, [editPoi, submitPoiNameUpdate]);

  useEffect(() => {
    if (!editPoiNameLoading) {
      setEditPoi(undefined);
      setEditDialogOpen(false);
    }
  }, [editPoiNameLoading]);

  const editDialogActions: Action[] = [
    {
      size: "small",
      variant: "contained",
      color: "secondary",
      text: "Close",
      action: onEditDialogClose,
    },
    {
      size: "small",
      variant: "contained",
      color: "primary",
      text: editPoiNameLoading ? "Updating..." : "Save",
      action: onEditPoiSubmit,
      disabled:
        editPoiNameLoading || (editPoi && !editPoiNameDraft[editPoi.id]),
    },
  ];

  return (
    <>
      {editPoi && (
        <EditDialog
          actions={editDialogActions}
          open={editDialogOpen}
          header={editPoi.name || ""}
          onClose={onEditDialogClose}
          content={
            <TextField
              variant="outlined"
              autoFocus
              className={classes.editPoiTextField}
              fullWidth
              value={editPoiNameDraft[editPoi.id]}
              onChange={onChangePoiName(editPoi.id)}
              error={!editPoiNameDraft[editPoi.id]}
              helperText={
                !editPoiNameDraft[editPoi.id] ? "Cannot be empty" : ""
              }
            />
          }
        />
      )}
      <Grid container alignItems="center" item md={12} lg={5} spacing={1}>
        <Grid item>
          <Typography variant="h6" className={classes.subTitle}>
            Survey Point:
          </Typography>
        </Grid>
        <Grid item className={classes.selectorWrapper}>
          <Grid container alignItems="center">
            <Grid item>
              <Select
                className={classes.selector}
                labelId="survey-point"
                id="survey-point"
                name="survey-point"
                value={
                  pointOptions.some((item) => item.name === point)
                    ? point
                    : "All"
                }
                onChange={handlePointChange}
                onClose={() => toggleEditPoiNameEnabled(false)}
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
                          spacing={1}
                        >
                          <Grid className={classes.itemName} item>
                            {item.name}
                          </Grid>
                          <Grid item>
                            <Grid container item spacing={1}>
                              <Grid item>
                                <Tooltip
                                  title="View survey point"
                                  placement="top"
                                  arrow
                                >
                                  <Link
                                    to={`/reefs/${reefId}/points/${item.id}`}
                                  >
                                    <IconButton className={classes.menuButton}>
                                      <Launch color="primary" />
                                    </IconButton>
                                  </Link>
                                </Tooltip>
                              </Grid>
                              {isReefAdmin && (
                                <>
                                  <Grid item>
                                    <Tooltip
                                      title="Edit survey point"
                                      placement="top"
                                      arrow
                                    >
                                      <IconButton
                                        className={classes.menuButton}
                                        onClick={(event) => {
                                          setEditDialogOpen(true);
                                          setEditPoi(item);
                                          event.stopPropagation();
                                        }}
                                      >
                                        <Create color="primary" />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item>
                                    <Tooltip
                                      title="Delete survey point"
                                      placement="top"
                                      arrow
                                    >
                                      <IconButton
                                        className={classes.menuButton}
                                        onClick={(event) => {
                                          onDeleteButtonClick(item.id);
                                          event.stopPropagation();
                                        }}
                                      >
                                        <DeleteOutline color="primary" />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                </>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </MenuItem>
                    )
                )}
              </Select>
            </Grid>
            {pointId !== -1 && (
              <Grid item>
                {isMobile ? (
                  <Link to={`/reefs/${reefId}/points/${pointId}`}>
                    <IconButton className={classes.menuButton}>
                      <Launch color="primary" />
                    </IconButton>
                  </Link>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    component={Link}
                    to={`/reefs/${reefId}/points/${pointId}`}
                  >
                    View Survey Point
                  </Button>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
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
    selector: {
      minWidth: 120,
      maxWidth: 190,
      color: theme.palette.primary.main,
      marginRight: "1rem",
    },
    itemName: {
      maxWidth: 140,
      whiteSpace: "normal",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      wordBreak: "break-word",
      hyphens: "auto",
    },
    menuItem: {
      minWidth: 240,
      color: theme.palette.primary.main,
    },
    editPoiTextField: {
      color: "black",
      alignItems: "center",
      padding: 8,
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
  });

interface PointSelectorIncomingProps {
  reefId: number;
  pointOptions: Pois[];
  point: string;
  pointId: number;
  editPoiNameDraft: EditPoiNameDraft;
  isReefAdmin: boolean;
  editPoiNameLoading: boolean;
  onChangePoiName: (
    key: number
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handlePointChange: (event: ChangeEvent<{ value: unknown }>) => void;
  toggleEditPoiNameEnabled: (
    enabled: boolean,
    key?: number | undefined
  ) => void;
  submitPoiNameUpdate: (key: number) => void;
  onDeleteButtonClick: (id: number) => void;
}

type PointSelectorProps = PointSelectorIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(PointSelector);
