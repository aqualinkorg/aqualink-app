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
import { useSelector } from "react-redux";

import TimeLine from "../../../../common/SiteDetails/Surveys/Timeline";
import { Reef } from "../../../../store/Reefs/types";
import { userInfoSelector } from "../../../../store/User/userSlice";
import { isAdmin } from "../../../../helpers/user";

const SurveyHistory = ({ reef, pointId, classes }: SurveyHistoryProps) => {
  const user = useSelector(userInfoSelector);
  const { name: pointName } =
    reef?.surveyPoints.filter((point) => point.id === pointId)[0] || {};

  return (
    <Box className={classes.timelineWrapper}>
      <Container>
        <Grid container justify="center">
          <Box mt="100px">
            <Typography variant="h4">{pointName} Survey History</Typography>
          </Box>
        </Grid>
        <TimeLine
          isAdmin={isAdmin(user, reef.id)}
          addNewButton={false}
          observation="any"
          pointName={pointName}
          pointId={pointId}
          reefId={reef.id}
          timeZone={reef.timezone}
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
  reef: Reef;
  pointId: number;
}

type SurveyHistoryProps = SurveyHistoryIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyHistory);
