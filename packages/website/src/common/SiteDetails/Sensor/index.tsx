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

import UpdateInfo from "../../UpdateInfo";
import { findAdministeredSite } from "../../../helpers/findAdministeredSite";
import { formatNumber } from "../../../helpers/numberUtils";
import { toRelativeTime } from "../../../helpers/dates";
import type { Site } from "../../../store/Sites/types";
import { User } from "../../../store/User/types";
import sensor from "../../../assets/sensor.svg";
import { styles as incomingStyles } from "../styles";
import { isAdmin } from "../../../helpers/user";
import { userInfoSelector } from "../../../store/User/userSlice";

/**
 * Get the sensor application tag message and clickability for a user/site conbination.
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
      return ["Not Installed Yet", false];

    case !applied:
      return ["Apply for a Smart Buoy", true];

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

const Sensor = ({ site, classes }: SensorProps) => {
  const { topTemperature, bottomTemperature } = site.liveData;

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
      label: `TEMP AT ${site.depth ? `${site.depth}m` : "DEPTH"}`,
      value: `${formatNumber(bottomTemperature?.value, 1)}°C`,
    },
  ];

  const [alertText, clickable] = getApplicationTag(user, site.id);

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
          <Grid container spacing={1}>
            {metrics.map(({ label, value }) => (
              <Grid key={label} item xs={12}>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  {label}
                </Typography>
                <Typography className={classes.contentTextValues} variant="h3">
                  {value}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Box position="absolute" bottom={-15} right={0}>
            <img alt="sensor" src={sensor} />
          </Box>
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
                to={`/sites/${site.id}/apply`}
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
  site: Site;
}

type SensorProps = WithStyles<typeof styles> & SensorIncomingProps;

export default withStyles(styles)(Sensor);
