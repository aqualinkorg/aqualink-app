import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import {
  userInfoSelector,
  userLoadingSelector,
} from "../../store/User/userSlice";
import { collectionRequest } from "../../store/Collection/collectionSlice";
import Delayed from "../../common/Delayed";
import DashboardContent from "./Content";
import FullScreenMessage from "../../common/FullScreenMessage";

const collections: { [key: string]: number } = {
  minderoo: 1,
};

const Dashboard = ({ match, classes }: DashboardProps) => {
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);
  const { collectionName: urlCollectionName } = match.params;

  const urlCollectionId = urlCollectionName
    ? collections[urlCollectionName]
    : undefined;

  useEffect(() => {
    if (urlCollectionId) {
      dispatch(collectionRequest({ id: urlCollectionId, isPublic: true }));
    }
  }, [urlCollectionId, dispatch]);

  useEffect(() => {
    if (!urlCollectionId && user?.token && user.collection?.id) {
      dispatch(
        collectionRequest({
          id: user.collection.id,
          isPublic: false,
          token: user.token,
        })
      );
    }
  }, [urlCollectionId, dispatch, user]);

  return (
    <>
      <NavBar searchLocation={false} />
      <div className={classes.root}>
        {!user && !userLoading && !urlCollectionName && (
          <Delayed waitBeforeShow={1000}>
            <FullScreenMessage message="Please sign in to view your dashboard" />
          </Delayed>
        )}
        {userLoading && !urlCollectionName && <LinearProgress />}
        <DashboardContent />
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
