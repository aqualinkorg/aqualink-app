import React, { useState } from "react";
import { Grid, Tooltip, IconButton } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import {
  getSelf,
  userInfoSelector,
  userLoadingSelector,
} from "../../../../../store/User/userSlice";
import { belongsToCollection } from "../../../../../helpers/reefUtils";
import { hasCollection } from "../../../../../helpers/user";
import { ReactComponent as WatchIcon } from "../../../../../assets/watch.svg";
import { ReactComponent as UnWatchIcon } from "../../../../../assets/unwatch.svg";
import userServices from "../../../../../services/userServices";

const CollectionButton = ({ reefId, errorCallback }: CollectionButtonProps) => {
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);
  const [collectionActionLoading, setCollectionActionLoading] = useState(false);

  const onAddReefToCollection = () => {
    if (
      user?.token &&
      user?.collection &&
      !belongsToCollection(reefId, user?.collection)
    ) {
      setCollectionActionLoading(true);
      userServices
        .updateCollection(
          {
            id: user.collection.id,
            addReefIds: [reefId],
          },
          user.token
        )
        .then(() => {
          if (user?.token) {
            dispatch(getSelf(user.token));
          }
        })
        .catch(() => errorCallback())
        .finally(() => setCollectionActionLoading(false));
    }
  };

  const onRemoveReefFromCollection = () => {
    if (
      user?.token &&
      user?.collection &&
      belongsToCollection(reefId, user?.collection)
    ) {
      setCollectionActionLoading(true);
      userServices
        .updateCollection(
          {
            id: user.collection.id,
            removeReefIds: [reefId],
          },
          user.token
        )
        .then(() => {
          if (user?.token) {
            dispatch(getSelf(user.token));
          }
        })
        .catch(() => errorCallback())
        .finally(() => setCollectionActionLoading(false));
    }
  };

  if (!hasCollection(user)) {
    return null;
  }

  return belongsToCollection(reefId, user?.collection) ? (
    <Grid item>
      <Tooltip title="Remove from your collection" arrow placement="top">
        <IconButton
          disabled={collectionActionLoading || userLoading}
          onClick={onRemoveReefFromCollection}
        >
          <UnWatchIcon
            color={collectionActionLoading || userLoading ? "gray" : "black"}
          />
        </IconButton>
      </Tooltip>
    </Grid>
  ) : (
    <Grid item>
      <Tooltip title="Add to your collection" arrow placement="top">
        <IconButton
          disabled={collectionActionLoading || userLoading}
          onClick={onAddReefToCollection}
        >
          <WatchIcon
            color={collectionActionLoading || userLoading ? "gray" : "black"}
          />
        </IconButton>
      </Tooltip>
    </Grid>
  );
};

interface CollectionButtonProps {
  reefId: number;
  errorCallback: () => void;
}

export default CollectionButton;
