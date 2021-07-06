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
  setCollectionReefs,
  userInfoSelector,
} from "../../../../../store/User/userSlice";
import { belongsToCollection } from "../../../../../helpers/reefUtils";
import { hasCollection } from "../../../../../helpers/user";
import { ReactComponent as WatchIcon } from "../../../../../assets/watch.svg";
import { ReactComponent as UnWatchIcon } from "../../../../../assets/unwatch.svg";
import collectionServices from "../../../../../services/collectionServices";

const CollectionButton = ({
  reefId,
  errorCallback,
  classes,
}: CollectionButtonProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const [collectionActionLoading, setCollectionActionLoading] = useState(false);
  const reefBelongsToCollection = belongsToCollection(
    reefId,
    user?.collection?.reefIds
  );

  const onAddReefToCollection = () => {
    if (user?.token && user?.collection && !reefBelongsToCollection) {
      setCollectionActionLoading(true);
      collectionServices
        .updateCollection(
          {
            id: user.collection.id,
            addReefIds: [reefId],
          },
          user.token
        )
        .then(() => {
          if (user?.collection) {
            dispatch(setCollectionReefs([...user.collection.reefIds, reefId]));
          }
        })
        .catch(() => errorCallback())
        .finally(() => setCollectionActionLoading(false));
    }
  };

  const onRemoveReefFromCollection = () => {
    if (user?.token && user?.collection && reefBelongsToCollection) {
      setCollectionActionLoading(true);
      collectionServices
        .updateCollection(
          {
            id: user.collection.id,
            removeReefIds: [reefId],
          },
          user.token
        )
        .then(() => {
          if (user?.collection) {
            dispatch(
              setCollectionReefs(
                user.collection.reefIds.filter((item) => item !== reefId)
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
        reefBelongsToCollection
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
          reefBelongsToCollection
            ? onRemoveReefFromCollection
            : onAddReefToCollection
        }
      >
        {reefBelongsToCollection ? (
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
  reefId: number;
  errorCallback: () => void;
}

type CollectionButtonProps = CollectionIncomingButtonProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CollectionButton);
