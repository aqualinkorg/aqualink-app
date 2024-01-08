import React from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
  Theme,
  useTheme,
} from '@material-ui/core';
import { groupBy, maxBy, times, reverse } from 'lodash';

import { CollectionDetails } from 'store/Collection/types';
import { findIntervalByLevel } from 'helpers/bleachingAlertIntervals';
import { formatNumber } from 'helpers/numberUtils';

const percentageCalculator = (count: number, max?: number) => {
  // Max width should be 80%
  const percentage = max && max !== 0 ? formatNumber((count / max) * 80, 1) : 0;
  return `${percentage}%`;
};

const BarChart = ({ collection, classes }: BarChartProps) => {
  const theme = useTheme();
  const nLevels = 5;
  const groupedByAlert = groupBy(
    collection.sites,
    (site) => site.collectionData?.tempWeeklyAlert || 0,
  );

  const mostFrequentAlert = maxBy(Object.values(groupedByAlert), 'length');

  return (
    <>
      <Box color={theme.palette.grey[500]} margin="0 0 14px 97px">
        <Typography variant="subtitle2">Sites by Alert Level</Typography>
      </Box>
      <Box flexGrow={1} width="100%">
        <Grid
          className={classes.alertsWrapper}
          container
          justifyContent="space-between"
          direction="column"
        >
          {reverse(times(nLevels, Number)).map((level) => {
            const interval = findIntervalByLevel(level);
            return (
              <Grid item key={interval.label}>
                <Grid container alignItems="center">
                  <Grid item>
                    <Box
                      className={classes.alertLabelWrapper}
                      bgcolor={interval.color}
                    >
                      <Typography
                        className={classes.alertLabel}
                        color={
                          level === 3 || level === 4
                            ? 'textPrimary'
                            : 'textSecondary'
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
                          mostFrequentAlert?.length,
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
    alertLabelWrapper: {
      width: 77,
      height: 22,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 20,
    },

    alertLabel: {
      fontWeight: 700,
    },

    alertsWrapper: {
      height: '100%',
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
      [theme.breakpoints.down('xs')]: {
        fontSize: 16,
        paddingLeft: 4,
      },
    },
  });

interface BarChartIncomingProps {
  collection: CollectionDetails;
}

type BarChartProps = BarChartIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(BarChart);
