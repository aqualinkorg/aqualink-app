import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  makeStyles,
  CardHeader,
  Grid,
  Typography,
  CardContent,
  GridProps,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import moment from "moment";

import { styles as incomingStyles } from "../styles";
import { siteTimeSeriesDataRangeSelector } from "../../../store/Sites/selectedSiteSlice";
import {
  calculateSondeDataMeanValues,
  findSondeDataMinAndMaxDates,
} from "./utils";
import { MetricsKeys, TimeSeriesData } from "../../../store/Sites/types";
import { timeSeriesRequest } from "../../../store/Sites/helpers";
import { formatNumber } from "../../../helpers/numberUtils";
import { getSondeConfig } from "../../../constants/sondeConfig";
import UpdateInfo from "../../UpdateInfo";

const CARD_BACKGROUND_COLOR = "#37A692";
const METRICS: MetricsKeys[] = [
  "odo_concentration",
  "cholorophyll_concentration",
  "ph",
  "salinity",
  "turbidity",
];

interface Metric {
  label: string;
  value: string;
  unit: string;
  xs: GridProps["xs"];
}

const metrics = (
  data: ReturnType<typeof calculateSondeDataMeanValues>
): Metric[] => [
  {
    label: "DISSOLVED OXYGEN CONCENTRATION",
    value: formatNumber(data?.odoConcentration, 2),
    unit: getSondeConfig("odo_concentration").units,
    xs: 6,
  },
  {
    label: "CHLOROPHYLL CONCENTRATION",
    value: formatNumber(data?.cholorophyllConcentration, 2),
    unit: getSondeConfig("cholorophyll_concentration").units,
    xs: 6,
  },
  {
    label: "ACIDITY",
    value: formatNumber(data?.ph, 1),
    unit: getSondeConfig("ph").units,
    xs: 4,
  },
  {
    label: "SALINITY",
    value: formatNumber(data?.salinity, 1),
    unit: getSondeConfig("salinity").units,
    xs: 5,
  },
  {
    label: "TURBIDITY",
    value: formatNumber(data?.turbidity, 1),
    unit: getSondeConfig("turbidity").units,
    xs: 3,
  },
];

const WaterSamplingCard = ({
  siteId,
  pointId,
  pointName,
}: WaterSamplingCardProps) => {
  const classes = useStyles();
  const { sonde: sondeDataRange } =
    useSelector(siteTimeSeriesDataRangeSelector) || {};
  const { minDate, maxDate } = findSondeDataMinAndMaxDates(sondeDataRange);
  const [sondeData, setSondeData] = useState<TimeSeriesData["sonde"]>();
  const meanValues = calculateSondeDataMeanValues(sondeData);

  useEffect(() => {
    const getCardData = async () => {
      if (minDate && maxDate) {
        const [data] = await timeSeriesRequest({
          siteId,
          pointId,
          start: minDate,
          end: maxDate,
          metrics: METRICS,
          hourly: true,
        });
        setSondeData(data?.sonde);
      }
    };

    getCardData();
  }, [maxDate, minDate, pointId, siteId]);

  return (
    <Card className={classes.card}>
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
            {metrics(meanValues).map(({ label, value, unit, xs }) => (
              <Grid key={label} item xs={xs}>
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  {label}
                </Typography>
                <Typography
                  className={classes.contentTextValues}
                  variant="h3"
                  display="inline"
                >
                  {value}
                </Typography>
                <Typography
                  className={classes.contentUnits}
                  display="inline"
                  variant="h6"
                >
                  {unit}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
        <UpdateInfo
          relativeTime={moment(maxDate).format("MM.DD.YY")}
          chipWidth={64}
          timeText="Last data uploaded"
          imageText="VIEW UPLOAD"
          subtitle={`Survey point: ${pointName}`}
          href="https://coralsitewatch.noaa.gov/"
        />
      </CardContent>
    </Card>
  );
};

const useStyles = makeStyles(() => ({
  ...incomingStyles,
  card: {
    ...incomingStyles.card,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: CARD_BACKGROUND_COLOR,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flexGrow: 1,
    padding: 0,
  },
}));

interface WaterSamplingCardProps {
  siteId: string;
  pointId?: string;
  pointName?: string;
}

WaterSamplingCard.defaultProps = {
  pointId: undefined,
  pointName: undefined,
};

export default WaterSamplingCard;
