import React from 'react';
import {
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from '@material-ui/core';

import { Site } from 'store/Sites/types';
import { FormField } from 'hooks/useFormField';
import Map from 'common/SiteDetails/Map';

const SurveyPointMap = ({
  site,
  selectedPointId,
  editModeEnabled,
  editPointLatitude,
  editPointLongitude,
  onEditPointCoordinatesChange,
  classes,
}: SurveyPointMapProps) => {
  return (
    <Grid className={classes.mapWrapper} item xs={12} md={4}>
      <Map
        siteId={site.id}
        polygon={site.polygon}
        surveyPoints={site.surveyPoints}
        selectedPointId={selectedPointId}
        surveyPointEditModeEnabled={editModeEnabled}
        editPointLatitude={parseFloat(editPointLatitude.value)}
        editPointLongitude={parseFloat(editPointLongitude.value)}
        onEditPointCoordinatesChange={onEditPointCoordinatesChange}
      />
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    mapWrapper: {
      padding: 16,
      height: 280,
      [theme.breakpoints.down('sm')]: {
        height: 300,
      },
    },
  });

interface SurveyPointMapIncomingProps {
  site: Site;
  selectedPointId: number;
  editModeEnabled: boolean;
  editPointLatitude: FormField<string>;
  editPointLongitude: FormField<string>;
  onEditPointCoordinatesChange: (lat: string, lng: string) => void;
}

type SurveyPointMapProps = SurveyPointMapIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPointMap);
