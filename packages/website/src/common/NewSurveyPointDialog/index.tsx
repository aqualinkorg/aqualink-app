import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Button,
  TextFieldProps,
  makeStyles,
  Theme,
  IconButton,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch, useSelector } from 'react-redux';

import { maxLengths } from 'constants/names';
import { userInfoSelector } from 'store/User/userSlice';
import { setSiteSurveyPoints } from 'store/Sites/selectedSiteSlice';
import { SurveyPoints } from 'store/Sites/types';
import { getAxiosErrorMessage } from 'helpers/errors';
import siteServices from 'services/siteServices';
import surveyServices from 'services/surveyServices';

const NewSurveyPointDialog = ({
  open,
  siteId,
  onClose,
  onSuccess,
}: NewSurveyPointDialogProps) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const [pointName, setPointName] = useState('');
  const [newPointError, setNewPointError] = useState<string>();
  const [newPointLoading, setNewPointLoading] = useState(false);
  const isNameErrored = pointName.length > 100;
  const isSaveButtonDisabled =
    isNameErrored || pointName.length === 0 || newPointLoading;

  const handleNameChange: TextFieldProps['onChange'] = (event) =>
    setPointName(event.target.value);

  const onDialogClose = () => {
    setNewPointError(undefined);
    setNewPointLoading(false);
    setPointName('');
    onClose();
  };

  const onPointSave = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    setNewPointError(undefined);
    setNewPointLoading(true);
    try {
      await surveyServices.addNewPoi(siteId, pointName, user?.token);
      const { data: newPoints } = await siteServices.getSiteSurveyPoints(
        siteId.toString(),
      );
      const resultingPoints = newPoints.map(({ id, name }) => ({
        id,
        name,
        polygon: null,
      }));
      dispatch(setSiteSurveyPoints(resultingPoints));
      if (onSuccess) {
        onSuccess(pointName, resultingPoints);
      }
      onClose();
    } catch (err) {
      setNewPointError(getAxiosErrorMessage(err));
    } finally {
      setNewPointLoading(false);
    }
  };

  const helperText = () => {
    switch (true) {
      case isNameErrored:
        return `Name must not exceed ${maxLengths.SURVEY_POINT_NAME} characters`;
      case !!newPointError:
        return newPointError;
      default:
        return '';
    }
  };

  return (
    <Dialog maxWidth="sm" fullWidth onClose={onDialogClose} open={open}>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography color="textSecondary" variant="h4">
          New Survey Point
        </Typography>
        <IconButton disabled={newPointLoading} onClick={onDialogClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form>
        <DialogContent className={classes.dialogContent}>
          <TextField
            autoFocus
            variant="outlined"
            fullWidth
            label="Survey Point Name"
            onChange={handleNameChange}
            error={isNameErrored || !!newPointError}
            helperText={helperText()}
          />
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={onDialogClose}
            disabled={newPointLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="outlined"
            color="primary"
            disabled={isSaveButtonDisabled}
            onClick={(e) => onPointSave(e)}
          >
            {newPointLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  dialogTitle: {
    borderBottom: `1px solid ${grey[400]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogContent: {
    paddingTop: theme.spacing(3),
  },
}));

interface NewSurveyPointDialogProps {
  open: boolean;
  siteId: number;
  onClose: () => void;
  onSuccess?: (arg0: string, arg1: SurveyPoints[]) => void;
}

NewSurveyPointDialog.defaultProps = {
  onSuccess: undefined,
};

export default NewSurveyPointDialog;
