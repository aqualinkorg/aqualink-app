import React from "react";
import {
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";

import { Reef } from "../../../../store/Reefs/types";
import Map from "../../../../common/SiteDetails/Map";
import { FormField } from "../../../../hooks/useFormField";

const SurveyPointMap = ({
  reef,
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
        reefId={reef.id}
        polygon={reef.polygon}
        surveyPoints={reef.surveyPoints}
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
      [theme.breakpoints.down("sm")]: {
        height: 300,
      },
    },
  });

interface SurveyPointMapIncomingProps {
  reef: Reef;
  selectedPointId: number;
  editModeEnabled: boolean;
  editPointLatitude: FormField;
  editPointLongitude: FormField;
  onEditPointCoordinatesChange: (lat: string, lng: string) => void;
}

type SurveyPointMapProps = SurveyPointMapIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPointMap);
