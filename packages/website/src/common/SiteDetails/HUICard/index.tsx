import {
  Box,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Grid,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import React from "react";
import WarningIcon from "@material-ui/icons/Warning";
import { toRelativeTime } from "../../../helpers/dates";
import { formatNumber } from "../../../helpers/numberUtils";
import { LatestDataASSofarValue, Metrics } from "../../../store/Sites/types";
import UpdateInfo from "../../UpdateInfo";
import { styles as incomingStyles } from "../styles";

type HUICardMetrics =
  | "salinity"
  | "nitratePlusNitrite"
  | "bottomTemperature"
  | "turbidity";

const watchColor = "#e5bb2bd0";
const warningColor = "#ef883cd0";
const alertColor = "#dd143ed0";

// TODO: Change these thresholds with some meaningful values
const thresholds = {
  bottomTemperature: {
    good: 15,
    watch: 20,
    warning: 30,
  },
  nitratePlusNitrite: {
    good: 15,
    watch: 20,
    warning: 30,
  },
  salinity: {
    good: 15,
    watch: 20,
    warning: 30,
  },
  turbidity: {
    good: 3,
    watch: 7,
    warning: 12,
  },
};

function getAlertColor(
  metric: Extract<Metrics, HUICardMetrics>,
  value?: number
) {
  if (!value) return undefined;

  const compare = (th: { good: number; watch: number; warning: number }) => {
    if (value < th.good) return undefined;
    if (value < th.watch) return watchColor;
    if (value < th.warning) return warningColor;
    return alertColor;
  };

  switch (metric) {
    case "bottomTemperature":
      return compare(thresholds.bottomTemperature);
    case "nitratePlusNitrite":
      return compare(thresholds.nitratePlusNitrite);
    case "salinity":
      return compare(thresholds.salinity);
    case "turbidity":
      return compare(thresholds.turbidity);
    default:
      return undefined;
  }
}

function HUICard({ data, classes }: HUICardProps) {
  const relativeTime =
    data?.salinity?.timestamp && toRelativeTime(data?.salinity?.timestamp);

  const metrics = [
    {
      label: "Turbidity",
      value: `${formatNumber(data?.turbidity?.value, 1)} FNU`,
      color: getAlertColor("turbidity", data?.turbidity?.value),
    },
    {
      label: "Nitrate Nitrite Nitrogen",
      value: `${formatNumber(data?.nitratePlusNitrite?.value, 1)} psu`,
      color: getAlertColor(
        "nitratePlusNitrite",
        data?.nitratePlusNitrite?.value
      ),
    },
    {
      label: "Temperature",
      value: `${formatNumber(data?.bottomTemperature?.value, 1)}°C`,
      color: getAlertColor("bottomTemperature", data?.bottomTemperature?.value),
    },
    {
      label: "Salinity",
      value: `${formatNumber(data?.salinity?.value, 1)} psu`,
      color: getAlertColor("salinity", data?.salinity?.value),
    },
  ];

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={
          <Grid container>
            <Grid item>
              <Typography className={classes.cardTitle} variant="h6">
                WATER SAMPLING
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Box p="1rem" display="flex" flexGrow={1}>
          <Grid container spacing={1}>
            {metrics.map(({ label, value, color }) => (
              <>
                <Grid key={label} item xs={6}>
                  <Grid container>
                    <Grid item xs={12}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "nowrap",
                        }}
                      >
                        <Typography
                          className={classes.contentTextTitles}
                          variant="subtitle2"
                        >
                          {label}
                        </Typography>
                        {color && (
                          <WarningIcon
                            className={classes.contentTextTitles}
                            style={{
                              fontSize: "1.1em",
                              marginRight: "1em",
                              marginLeft: "auto",
                              color,
                            }}
                          />
                        )}
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        className={classes.contentTextValues}
                        variant="h3"
                      >
                        {value}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            ))}
          </Grid>
        </Box>

        <Grid container>
          {[
            { text: "watch", color: watchColor },
            { text: "warning", color: warningColor },
            { text: "alert", color: alertColor },
          ].map(({ text, color }) => (
            <Grid
              key={text}
              item
              xs={4}
              style={{ backgroundColor: color, height: "2rem" }}
            >
              <Box textAlign="center">
                <Typography variant="caption" align="center">
                  {text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <UpdateInfo
          relativeTime={relativeTime}
          timeText="Last data received"
          imageText="HUI"
          live={false}
        />
      </CardContent>
    </Card>
  );
}

const styles = () =>
  createStyles({
    ...incomingStyles,
    root: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#37a692",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      flexGrow: 1,
      padding: 0,
    },
  });

interface HUICardIncomingProps {
  data: Partial<Pick<LatestDataASSofarValue, HUICardMetrics>>;
}

type HUICardProps = WithStyles<typeof styles> & HUICardIncomingProps;

export default withStyles(styles)(HUICard);
