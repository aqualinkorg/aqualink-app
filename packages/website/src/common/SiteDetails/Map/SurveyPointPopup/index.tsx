import React from 'react';
import { Card, Grid, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { Popup } from 'react-leaflet';

import { SurveyPoints } from 'store/Sites/types';
import Link from '../../../Link';

const SurveyPointPopup = ({
  siteId,
  point,
  classes,
}: SurveyPointPopupProps) => {
  return (
    <Popup closeButton={false} autoPan={false}>
      <Card className={classes.surveyPointPopup}>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          item
          spacing={2}
        >
          <Grid title={point.name || ''} item className={classes.nameWrapper}>
            <Typography
              className={classes.name}
              variant="h6"
              color="textSecondary"
            >
              {point.name}
            </Typography>
          </Grid>
          <Grid item>
            <Link
              to={`/sites/${siteId}/points/${point.id}`}
              isIcon
              tooltipTitle="View survey point"
            />
          </Grid>
        </Grid>
      </Card>
    </Popup>
  );
};

const styles = () =>
  createStyles({
    surveyPointPopup: {
      minWidth: 150,
      maxWidth: 240,
      minHeight: 50,
      padding: 16,
    },
    nameWrapper: {
      maxWidth: '80%',
    },
    name: {
      overflowWrap: 'break-word',
    },
  });

interface SurveyPointPopupIncomingProps {
  siteId: number;
  point: SurveyPoints;
}

type SurveyPointPopupProps = SurveyPointPopupIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPointPopup);
