import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  IconButton,
  Popover,
  Grid,
  Button,
  Collapse,
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAlertOpen(false);
    setAlertText("");
  };

  const onSurveyDelete = () => {
    if (surveyId && user && user.token) {
      surveyServices
        .deleteSurvey(surveyId, user.token)
        .then(() => {
          setAnchorEl(null);
          dispatch(surveysRequest(`${reefId}`));
        })
        .catch((error) => {
          setAlertOpen(true);
          setAlertText(error.message);
        });
    }
  };

  return (
    <>
      {user && (
        <IconButton onClick={handleClick}>
          <DeleteOutlineIcon color="primary" />
        </IconButton>
      )}
      <Popover
        elevation={3}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Grid
          className={classes.popoverContent}
          container
          justify="center"
          item
          xs={12}
        >
          <Grid
            className={classes.popoverTitle}
            container
            justify="center"
            item
            xs={12}
          >
            <Grid item xs={11}>
              <Typography color="textSecondary">
                Are you sure you would like to delete the survey for{" "}
                {moment(diveDate).format("MM/DD/YYYY")}?
              </Typography>
            </Grid>
          </Grid>
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
          <Grid container alignItems="center" justify="flex-end" item xs={11}>
            <Grid container justify="space-between" item xs={6}>
              <Button
                className={classes.popoverButton}
                size="small"
                variant="contained"
                color="primary"
                onClick={onSurveyDelete}
              >
                Yes
              </Button>
              <Button
                className={classes.popoverButton}
                size="small"
                variant="contained"
                color="secondary"
                onClick={handleClose}
              >
                No
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Popover>
    </>
  );
};

const styles = () =>
  createStyles({
    popoverContent: {
      height: "12rem",
      width: "20rem",
      border: "1px solid black",
    },
    popoverTitle: {
      backgroundColor: "#F4F4F4",
      borderBottom: "1px solid black",
    },
    popoverButton: {
      height: "2rem",
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
