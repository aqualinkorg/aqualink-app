import React from "react";
import {
  Card,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
} from "@material-ui/core";

const TempAnalysis = ({ classes }: TempAnalysisProps) => {
  return (
    <Card className={classes.tempAnalysisCard}>
      <Typography variant="subtitle1" color="textSecondary">
        TEMP ANALYSIS
      </Typography>
    </Card>
  );
};

const styles = () =>
  createStyles({
    tempAnalysisCard: {
      padding: 16,
      height: 300,
      marginTop: 30,
      backgroundColor: "#f8f9f9",
    },
  });

interface TempAnalysisIncomingProps {}

type TempAnalysisProps = TempAnalysisIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(TempAnalysis);
