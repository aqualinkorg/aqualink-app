import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
  Box,
  Typography,
  Theme,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import {
  userInfoSelector,
  userLoadingSelector,
} from "../../store/User/userSlice";
import Delayed from "../../common/Delayed";
import DashboardContent from "./Content";
import {
  reefsListLoadingSelector,
  reefsListSelector,
  reefsRequest,
} from "../../store/Reefs/reefsListSlice";

const Dashboard = ({ classes }: DashboardProps) => {
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);
  const reefsList = useSelector(reefsListSelector);
  const reefsListLoading = useSelector(reefsListLoadingSelector);

  const loading = userLoading || reefsListLoading;

  useEffect(() => {
    if (!reefsList) {
      dispatch(reefsRequest());
    }
  }, [dispatch, reefsList]);

  return (
    <>
      <NavBar searchLocation={false} />
      <div className={classes.root}>
        {!user && !loading && (
          <Delayed waitBeforeShow={1000}>
            <Box
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Typography variant="h2" className={classes.noUserMessage}>
                Please sign in to view your dashboard
              </Typography>
            </Box>
          </Delayed>
        )}
        {loading && <LinearProgress />}
        {user && reefsList && (
          <DashboardContent user={user} reefsList={reefsList} />
        )}
      </div>
      <Footer />
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },

    noUserMessage: {
      color: theme.palette.primary.main,
    },
  });

type DashboardProps = WithStyles<typeof styles>;

export default withStyles(styles)(Dashboard);
