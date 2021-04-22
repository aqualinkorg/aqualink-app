import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
  Theme,
} from "@material-ui/core";
import { groupBy, maxBy } from "lodash";

import { findIntervalByLevel } from "../../../helpers/bleachingAlertIntervals";

import { formatNumber } from "../../../helpers/numberUtils";
import { CollectionDetails } from "../../../store/User/types";

const percentageCalculator = (count: number, max?: number) => {
  // Max width should be 80%
  const percentage = max && max !== 0 ? formatNumber((count / max) * 80, 1) : 0;
  return `${percentage}%`;
};

const BarChart = ({ collection, classes }: BarChartProps) => {
  const groupedByAlert = groupBy(
    collection.reefs,
    (reef) => reef.collectionData?.weeklyAlertLevel
  );

  const mostFrequentAlert = maxBy(
    Object.values(groupedByAlert),
    (item) => item.length
  );

  return (
    <>
      <Box color="#979797" margin="0 0 14px 97px">
        <Typography variant="subtitle2">Sites by Alert Level</Typography>
      </Box>
      <Box flexGrow={1} width="100%">
        <Grid
          className={classes.alertsWrapper}
          container
          justify="space-between"
          direction="column"
        >
          {[4, 3, 2, 1, 0].map((level) => {
            const interval = findIntervalByLevel(level);
            return (
              <Grid item key={interval.label}>
                <Grid container alignItems="center">
                  <Grid item>
                    <Box
                      width="77px"
                      height="22px"
                      borderRadius="10px"
                      bgcolor={interval.color}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="700"
                      mr="20px"
                    >
                      <Typography
                        className={classes.alertLabel}
                        color={
                          level === 3 || level === 4
                            ? "textPrimary"
                            : "textSecondary"
                        }
                        variant="subtitle2"
                      >
                        {interval.label}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid className={classes.barWrapper} item>
                    <Box width="100%" display="flex" alignItems="center">
                      <Box
                        width={percentageCalculator(
                          groupedByAlert?.[level]?.length || 0,
                          mostFrequentAlert?.length
                        )}
                        height="28px"
                        bgcolor={interval.color}
                      />
                      <Typography className={classes.siteCount}>
                        {groupedByAlert?.[level]?.length || 0}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    alertLabel: {
      fontWeight: 700,
    },

    alertsWrapper: {
      height: "100%",
    },

    barWrapper: {
      flexGrow: 1,
    },

    siteCount: {
      color: theme.palette.primary.main,
      fontSize: 24,
      fontWeight: 700,
      paddingLeft: 6,
      flexGrow: 1,
      [theme.breakpoints.down("xs")]: {
        fontSize: 16,
        paddingLeft: 4,
      },
    },

    xAxis: {
      width: "80%",
    },
  });

interface BarChartIncomingProps {
  collection: CollectionDetails;
}

type BarChartProps = BarChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(BarChart);
