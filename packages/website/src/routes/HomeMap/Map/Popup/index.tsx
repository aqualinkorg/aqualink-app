import React, { useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Grid,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { Popup as LeafletPopup, useLeaflet } from "react-leaflet";
import { useSelector } from "react-redux";

import type { LatLngTuple } from "leaflet";
import type { Reef } from "../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../store/Reefs/helpers";
import { colors } from "../../../../layout/App/theme";
import { formatNumber } from "../../../../helpers/numberUtils";
import {
  degreeHeatingWeeksCalculator,
  dhwColorFinder,
} from "../../../../helpers/degreeHeatingWeeks";
import { reefOnMapSelector } from "../../../../store/Homepage/homepageSlice";

const Popup = ({ reef, classes, autoOpen }: PopupProps) => {
  const { map } = useLeaflet();
  const reefOnMap = useSelector(reefOnMapSelector);
  const popupRef = useRef<LeafletPopup>(null);

  const { degreeHeatingDays, maxBottomTemperature, satelliteTemperature } =
    reef.latestDailyData || {};

  useEffect(() => {
    if (
      map &&
      popupRef?.current &&
      reefOnMap?.polygon.type === "Point" &&
      autoOpen
    ) {
      const { leafletElement: popup } = popupRef.current;
      const [lng, lat] = reefOnMap.polygon.coordinates;
      const moveFunc = () => {
        const point: LatLngTuple = [lat, lng];
        popup.setLatLng(point).openOn(map);
      };
      moveFunc();
    }
  }, [autoOpen, map, reefOnMap]);

  return (
    <LeafletPopup
      ref={reefOnMap?.id === reef.id ? popupRef : null}
      closeButton={false}
      className={classes.popup}
      autoPan={false}
    >
      <Card>
        <CardHeader
          className={classes.popupHeader}
          classes={{
            subheader: classes.subheader,
          }}
          title={getReefNameAndRegion(reef).name}
          subheader={getReefNameAndRegion(reef).region}
        />
        <CardContent>
          <Grid container item xs={12}>
            {maxBottomTemperature ? (
              <Grid item xs={6}>
                <Grid container item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    {`TEMP AT ${reef.depth}m`}
                  </Typography>
                </Grid>
                <Grid container item xs={12}>
                  <Typography
                    style={{ color: colors.lightBlue }}
                    variant="h5"
                    color="textSecondary"
                  >
                    {`${formatNumber(maxBottomTemperature, 1)}  °C`}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Grid item xs={6}>
                <Grid container item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    SST
                  </Typography>
                </Grid>
                <Grid container item xs={12}>
                  <Typography
                    style={{ color: colors.lightBlue }}
                    variant="h5"
                    color="textSecondary"
                  >
                    {`${formatNumber(satelliteTemperature, 1)}  °C`}
                  </Typography>
                </Grid>
              </Grid>
            )}
            <Grid item xs={6}>
              <Grid container item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  HEAT STRESS
                </Typography>
              </Grid>
              <Grid container alignItems="flex-end" item xs={12}>
                <Typography
                  style={{
                    color: `${dhwColorFinder(
                      degreeHeatingWeeksCalculator(degreeHeatingDays)
                    )}`,
                  }}
                  variant="h5"
                  color="textSecondary"
                >
                  {formatNumber(
                    degreeHeatingWeeksCalculator(degreeHeatingDays),
                    1
                  )}
                  &nbsp;
                </Typography>
                <Tooltip title="Degree Heating Weeks - a measure of the amount of time above the 20 year historical maximum temperatures">
                  <Typography
                    style={{
                      color: `${dhwColorFinder(
                        degreeHeatingWeeksCalculator(degreeHeatingDays)
                      )}`,
                      position: "relative",
                      bottom: 0,
                    }}
                    variant="h6"
                    color="textSecondary"
                  >
                    DHW
                  </Typography>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid style={{ margin: "1rem 0 1rem 0" }} container item xs={12}>
            <Grid item>
              <Link
                style={{ color: "inherit", textDecoration: "none" }}
                to={`/reefs/${reef.id}`}
              >
                <Button size="small" variant="outlined" color="primary">
                  EXPLORE
                </Button>
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LeafletPopup>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    popupHeader: {
      backgroundColor: theme.palette.primary.main,
    },

    subheader: {
      color: "white",
    },

    popup: {
      width: "12vw",
      minWidth: 200,
    },
  });

interface PopupIncomingProps {
  reef: Reef;
  autoOpen?: boolean;
}

Popup.defaultProps = {
  autoOpen: true,
};

type PopupProps = PopupIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Popup);
