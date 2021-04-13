import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
  Theme,
  Divider,
} from "@material-ui/core";
import { groupBy, range } from "lodash";

import { Collection } from "../collection";
import { findIntervalByLevel } from "../../../helpers/bleachingAlertIntervals";

import { formatNumber } from "../../../helpers/numberUtils";

const percentageCalculator = (count: number, total: number) => {
  // Max width should be 80%
  const percentage = total !== 0 ? formatNumber((count / total) * 80, 1) : 0;
  return `${percentage}%`;
};

const BarChart = ({ collection, classes }: BarChartProps) => {
  const nSites = collection.reefs.length;
  const groupedByAlert = groupBy(collection.reefs, "weeklyAlertLevel");

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
          {[4, 3, 2, 1, 0].map((level, index) => {
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
                    {/* The barchart's x axis */}
                    {index === 0 && (
                      <>
                        <Box display="flex">
                          {range(0, nSites).map((value) => (
                            <Box
                              key={`barchart-tick-${value}`}
                              width={percentageCalculator(1, nSites)}
                              height="4px"
                              borderLeft={
                                value === 0 ? "1px solid #D8D8D8" : undefined
                              }
                              borderRight="1px solid #D8D8D8"
                            />
                          ))}
                        </Box>
                        <Divider className={classes.xAxis} />
                      </>
                    )}
                    <Box width="100%" display="flex" alignItems="center">
                      <Box
                        width={percentageCalculator(
                          groupedByAlert?.[level]?.length || 0,
                          nSites
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
  collection: Collection;
}

type BarChartProps = BarChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(BarChart);
