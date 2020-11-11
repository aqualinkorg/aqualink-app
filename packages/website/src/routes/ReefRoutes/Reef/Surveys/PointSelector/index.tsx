import React, { ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Typography,
  FormControl,
  MenuItem,
  Select,
  IconButton,
  TextField,
} from "@material-ui/core";
import { Check, Close, Create, DeleteOutline } from "@material-ui/icons";

import { Pois } from "../../../../../store/Reefs/types";
import { EditPoiNameDraft, EditPoiNameEnabled } from "../types";

const PointSelector = ({
  mountPois,
  pointOptions,
  point,
  editPoiNameEnabled,
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
  return (
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
                                    <Check className={classes.checkIcon} />
                                  </IconButton>
                                </Grid>
                                <Grid item>
                                  <IconButton
                                    className={classes.menuButton}
                                    onClick={(event) => {
                                      toggleEditPoiNameEnabled(false, item.id);
                                      event.stopPropagation();
                                    }}
                                  >
                                    <Close className={classes.closeIcon} />
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
                                      toggleEditPoiNameEnabled(true, item.id);
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
  );
};

const styles = (theme: Theme) =>
  createStyles({
    subTitle: {
      lineHeight: 1,
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
  editPoiNameEnabled: EditPoiNameEnabled;
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
