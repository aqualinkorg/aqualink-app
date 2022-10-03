import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
  Box,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import RemoveIcon from "@material-ui/icons/Remove";
import UpdateInfo from "../../UpdateInfo";
import { findAdministeredSite } from "../../../helpers/findAdministeredSite";
import { formatNumber } from "../../../helpers/numberUtils";
import { toRelativeTime } from "../../../helpers/dates";
import { User } from "../../../store/User/types";
import sensor from "../../../assets/sensor.svg";
import { styles as incomingStyles } from "../styles";
import { isAdmin } from "../../../helpers/user";
import { userInfoSelector } from "../../../store/User/userSlice";
import { LatestDataASSofarValue } from "../../../store/Sites/types";

/**
 * Get the sensor application tag message and clickability for a user/site combination.
 *
 * @param user
 * @param siteId
 */
const getApplicationTag = (
  user: User | null,
  siteId: number
): [string, boolean] => {
  const userSite = findAdministeredSite(user, siteId);
  const { applied, status } = userSite || {};
  const isSiteAdmin = isAdmin(user, siteId);

  switch (true) {
    case !isSiteAdmin:
      return ["No Live Telemetry", false];

    case !applied:
      return ["No Live Telemetry", false];

    case status === "in_review":
      return ["My Application", true];

    case status === "approved":
      return ["Smart Buoy Approved", false];

    case status === "rejected":
      return ["Smart Buoy Not Approved", false];

    case status === "shipped":
      return ["Your Buoy Has Shipped!", false];

    default:
      return ["Not Installed Yet", false];
  }
};

const Sensor = ({ depth, id, data, classes }: SensorProps) => {
  const {
    topTemperature,
    bottomTemperature,
    barometricPressure,
    barometricPressureDiff,
  } = data;

  const relativeTime =
    (topTemperature?.timestamp && toRelativeTime(topTemperature.timestamp)) ||
    (bottomTemperature?.timestamp &&
      toRelativeTime(bottomTemperature.timestamp));

  const hasSpotter = Boolean(topTemperature?.value || bottomTemperature?.value);

  const user = useSelector(userInfoSelector);

  const metrics = [
    {
      label: "TEMP AT 1m",
      value: `${formatNumber(topTemperature?.value, 1)}°C`,
    },
    {
      label: `TEMP AT ${depth ? `${depth}m` : "DEPTH"}`,
      value: `${formatNumber(bottomTemperature?.value, 1)}°C`,
    },
  ];

  const [alertText, clickable] = getApplicationTag(user, id);

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography className={classes.cardTitle} variant="h6">
                BUOY OBSERVATION
              </Typography>
            </Grid>
          </Grid>
        }
      />

      <CardContent className={classes.content}>
        <Box
          p="1rem"
          display="flex"
          flexGrow={1}
          style={{ position: "relative" }}
        >
          <Grid container direction="row" spacing={1}>
            <Grid item xs={12}>
              <Grid container spacing={1} direction="row">
                <Grid item xs={6}>
                  <Grid container spacing={5} direction="row">
                    {metrics.map(({ label, value }) => (
                      <Grid key={label} item xs={12}>
                        <Typography
                          className={classes.contentTextTitles}
                          variant="subtitle2"
                        >
                          {label}
                        </Typography>
                        <Typography
                          className={classes.contentTextValues}
                          variant="h3"
                        >
                          {value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <img
                    alt="sensor"
                    src={sensor}
                    height={barometricPressure ? "135" : "150"}
                    width="auto"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container direction="row" spacing={1}>
                {barometricPressure && (
                  <Grid item xs={6}>
                    <Typography
                      className={classes.contentTextTitles}
                      variant="subtitle2"
                    >
                      BAROMETRIC PRESSURE
                    </Typography>
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography
                        className={classes.contentTextValues}
                        variant="h3"
                      >
                        {formatNumber(barometricPressure?.value, 1)}
                      </Typography>
                      <Typography className={classes.contentUnits} variant="h6">
                        hPa
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {barometricPressure && (
                  <Grid
                    item
                    xs={6}
                    style={{ alignItems: "flex-end", display: "flex" }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      {(barometricPressureDiff?.value || 0) === 0 && (
                        <RemoveIcon />
                      )}
                      {(barometricPressureDiff?.value || 0) <= 0 && (
                        <ArrowDownwardIcon />
                      )}
                      {(barometricPressureDiff?.value || 0) >= 0 && (
                        <ArrowUpwardIcon />
                      )}

                      <Typography
                        className={classes.contentTextValues}
                        variant="h3"
                      >
                        {formatNumber(barometricPressureDiff?.value, 1)}
                      </Typography>
                      <Typography className={classes.contentUnits} variant="h6">
                        hPa
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {hasSpotter ? (
          <UpdateInfo
            relativeTime={relativeTime}
            timeText="Last data received"
            live
            frequency="hourly"
            withMargin
          />
        ) : (
          <Grid
            className={classes.noSensorAlert}
            container
            alignItems="center"
            justify="center"
          >
            {clickable ? (
              <Link
                className={classes.newSpotterLink}
                to={`/sites/${id}/apply`}
              >
                <Typography variant="h6">{alertText}</Typography>
              </Link>
            ) : (
              <Typography variant="h6">{alertText}</Typography>
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    ...incomingStyles,
    root: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#128cc0",
    },
    titleImage: {
      height: 35,
      width: 35,
    },
    content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      flexGrow: 1,
      padding: 0,
    },
    noSensorAlert: {
      backgroundColor: "#edb86f",
      borderRadius: "0 0 4px 4px",
      color: "white",
      width: "100%",
      minHeight: 40,
      marginTop: 32,
    },
    rejectedAlert: {
      fontSize: 11,
    },
    newSpotterLink: {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "inherit",
      textDecoration: "none",
      "&:hover": {
        color: "inherit",
        textDecoration: "none",
      },
    },
  });

interface SensorIncomingProps {
  depth: number | null;
  id: number;
  data: LatestDataASSofarValue;
}

type SensorProps = WithStyles<typeof styles> & SensorIncomingProps;

export default withStyles(styles)(Sensor);
