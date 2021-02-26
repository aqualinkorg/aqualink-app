import React from "react";
import {
  Card,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  withStyles,
  WithStyles,
  createStyles,
} from "@material-ui/core";
import { Popup } from "react-leaflet";
import { Launch } from "@material-ui/icons";
import { Link } from "react-router-dom";

import { Pois } from "../../../../store/Reefs/types";

const SurveyPointPopup = ({
  reefId,
  point,
  classes,
}: SurveyPointPopupProps) => {
  return (
    <Popup closeButton={false} autoPan={false}>
      <Card className={classes.surveyPointPopup}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          item
          spacing={2}
        >
          <Grid item>
            <Typography variant="h6" color="textSecondary">
              {point.name}
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="View survey point" placement="top" arrow>
              <Link to={`/reefs/${reefId}/points/${point.id}`}>
                <IconButton className={classes.viewButton}>
                  <Launch color="primary" />
                </IconButton>
              </Link>
            </Tooltip>
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
      minHeight: 50,
      padding: 16,
    },
    viewButton: {
      padding: 0,
    },
  });

interface SurveyPointPopupIncomingProps {
  reefId: number;
  point: Pois;
}

type SurveyPointPopupProps = SurveyPointPopupIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPointPopup);
