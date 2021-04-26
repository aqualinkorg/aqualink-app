import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import {
  userInfoSelector,
  userLoadingSelector,
} from "../../store/User/userSlice";
import Delayed from "../../common/Delayed";
import DashboardContent from "./Content";
import FullScreenMessage from "../../common/FullScreenMessage";

const Dashboard = ({ match, classes }: DashboardProps) => {
  const user = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);
  const { collectionName } = match.params;

  return (
    <>
      <NavBar searchLocation={false} />
      <div className={classes.root}>
        {!user && !userLoading && !collectionName && (
          <Delayed waitBeforeShow={1000}>
            <FullScreenMessage message="Please sign in to view your dashboard" />
          </Delayed>
        )}
        {userLoading && !collectionName && <LinearProgress />}
        <DashboardContent defaultCollectionName={collectionName} />
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

interface MatchProps extends RouteComponentProps<{ collectionName?: string }> {}

type DashboardProps = MatchProps & WithStyles<typeof styles>;

export default withStyles(styles)(Dashboard);
