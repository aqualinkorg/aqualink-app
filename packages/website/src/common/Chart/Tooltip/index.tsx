import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Button,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import styled from "@material-ui/core/styles/styled";
import { isNull } from "lodash";

import { formatNumber } from "../../../helpers/numberUtils";
import { displayTimeInLocalTimezone } from "../../../helpers/dates";

const Circle = styled("div")<{}, { color: string; size?: number }>(
  ({ size = 10, color: backgroundColor }) => ({
    marginRight: 5,
    marginTop: 3,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    display: "inline-block",
  })
);

const TemperatureMetric = ({
  temperature,
  title,
  color,
  gridClassName,
}: {
  temperature: number | null;
  title: string;
  color: string;
  gridClassName: string | undefined;
}) => (
  <Grid container item className={gridClassName}>
    <Circle color={color} />
    <Typography variant="caption">
      {title} {`${formatNumber(temperature, 1)} °C`}
    </Typography>
  </Grid>
);

const Tooltip = ({
  reefId,
  date,
  depth,
  historicalMonthlyMeanTemp,
  satelliteTemp,
  spotterTopTemp,
  spotterBottomTemp,
  hoboBottomTemp,
  surveyId,
  reefTimeZone,
  userTimeZone,
  classes,
}: TooltipProps) => {
  const hasHourlyData = !isNull(spotterTopTemp) || !isNull(hoboBottomTemp);
  const dateString = displayTimeInLocalTimezone({
    isoDate: date,
    format: `MM/DD/YY${hasHourlyData ? " hh:mm A" : ""}`,
    displayTimezone: hasHourlyData,
    timeZone: userTimeZone,
    timeZoneToDisplay: reefTimeZone,
  });

  const tooltipLines: {
    temperature: number | null;
    color: string;
    title: string;
  }[] = [
    {
      temperature: historicalMonthlyMeanTemp,
      color: "#d84424",
      title: "MONTHLY MEAN",
    },
    { temperature: satelliteTemp, color: "#6bc1e1", title: "SURFACE" },
    { temperature: spotterTopTemp, color: "#46a5cf", title: "BUOY 1m" },
    {
      temperature: spotterBottomTemp,
      color: "rgba(250, 141, 0)",
      title: depth ? `BUOY ${depth}m` : "BUOY AT DEPTH",
    },
    {
      temperature: hoboBottomTemp,
      color: "rgba(250, 141, 0)",
      title: "HOBO LOGGER",
    },
  ];

  return (
    <div className={classes.tooltip}>
      <Card className={classes.tooltipCard}>
        <CardHeader
          className={classes.tooltipHeader}
          title={
            <Typography color="textPrimary" variant="caption">
              {dateString}
            </Typography>
          }
        />
        <CardContent className={classes.tooltipContent}>
          <Grid
            style={{ height: "100%" }}
            item
            container
            justify="space-between"
          >
            <Grid
              container
              justify="space-between"
              alignItems="center"
              item
              xs={12}
            >
              {tooltipLines.map(
                (item) =>
                  item.temperature && (
                    <TemperatureMetric
                      key={item.color}
                      {...item}
                      gridClassName={classes.tooltipContentItem}
                    />
                  )
              )}
            </Grid>
            {surveyId && (
              <Grid item>
                <Link
                  className={classes.surveyLink}
                  to={`/reefs/${reefId}/survey_details/${surveyId}`}
                >
                  <Button variant="contained" color="primary" size="small">
                    VIEW SURVEY
                  </Button>
                </Link>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <div
        className={classes.tooltipArrow}
        style={{
          borderColor: "#095877 transparent transparent transparent",
        }}
      />
    </div>
  );
};

const styles = () =>
  createStyles({
    tooltip: {
      display: "flex",
      justifyContent: "center",
      width: 190,
      minHeight: 60,
    },
    tooltipCard: {
      display: "flex",
      flexFlow: "column",
      backgroundColor: "#095877",
      borderRadius: 8,
      paddingBottom: "0.5rem",
    },
    tooltipHeader: {
      flex: "0 1 auto",
      padding: "0.5rem 1rem 1rem",
      height: 30,
    },
    tooltipContent: {
      flex: "1 1 auto",
      padding: "0rem 1rem 0rem 1rem",
    },
    tooltipContentItem: {
      width: "150px",
      height: 20,
      margin: "0",
    },
    tooltipArrow: {
      content: " ",
      position: "absolute",
      top: "100%" /* At the bottom of the tooltip */,
      left: "50%",
      marginLeft: "-10px",
      borderWidth: "10px",
      borderStyle: "solid",
      borderColor: "#095877 transparent transparent transparent",
    },
    surveyLink: {
      textDecoration: "none",
      "&:hover": {
        textDecoration: "none",
      },
    },
  });

export interface TooltipData {
  reefId: number;
  date: string;
  depth: number | null;
  historicalMonthlyMeanTemp: number | null;
  satelliteTemp: number | null;
  spotterTopTemp: number | null;
  spotterBottomTemp: number | null;
  hoboBottomTemp: number | null;
  surveyId?: number | null;
  reefTimeZone?: string | null;
  userTimeZone?: string;
}

type TooltipProps = TooltipData & WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
