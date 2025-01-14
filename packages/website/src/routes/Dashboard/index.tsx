import React, { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { userInfoSelector, userLoadingSelector } from 'store/User/userSlice';
import {
  collectionDetailsSelector,
  collectionRequest,
} from 'store/Collection/collectionSlice';
import NavBar from 'common/NavBar';
import Footer from 'common/Footer';
import Delayed from 'common/Delayed';
import FullScreenMessage from 'common/FullScreenMessage';
import DashboardContent from './Content';

// This will be removed when the idea of public collections will be introduced.
// For now only this static one is being used.
const collections: Record<string, number> = {
  minderoo: 1,
};

const Dashboard = ({ classes }: DashboardProps) => {
  const dispatch = useDispatch();
  const { collectionName: urlCollectionName } =
    useParams<{ collectionName?: string }>();
  const user = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);
  const { id: storedCollectionId } =
    useSelector(collectionDetailsSelector) || {};
  const [publicNotFound, setPublicNotFound] = useState(false);
  const { pathname } = useLocation();
  const atDashboard = pathname.endsWith('/dashboard');

  // If we are at `/dashboard`, make a request for
  // user's personal collection.
  useEffect(() => {
    if (
      atDashboard &&
      user?.token &&
      user.collection?.id &&
      user.collection.id !== storedCollectionId
    ) {
      dispatch(
        collectionRequest({
          id: user.collection.id,
          token: user.token,
        }),
      );
    }
  }, [atDashboard, dispatch, storedCollectionId, user]);

  // If we are at `/collections/:collectionName`, look for this
  // collection in the static public collections object. If it exists,
  // make a request for this public collection, otherwise inform
  // the user that this public collection does not exist.
  useEffect(() => {
    if (!atDashboard) {
      const isHeatStress = urlCollectionName === 'heat-stress';
      const isId = !Number.isNaN(Number(urlCollectionName));
      const urlCollectionId = isId
        ? Number(urlCollectionName)
        : (!!urlCollectionName && collections[urlCollectionName]) || undefined;

      if (
        (urlCollectionId && storedCollectionId !== urlCollectionId) ||
        isHeatStress
      ) {
        setPublicNotFound(false);
        dispatch(
          collectionRequest({
            id: urlCollectionId,
            isPublic: true,
            isHeatStress,
          }),
        );
      } else if (!urlCollectionId) {
        setPublicNotFound(true);
      }
    }
  }, [atDashboard, dispatch, urlCollectionName, storedCollectionId]);

  const DashboardComponent = () => {
    switch (true) {
      case atDashboard && userLoading:
        return <LinearProgress />;
      case atDashboard && !user && !userLoading:
        return (
          <Delayed waitBeforeShow={1000}>
            <FullScreenMessage message="Please sign in to view your dashboard" />
          </Delayed>
        );
      case !atDashboard && publicNotFound:
        return <FullScreenMessage message="Collection not found" />;
      default:
        return (
          <Delayed waitBeforeShow={100}>
            <DashboardContent />
          </Delayed>
        );
    }
  };

  return (
    <>
      <NavBar searchLocation={false} />
      <div className={classes.root}>{DashboardComponent()}</div>
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

type DashboardProps = WithStyles<typeof styles>;

export default withStyles(styles)(Dashboard);
