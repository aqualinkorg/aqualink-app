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
  Chip,
  Box,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { findAdministeredReef } from "../../../../helpers/findAdministeredReef";
import { formatNumber } from "../../../../helpers/numberUtils";
import type { Reef } from "../../../../store/Reefs/types";
import { User } from "../../../../store/User/types";
import sensor from "../../../../assets/sensor.svg";
import buoy from "../../../../assets/buoy.svg";
import { styles as incomingStyles } from "../styles";
import { isAdmin } from "../../../../helpers/isAdmin";
import { userInfoSelector } from "../../../../store/User/userSlice";

const applicationTag = (user: User | null, reefId: number, classes: any) => {
  const userReef = findAdministeredReef(user, reefId);
  const { applied, status } = userReef || {};
  const isManager = isAdmin(user, reefId);

  switch (true) {
    case !isManager:
      return "Not Installed Yet";

    case !applied:
      return (
        <Link className={classes.newSpotterLink} to="/apply">
          Add a Smart Buoy
        </Link>
      );

    case status === "in_review":
      return (
        <Link className={classes.newSpotterLink} to="/apply">
          My Application
        </Link>
      );

    case status === "approved":
      return "Smart Buoy approved";

    case status === "rejected":
      return (
        <span className={classes.rejectedAlert}>Smart Buoy not approved</span>
      );
    default:
      return "Not Installed Yet";
  }
};

const Sensor = ({ reef, classes }: SensorProps) => {
  const { surfaceTemperature, bottomTemperature } = reef.liveData;

  const hasSpotter = Boolean(
    surfaceTemperature?.value || bottomTemperature?.value
  );

  const user = useSelector(userInfoSelector);

  const metrics = [
    {
      label: "TEMP AT 1m",
      value: `${formatNumber(surfaceTemperature?.value, 1)} °C`,
    },
    {
      label: `TEMP AT ${reef.depth}m`,
      value: `${formatNumber(bottomTemperature?.value, 1)} °C`,
    },
  ];

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container justify="space-between">
            <Grid item xs={8}>
              <Typography className={classes.cardTitle} variant="h6">
                SENSOR OBSERVATION
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <img className={classes.titleImage} alt="buoy" src={buoy} />
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
          <Grid container direction="row" spacing={3}>
            {metrics.map(({ label, value }) => (
              <Grid key={label} item xs={12}>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  {label}
                </Typography>
                <Typography className={classes.contentTextValues} variant="h2">
                  {value}
                </Typography>
              </Grid>
            ))}
            {!hasSpotter && (
              <Grid item xs={8}>
                <Chip
                  className={classes.noSensorAlert}
                  label={applicationTag(user, reef.id, classes)}
                />
              </Grid>
            )}
          </Grid>

          <Box position="absolute" bottom={0} right={0}>
            <img alt="sensor" src={sensor} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    ...incomingStyles,
    card: {
      ...incomingStyles.card,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "#128cc0",
      paddingBottom: "1rem",
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
      borderRadius: 4,
      color: "white",
      width: "100%",
    },
    rejectedAlert: {
      fontSize: 11,
    },
    newSpotterLink: {
      color: "inherit",
      textDecoration: "none",
      "&:hover": {
        color: "inherit",
        textDecoration: "none",
      },
    },
  });

interface SensorIncomingProps {
  reef: Reef;
}

type SensorProps = WithStyles<typeof styles> & SensorIncomingProps;

export default withStyles(styles)(Sensor);
