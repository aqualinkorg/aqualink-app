import React, { useEffect, useRef } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { Popup as LeafletPopup, useLeaflet } from "react-leaflet";
import { useSelector } from "react-redux";

import { Reef } from "../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../store/Reefs/helpers";
import { colors } from "../../../../layout/App/theme";
import { formatNumber } from "../../../../helpers/numberUtils";
import {
  dhwColorFinder,
  degreeHeatingWeeksCalculator,
} from "../../../../helpers/degreeHeatingWeeks";
import { reefOnMapSelector } from "../../../../store/Homepage/homepageSlice";
import { reefDetailsSelector } from "../../../../store/Reefs/selectedReefSlice";

const Popup = ({ reef, classes }: PopupProps) => {
  const { map } = useLeaflet();
  const reefOnMap = useSelector(reefOnMapSelector);
  const { id: selectedReefId, liveData } =
    useSelector(reefDetailsSelector) || {};
  const { bottomTemperature, satelliteTemperature, degreeHeatingDays } =
    liveData || {};
  const loading = selectedReefId !== reefOnMap?.id;
  const popupRef = useRef<LeafletPopup>(null);

  useEffect(() => {
    if (map && popupRef?.current && reefOnMap?.polygon.type === "Point") {
      const { leafletElement: popup } = popupRef.current;
      const [lng, lat] = reefOnMap.polygon.coordinates;
      popup.setLatLng([lat, lng]).openOn(map);
    }
  }, [map, reefOnMap]);

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
          {loading ? (
            <Grid
              style={{ marginBottom: "1rem" }}
              container
              alignItems="center"
              justify="center"
            >
              <CircularProgress thickness={1} size="105px" />
            </Grid>
          ) : (
            <>
              <Grid container item xs={12}>
                {bottomTemperature?.value ? (
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
                        {`${formatNumber(bottomTemperature.value, 1)}  °C`}
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
                        {`${formatNumber(satelliteTemperature?.value, 1)}  °C`}
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
                          degreeHeatingWeeksCalculator(degreeHeatingDays?.value)
                        )}`,
                      }}
                      variant="h5"
                      color="textSecondary"
                    >
                      {formatNumber(
                        degreeHeatingWeeksCalculator(degreeHeatingDays?.value),
                        1
                      )}
                      &nbsp;
                    </Typography>
                    <Tooltip title="Degree Heating Weeks - a measure of the amount of time above the 20 year historical maximum temperatures">
                      <Typography
                        style={{
                          color: `${dhwColorFinder(
                            degreeHeatingWeeksCalculator(
                              degreeHeatingDays?.value
                            )
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
            </>
          )}
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
}

type PopupProps = PopupIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Popup);
