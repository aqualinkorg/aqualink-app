import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { reefDetailsSelector } from "../../store/Reefs/selectedReefSlice";

const Apply = ({ classes }: ApplyProps) => {
  const reef = useSelector(reefDetailsSelector);
  return (
    <div className={classes.root}>
      {!reef && <Redirect to="/" />}
      Apply Page
    </div>
  );
};

const styles = () =>
  createStyles({
    root: {},
  });

type ApplyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Apply);
