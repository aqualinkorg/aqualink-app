import React from "react";
import {
  Box,
  Grid,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import { useSelector } from "react-redux";

import { Reef } from "../../../../store/Reefs/types";
import { surveyListSelector } from "../../../../store/Survey/surveyListSlice";
import { getReefNameAndRegion } from "../../../../store/Reefs/helpers";
import {
  filterSurveys,
  findImagesAtSurveyPoint,
} from "../../../../helpers/surveys";
import { displayTimeInLocalTimezone } from "../../../../helpers/dates";
import { reefHoboDataSelector } from "../../../../store/Reefs/selectedReefSlice";

const Info = ({ reef, pointId, classes }: InfoProps) => {
  const surveys = filterSurveys(
    useSelector(surveyListSelector),
    "any",
    pointId
  );
  const { bottomTemperature: hoboBottomTemperature } =
    useSelector(reefHoboDataSelector) || {};
  const { name: pointName, coordinates: pointCoordinates } =
    reef.surveyPoints.filter((point) => point.id === pointId)[0] || {};
  const { name: reefName, region: reefRegion } = getReefNameAndRegion(reef);
  const [lng, lat] = pointCoordinates || [];
  const nHoboPoints = hoboBottomTemperature?.length || 0;
  const nSurveys = surveys.length;
  const nImages = findImagesAtSurveyPoint(surveys, pointId);
  const lastSurveyed = displayTimeInLocalTimezone({
    isoDate: surveys[0]?.diveDate,
    displayTimezone: false,
    timeZone: reef.timezone,
    format: "MMM DD[,] YYYY",
  });

  return (
    <Grid className={classes.cardInfo} item xs={11} md={6}>
      <Grid container>
        <Box mb="24px">
          <Typography variant="subtitle2" color="textSecondary">
            Last survreyed: {lastSurveyed}
          </Typography>
        </Box>
      </Grid>
      <Grid container justify="space-between" spacing={2}>
        <Grid item>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="h5" color="textSecondary">
                {pointName}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {reefName}
                {reefRegion && `, ${reefRegion}`}
              </Typography>
            </Grid>
            {lat && lng && (
              <Grid item>
                {/* TODO: Add survey point's coordinates */}
                <Grid container item spacing={1}>
                  <Grid item>
                    <Typography variant="subtitle2" color="textSecondary">
                      LAT: {lat}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle2" color="textSecondary">
                      LNG: {lng}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}
            {nHoboPoints > 0 && (
              <Grid item>
                <Typography variant="subtitle2" color="textSecondary">
                  {nHoboPoints} HOBO DATA POINTS
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Grid container justify="space-between" item spacing={4}>
            <Grid item>
              <Grid container alignItems="baseline" item spacing={1}>
                <Grid item>
                  <Typography variant="h5" className={classes.coloredText}>
                    {nSurveys}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" color="textSecondary">
                    {nSurveys === 1 ? "SURVEY" : "SURVEYS"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="baseline" item spacing={1}>
                <Grid item>
                  <Typography variant="h5" className={classes.coloredText}>
                    {nImages}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" color="textSecondary">
                    {nImages === 1 ? "IMAGE" : "IMAGES"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    cardInfo: {
      padding: 24,
    },

    coordinates: {
      marginTop: 16,
    },

    coloredText: {
      color: theme.palette.primary.main,
    },
  });

interface InfoIncomingProps {
  reef: Reef;
  pointId: number;
}

type InfoProps = InfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Info);
