import React from 'react';
import { Container, Box, Typography, Grid, Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { useSelector } from 'react-redux';

import { Site } from 'store/Sites/types';
import { userInfoSelector } from 'store/User/userSlice';
import { isAdmin } from 'helpers/user';
import TimeLine from 'common/SiteDetails/Surveys/Timeline';

const SurveyHistory = ({
  site,
  pointId,
  bgColor,
  classes,
}: SurveyHistoryProps) => {
  const user = useSelector(userInfoSelector);
  const { name: pointName } =
    site?.surveyPoints.filter((point) => point.id === pointId)[0] || {};

  return (
    <Box bgcolor={bgColor}>
      <Container>
        <Grid container justifyContent="center">
          <Box className={classes.title}>
            <Typography variant="h4">{pointName} Survey History</Typography>
          </Box>
        </Grid>
        <TimeLine
          isAdmin={isAdmin(user, site.id)}
          addNewButton={false}
          observation="any"
          pointName={pointName}
          pointId={pointId}
          siteId={site.id}
          timeZone={site.timezone}
        />
      </Container>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    title: {
      marginTop: 100,
      maxWidth: '90%',
      overflowWrap: 'break-word',
      [theme.breakpoints.down('sm')]: {
        marginTop: 50,
      },
    },
  });

interface SurveyHistoryIncomingProps {
  site: Site;
  pointId: number;
  bgColor: string;
}

type SurveyHistoryProps = SurveyHistoryIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyHistory);
