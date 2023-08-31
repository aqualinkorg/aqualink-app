import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  createStyles,
  Theme,
  Grid,
  Typography,
  MenuItem,
  Select,
  IconButton,
  Button,
  Tooltip,
  TextField,
  Hidden,
  makeStyles,
} from '@material-ui/core';
import { Create, DeleteOutline } from '@material-ui/icons';
import { Link } from 'react-router-dom';

import { SurveyPoints } from 'store/Sites/types';
import { maxLengths } from 'constants/names';
import EditDialog, { Action } from '../../../Dialog';
import CustomLink from '../../../Link';

const PointSelector = ({
  siteId,
  pointOptions,
  point,
  pointId,
  editSurveyPointNameDraft,
  isSiteAdmin,
  editSurveyPointNameLoading,
  onChangeSurveyPointName,
  handlePointChange,
  enableeditSurveyPointName,
  disableeditSurveyPointName,
  submitSurveyPointNameUpdate,
  onDeleteButtonClick,
}: PointSelectorProps) => {
  const classes = useStyles();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSurveyPoint, seteditSurveyPoint] = useState<SurveyPoints>();
  const errored =
    !editSurveyPointNameDraft ||
    editSurveyPointNameDraft.length > maxLengths.SURVEY_POINT_NAME;

  const onEditDialogClose = () => {
    disableeditSurveyPointName();
    seteditSurveyPoint(undefined);
    setEditDialogOpen(false);
  };

  const onEditSurveyPointSubmit = () => {
    if (editSurveyPoint) {
      submitSurveyPointNameUpdate(editSurveyPoint.id);
    }
  };

  const getHelperText = () => {
    switch (true) {
      case !editSurveyPointNameDraft:
        return 'Cannot be empty';
      case editSurveyPointNameDraft &&
        editSurveyPointNameDraft.length > maxLengths.SURVEY_POINT_NAME:
        return `Must not exceed ${maxLengths.SURVEY_POINT_NAME} characters`;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (!editSurveyPointNameLoading) {
      seteditSurveyPoint(undefined);
      setEditDialogOpen(false);
    }
  }, [editSurveyPointNameLoading]);

  const editDialogActions: Action[] = [
    {
      size: 'small',
      variant: 'contained',
      color: 'secondary',
      text: 'Close',
      action: onEditDialogClose,
    },
    {
      size: 'small',
      variant: 'contained',
      color: 'primary',
      text: editSurveyPointNameLoading ? 'Updating...' : 'Save',
      action: onEditSurveyPointSubmit,
      disabled: editSurveyPointNameLoading || (editSurveyPoint && errored),
    },
  ];

  return (
    <>
      {editSurveyPoint && (
        <EditDialog
          actions={editDialogActions}
          open={editDialogOpen}
          header={editSurveyPoint.name || ''}
          onClose={onEditDialogClose}
          content={
            <TextField
              variant="outlined"
              autoFocus
              className={classes.editSurveyPointTextField}
              fullWidth
              value={editSurveyPointNameDraft}
              onChange={onChangeSurveyPointName}
              error={errored}
              helperText={getHelperText()}
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
                    : 'All'
                }
                onChange={handlePointChange}
                onClose={() => disableeditSurveyPointName()}
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
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Grid className={classes.itemName} item>
                            {item.name}
                          </Grid>
                          <Grid item>
                            <Grid container item spacing={1}>
                              <Grid item>
                                <CustomLink
                                  to={`/sites/${siteId}/points/${item.id}`}
                                  isIcon
                                  tooltipTitle="View survey point"
                                />
                              </Grid>
                              {isSiteAdmin && (
                                <>
                                  <Grid item>
                                    <Tooltip
                                      title="Edit survey point name"
                                      placement="top"
                                      arrow
                                    >
                                      <IconButton
                                        className={classes.menuButton}
                                        onClick={(event) => {
                                          enableeditSurveyPointName(item.id);
                                          setEditDialogOpen(true);
                                          seteditSurveyPoint(item);
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
                    ),
                )}
              </Select>
            </Grid>
            {pointId !== -1 && (
              <Grid item>
                <Hidden smUp>
                  <CustomLink
                    to={`/sites/${siteId}/points/${pointId}`}
                    isIcon
                    tooltipTitle="View survey point"
                  />
                </Hidden>
                <Hidden xsDown>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    component={Link}
                    to={`/sites/${siteId}/points/${pointId}`}
                  >
                    View Survey Point
                  </Button>
                </Hidden>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    subTitle: {
      lineHeight: 1,
      color: '#474747',
      marginRight: '1rem',
    },
    selectorWrapper: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    selector: {
      minWidth: 120,
      maxWidth: 190,
      color: theme.palette.primary.main,
      marginRight: '1rem',
    },
    itemName: {
      maxWidth: 140,
      whiteSpace: 'normal',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
      hyphens: 'auto',
    },
    menuItem: {
      minWidth: 240,
      color: theme.palette.primary.main,
    },
    editSurveyPointTextField: {
      color: 'black',
      alignItems: 'center',
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
  }),
);

interface PointSelectorProps {
  siteId?: number;
  pointOptions: SurveyPoints[];
  point: string;
  pointId: number;
  editSurveyPointNameDraft: string | null | undefined;
  isSiteAdmin: boolean;
  editSurveyPointNameLoading: boolean;
  onChangeSurveyPointName: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handlePointChange: (event: ChangeEvent<{ value: unknown }>) => void;
  enableeditSurveyPointName: (id: number) => void;
  disableeditSurveyPointName: () => void;
  submitSurveyPointNameUpdate: (key: number) => void;
  onDeleteButtonClick: (id: number) => void;
}

export default PointSelector;
