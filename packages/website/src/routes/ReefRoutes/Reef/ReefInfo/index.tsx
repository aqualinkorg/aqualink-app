import React, { useCallback } from "react";
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
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";

import { setSelectedReef } from "../../../../store/Reefs/selectedReefSlice";

const ReefNavBar = ({
  hasDailyData,
  reefName = "",
  lastSurvey,
  isManager,
  classes,
}: ReefNavBarProps) => {
  const dispatch = useDispatch();

  const clearReefInfo = useCallback(() => {
    if (!hasDailyData) {
      dispatch(setSelectedReef(null));
    }
  }, [hasDailyData, dispatch]);

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

          <Grid container alignItems="center" item xs={10} spacing={1}>
            <Grid item xs={12} md={4} direction="column" container>
              {reefName && (
                <Box>
                  <Typography variant="h4">{reefName}</Typography>
                </Box>
              )}
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
                <Button size="small" color="primary" variant="outlined">
                  EDIT SITE DETAILS
                </Button>
              </Grid>
            )}
          </Grid>
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
  reefName?: string;
  lastSurvey?: string | null;
  isManager: boolean;
}

ReefNavBar.defaultProps = {
  reefName: "",
  lastSurvey: null,
};

type ReefNavBarProps = ReefNavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ReefNavBar);
