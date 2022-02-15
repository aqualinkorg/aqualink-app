import React, { FC } from "react";
import {
  Box,
  Card,
  createStyles,
  Grid,
  GridProps,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import moment from "moment";
import { useSelector } from "react-redux";
import classNames from "classnames";

import { siteTimeSeriesDataLoadingSelector } from "../../../store/Sites/selectedSiteSlice";
import { calculateCardMetrics } from "./helpers";
import { CardColumn, Dataset } from "./types";
import { formatNumber } from "../../../helpers/numberUtils";
import type { Dataset as ChartDataset } from "..";

const rows = ["MAX", "MEAN", "MIN"];

/* eslint-disable react/prop-types */
const AnalysisCard: FC<AnalysisCardProps> = ({
  classes,
  datasets,
  dataset,
  pickerStartDate,
  pickerEndDate,
  chartStartDate,
  chartEndDate,
  columnJustification,
  children,
}) => {
  const loading = useSelector(siteTimeSeriesDataLoadingSelector);
  const hasData = datasets.some(({ displayData }) => displayData);
  const isOceanSense = dataset === "oceanSense";
  const showCard = !loading && hasData;

  if (!showCard) {
    return null;
  }

  const cardColumns: CardColumn[] = datasets.map(
    ({
      label,
      curveColor,
      data,
      unit,
      displayData,
      cardColumnName,
      cardColumnTooltip,
    }) => ({
      title: cardColumnName || label,
      color: curveColor,
      display: !!displayData,
      key: label,
      rows: calculateCardMetrics(2, chartStartDate, chartEndDate, data, label),
      unit,
      tooltip: cardColumnTooltip,
    })
  );

  const formattedpickerStartDate = moment(pickerStartDate).format("MM/DD/YYYY");
  const formattedpickerEndDate = moment(pickerEndDate).format("MM/DD/YYYY");

  return (
    <Box
      height="100%"
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
      minWidth={220}
    >
      <Card className={classes.AnalysisCardCard}>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {formattedpickerStartDate} - {formattedpickerEndDate}
        </Typography>
        <Grid
          className={classes.metricsWrapper}
          container
          justify={columnJustification || "space-between"}
          alignItems="flex-end"
          spacing={isOceanSense ? 2 : 1}
        >
          <Grid item xs={isOceanSense ? 2 : undefined}>
            <Grid
              className={classes.metricsTitle}
              container
              direction="column"
              item
              spacing={3}
            >
              {rows.map((row) => (
                <Grid key={row} className={classes.rotatedText} item>
                  <Typography variant="caption" color="textSecondary">
                    {row}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          {cardColumns.map(
            (item) =>
              item.display && (
                <Grid key={item.key} item xs={isOceanSense ? 10 : undefined}>
                  <Grid
                    className={classes.autoWidth}
                    container
                    direction="column"
                    item
                    spacing={3}
                    alignItems="flex-start"
                  >
                    <Grid item>
                      <Tooltip title={item.tooltip || ""}>
                        <Typography
                          className={classes.values}
                          style={{
                            color: item.color,
                          }}
                          variant="subtitle2"
                        >
                          {item.title}
                        </Typography>
                      </Tooltip>
                    </Grid>
                    {item.rows.map(({ key, value }) => (
                      <Grid key={key} item>
                        <Typography
                          className={classNames(
                            classes.values,
                            classes.lightFont
                          )}
                          variant="h5"
                          color="textSecondary"
                        >
                          {formatNumber(value, 1)} {item.unit}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )
          )}
        </Grid>
      </Card>

      {children}
    </Box>
  );
};
const styles = (theme: Theme) =>
  createStyles({
    autoWidth: {
      width: "auto",
    },
    AnalysisCardCard: {
      padding: theme.spacing(2),
      minHeight: 240,
      borderRadius: "0 4px 4px 0",
      backgroundColor: "#f8f9f9",
      margin: "14px 0",
      // add horizontal scroll on mobile
      overflowX: "auto",
    },
    rotatedText: {
      transform: "rotate(-90deg)",
    },
    // ensures wrapping never happens no matter the column amount.
    metricsWrapper: { minWidth: "max-content" },
    metricsTitle: {
      position: "relative",
      bottom: 7,
      left: -12,
      width: "auto",
    },
    lightFont: {
      fontWeight: 200,
    },
    values: {
      // ensures metric numbers aren't too close together on mobile
      margin: theme.spacing(0, 0.3),
    },

    extraPadding: {
      paddingLeft: theme.spacing(1),
    },
  });

interface AnalysisCardProps
  extends AnalysisCardIncomingProps,
    WithStyles<typeof styles> {}

interface AnalysisCardIncomingProps {
  datasets: ChartDataset[];
  dataset: Dataset;
  pickerStartDate: string;
  pickerEndDate: string;
  chartStartDate: string;
  chartEndDate: string;
  columnJustification?: GridProps["justify"];
}

export default withStyles(styles)(AnalysisCard);
