import React, { useState } from "react";
import {
  Tooltip,
  IconButton,
  useTheme,
  createStyles,
  WithStyles,
  withStyles,
  Theme,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import {
  setCollectionSites,
  userInfoSelector,
} from "../../../../../store/User/userSlice";
import { belongsToCollection } from "../../../../../helpers/siteUtils";
import { hasCollection } from "../../../../../helpers/user";
import { ReactComponent as WatchIcon } from "../../../../../assets/watch.svg";
import { ReactComponent as UnWatchIcon } from "../../../../../assets/unwatch.svg";
import collectionServices from "../../../../../services/collectionServices";

const CollectionButton = ({
  siteId,
  errorCallback,
  classes,
}: CollectionButtonProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const [collectionActionLoading, setCollectionActionLoading] = useState(false);
  const siteBelongsToCollection = belongsToCollection(
    siteId,
    user?.collection?.siteIds
  );

  const onAddSiteToCollection = () => {
    if (user?.token && user?.collection && !siteBelongsToCollection) {
      setCollectionActionLoading(true);
      collectionServices
        .updateCollection(
          {
            id: user.collection.id,
            addSiteIds: [siteId],
          },
          user.token
        )
        .then(() => {
          if (user?.collection) {
            dispatch(setCollectionSites([...user.collection.siteIds, siteId]));
          }
        })
        .catch(() => errorCallback())
        .finally(() => setCollectionActionLoading(false));
    }
  };

  const onRemoveSiteFromCollection = () => {
    if (user?.token && user?.collection && siteBelongsToCollection) {
      setCollectionActionLoading(true);
      collectionServices
        .updateCollection(
          {
            id: user.collection.id,
            removeSiteIds: [siteId],
          },
          user.token
        )
        .then(() => {
          if (user?.collection) {
            dispatch(
              setCollectionSites(
                user.collection.siteIds.filter((item) => item !== siteId)
              )
            );
          }
        })
        .catch(() => errorCallback())
        .finally(() => setCollectionActionLoading(false));
    }
  };

  if (!hasCollection(user)) {
    return null;
  }

  return (
    <Tooltip
      title={
        siteBelongsToCollection
          ? "Remove from your dashboard"
          : "Add to your dashboard"
      }
      arrow
      placement="top"
    >
      <IconButton
        className={classes.root}
        disabled={collectionActionLoading}
        onClick={
          siteBelongsToCollection
            ? onRemoveSiteFromCollection
            : onAddSiteToCollection
        }
      >
        {siteBelongsToCollection ? (
          <UnWatchIcon
            color={
              collectionActionLoading
                ? theme.palette.grey[500]
                : theme.palette.error.main
            }
          />
        ) : (
          <WatchIcon
            color={
              collectionActionLoading
                ? theme.palette.grey[500]
                : theme.palette.primary.main
            }
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(-2.5, -1.5, -1, 0.5),
    },
  });

interface CollectionIncomingButtonProps {
  siteId: number;
  errorCallback: () => void;
}

type CollectionButtonProps = CollectionIncomingButtonProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CollectionButton);
