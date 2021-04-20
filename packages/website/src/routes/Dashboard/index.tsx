/* eslint-disable no-nested-ternary */
import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
  Box,
  Typography,
  Theme,
} from "@material-ui/core";
import { useSelector } from "react-redux";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import {
  userInfoSelector,
  userLoadingSelector,
} from "../../store/User/userSlice";
import Delayed from "../../common/Delayed";
import DashboardContent from "./Content";
import { mockUser } from "../../mocks/mockUser";

const Dashboard = ({ staticMode, classes }: DashboardProps) => {
  const user = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);

  return (
    <>
      <NavBar searchLocation={false} />
      <div className={classes.root}>
        {!user && !userLoading && !staticMode && (
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
        {userLoading && !staticMode && <LinearProgress />}
        {staticMode ? (
          <DashboardContent user={mockUser} />
        ) : user ? (
          <DashboardContent user={user} />
        ) : null}
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

interface DashboardIncomingProps {
  staticMode?: boolean;
}

Dashboard.defaultProps = {
  staticMode: false,
};

type DashboardProps = DashboardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Dashboard);
