import React from "react";
import {
  Container,
  Box,
  withStyles,
  WithStyles,
  createStyles,
} from "@material-ui/core";

import TimeLine from "../../../../common/SiteDetails/Surveys/Timeline";

const SurveyHistory = ({
  pointName,
  pointId,
  reefId,
  timeZone,
  classes,
}: SurveyHistoryProps) => {
  return (
    <Box className={classes.timelineWrapper}>
      <Container>
        <TimeLine
          isAdmin
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
  pointName: string;
  pointId: number;
  reefId: number;
  timeZone: string | null | undefined;
}

type SurveyHistoryProps = SurveyHistoryIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyHistory);
