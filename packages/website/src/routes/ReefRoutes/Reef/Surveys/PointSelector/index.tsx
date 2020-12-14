import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Typography,
  MenuItem,
  Select,
  IconButton,
  OutlinedInput,
} from "@material-ui/core";
import { Create, DeleteOutline } from "@material-ui/icons";

import { Pois } from "../../../../../store/Reefs/types";
import { EditPoiNameDraft } from "../types";
import EditDialog, { Action } from "../../../../../common/Dialog";

const PointSelector = ({
  mountPois,
  pointOptions,
  point,
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
      disabled: editPoiNameLoading,
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
            <OutlinedInput
              autoFocus
              className={classes.editPoiTextField}
              fullWidth
              value={editPoiNameDraft[editPoi.id]}
              onChange={onChangePoiName(editPoi.id)}
              error={editPoiNameDraft[editPoi.id] === ""}
            />
          }
        />
      )}
      <Grid container alignItems="center" item md={12} lg={4}>
        <Grid item>
          <Typography variant="h6" className={classes.subTitle}>
            Survey Point:
          </Typography>
        </Grid>
        {mountPois && (
          <Grid item>
            <Select
              className={classes.selector}
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
                        {isReefAdmin && (
                          <Grid item>
                            <Grid container item spacing={1}>
                              <Grid item>
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
                              </Grid>
                              <Grid item>
                                <IconButton
                                  className={classes.menuButton}
                                  onClick={(event) => {
                                    onDeleteButtonClick(item.id);
                                    event.stopPropagation();
                                  }}
                                >
                                  <DeleteOutline color="primary" />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </MenuItem>
                  )
              )}
            </Select>
          </Grid>
        )}
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
    selector: {
      minWidth: 120,
      maxWidth: 240,
      color: theme.palette.primary.main,
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
      minWidth: 200,
      color: theme.palette.primary.main,
    },
    editPoiTextField: {
      color: "black",
      height: "2.5rem",
      alignItems: "center",
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
  mountPois: boolean;
  pointOptions: Pois[];
  point: string;
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
