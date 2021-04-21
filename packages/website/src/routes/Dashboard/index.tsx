/* eslint-disable no-nested-ternary */
import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
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
import Message from "../../common/Message";

const Dashboard = ({ staticMode, classes }: DashboardProps) => {
  const user = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);

  return (
    <>
      <NavBar searchLocation={false} />
      <div className={classes.root}>
        {!user && !userLoading && !staticMode && (
          <Delayed waitBeforeShow={1000}>
            <Message message="Please sign in to view your dashboard" />
          </Delayed>
        )}
        {userLoading && !staticMode && <LinearProgress />}
        {staticMode || user ? (
          <DashboardContent
            signedInUser={staticMode ? null : user}
            staticMode={staticMode}
          />
        ) : null}
      </div>
      <Footer />
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      flexGrow: 1,
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
