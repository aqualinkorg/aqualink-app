import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

const SurveyPoint = ({ classes }: SurveyPointProps) => {
  return (
    <div className={classes.root}>
      <span>Survey Point</span>
    </div>
  );
};

const styles = () =>
  createStyles({
    root: {},
  });

interface SurveyPointIncomingProps {}

type SurveyPointProps = SurveyPointIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPoint);
