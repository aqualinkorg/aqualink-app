import React, { useCallback, useState } from "react";
import moment from "moment";
import {
  Grid,
  Typography,
  IconButton,
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Box,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";

import EditForm from "./EditForm";
import {
  reefRequest,
  setSelectedReef,
} from "../../../../store/Reefs/selectedReefSlice";
import { Reef, ReefUpdateParams } from "../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../store/Reefs/helpers";
import reefServices from "../../../../services/reefServices";
import { userInfoSelector } from "../../../../store/User/userSlice";

const ReefNavBar = ({
  hasDailyData,
  reef,
  lastSurvey,
  isManager,
  classes,
}: ReefNavBarProps) => {
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const [editEnabled, setEditEnabled] = useState<boolean>(false);
  const reefName = getReefNameAndRegion(reef).name || "";

  const clearReefInfo = useCallback(() => {
    if (!hasDailyData) {
      dispatch(setSelectedReef(null));
    }
  }, [hasDailyData, dispatch]);

  const onCloseForm = useCallback(() => setEditEnabled(false), []);

  const handleFormSubmit = useCallback(
    (data: ReefUpdateParams) => {
      if (user && user.token) {
        reefServices
          .updateReef(reef.id, data, user.token)
          .then(() => dispatch(reefRequest(`${reef.id}`)))
          .finally(() => setEditEnabled(false));
      }
    },
    [user, reef.id, dispatch]
  );

  return (
    <Grid
      className={classes.root}
      container
      justify="space-between"
      alignItems="center"
    >
      <Grid item xs={12}>
        <Grid alignItems="center" container spacing={1}>
          <Grid item>
            <Link style={{ color: "inherit", textDecoration: "none" }} to="/">
              <IconButton
                onClick={clearReefInfo}
                edge="start"
                color="primary"
                aria-label="menu"
              >
                <ArrowBack />
              </IconButton>
            </Link>
          </Grid>

          {editEnabled ? (
            <Grid item xs={10}>
              <EditForm
                reef={reef}
                onClose={onCloseForm}
                onSubmit={handleFormSubmit}
              />
            </Grid>
          ) : (
            <Grid container alignItems="center" item xs={10} spacing={1}>
              <Grid item xs={12} md={4} direction="column" container>
                <Box>
                  <Typography variant="h4">{reefName}</Typography>
                </Box>
                {lastSurvey && (
                  <Box>
                    <Typography variant="subtitle1">{`Last surveyed: ${moment(
                      lastSurvey
                    ).format("MMM DD[,] YYYY")}`}</Typography>
                  </Box>
                )}
              </Grid>
              {isManager && (
                <Grid item>
                  <Button
                    onClick={() => setEditEnabled(true)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  >
                    EDIT SITE DETAILS
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
    managerInfo: {
      marginRight: "0.5rem",
    },
  });

interface ReefNavBarIncomingProps {
  hasDailyData: boolean;
  reef: Reef;
  lastSurvey?: string | null;
  isManager: boolean;
}

ReefNavBar.defaultProps = {
  lastSurvey: null,
};

type ReefNavBarProps = ReefNavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ReefNavBar);
