import React from "react";
import {
  Container,
  Box,
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  Grid,
  Theme,
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
          <Box className={classes.title}>
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

const styles = (theme: Theme) =>
  createStyles({
    timelineWrapper: {
      backgroundColor: "rgb(245, 246, 246)",
    },
    title: {
      marginTop: 100,
      [theme.breakpoints.down("xs")]: {
        marginTop: 50,
      },
    },
  });

interface SurveyHistoryIncomingProps {
  reef: Reef;
  pointId: number;
}

type SurveyHistoryProps = SurveyHistoryIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyHistory);
