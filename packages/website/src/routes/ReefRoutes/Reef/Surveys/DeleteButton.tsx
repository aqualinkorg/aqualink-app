import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  withStyles,
  WithStyles,
  createStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Collapse,
  LinearProgress,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import moment from "moment";

import surveyServices from "../../../../services/surveyServices";
import { userInfoSelector } from "../../../../store/User/userSlice";
import { surveysRequest } from "../../../../store/Survey/surveyListSlice";

const DeleteButton = ({
  reefId,
  surveyId,
  diveDate,
  classes,
}: DeleteButtonProps) => {
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAlertOpen(false);
    setAlertText("");
  };

  const onSurveyDelete = () => {
    if (surveyId && user && user.token) {
      setLoading(true);
      surveyServices
        .deleteSurvey(surveyId, user.token)
        .then(() => {
          dispatch(surveysRequest(`${reefId}`));
        })
        .catch((error) => {
          setAlertOpen(true);
          setAlertText(error.message);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <>
      <IconButton onClick={handleClickOpen}>
        <DeleteOutlineIcon color="primary" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className={classes.dialogTitle}>
          <Typography color="textSecondary">
            Are you sure you would like to delete the survey for{" "}
            {moment(diveDate).format("MM/DD/YYYY")}?
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {loading && <LinearProgress />}
          <Collapse className={classes.alert} in={alertOpen}>
            <Alert
              severity="error"
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setAlertOpen(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {alertText}
            </Alert>
          </Collapse>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            No
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onSurveyDelete}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const styles = () =>
  createStyles({
    dialogTitle: {
      backgroundColor: "#F4F4F4",
    },
    dialogContent: {
      padding: 0,
    },
    alert: {
      width: "100%",
    },
  });

interface DeleteButtonIncomingProps {
  surveyId?: number;
  diveDate?: string | null;
  reefId: number;
}

type DeleteButtonProps = DeleteButtonIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DeleteButton);
