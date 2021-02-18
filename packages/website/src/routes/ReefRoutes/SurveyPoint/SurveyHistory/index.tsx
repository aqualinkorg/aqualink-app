import React from "react";
import {
  Container,
  Box,
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  Grid,
} from "@material-ui/core";

import TimeLine from "../../../../common/SiteDetails/Surveys/Timeline";

const SurveyHistory = ({
  isAdmin,
  pointName,
  pointId,
  reefId,
  timeZone,
  classes,
}: SurveyHistoryProps) => {
  return (
    <Box className={classes.timelineWrapper}>
      <Container>
        <Grid container justify="center">
          <Box mt="100px">
            <Typography variant="h4">{pointName} Survey History</Typography>
          </Box>
        </Grid>
        <TimeLine
          isAdmin={isAdmin}
          addNewButton={false}
          observation="any"
          pointName={pointName}
          pointId={pointId}
          reefId={reefId}
          timeZone={timeZone}
        />
      </Container>
    </Box>
  );
};

const styles = () =>
  createStyles({
    timelineWrapper: {
      backgroundColor: "rgb(245, 246, 246)",
    },
  });

interface SurveyHistoryIncomingProps {
  isAdmin: boolean;
  pointName: string;
  pointId: number;
  reefId: number;
  timeZone: string | null | undefined;
}

type SurveyHistoryProps = SurveyHistoryIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyHistory);
