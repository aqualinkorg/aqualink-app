import React from "react";
import { makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { fade } from "@material-ui/core/styles/colorManipulator";

const SKELETON_BACKGROUND_COLOR = fade("#000000", 0.11);

const LoadingCard = () => {
  const classes = useStyles();
  return (
    <Skeleton
      className={classes.root}
      variant="rect"
      height="18rem"
      width="100%"
    />
  );
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 4,
    backgroundColor: SKELETON_BACKGROUND_COLOR,
  },
}));

export default LoadingCard;
