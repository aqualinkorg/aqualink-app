import React from 'react';
import {
  Grid,
  Box,
  Theme,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { grey } from '@mui/material/colors';
import { useSelector } from 'react-redux';
import { last } from 'lodash';

import {
  siteLatestOceanSenseDataLoadingSelector,
  siteLatestOceanSenseDataSelector,
} from 'store/Sites/selectedSiteSlice';
import { OceanSenseData, OceanSenseKeys } from 'store/Sites/types';
import { formatNumber } from 'helpers/numberUtils';
import { toRelativeTime } from 'helpers/dates';
import UpdateInfo from '../../UpdateInfo';
import AcidityIcon  from 'assets/acidity.svg';
import ConductivityIcon  from 'assets/conductivuty.svg';
import PressureIcon from 'assets/pressure.svg';
import DissolvedOxygenIcon  from 'assets/dissolved_oxygen.svg';
import OrpIcon  from 'assets/orp.svg';

interface Metric {
  label: string;
  value: string;
  measure: string;
  icon: JSX.Element;
}

const metrics = (data?: OceanSenseData): Record<OceanSenseKeys, Metric> => ({
  PH: {
    label: 'ACIDITY',
    value: formatNumber(last(data?.PH)?.value, 2),
    measure: 'pH',
    icon: <AcidityIcon />,
  },
  EC: {
    label: 'CONDUCTIVITY',
    value: formatNumber(last(data?.EC)?.value, 2),
    measure: '\u00B5S',
    icon: <ConductivityIcon />,
  },
  PRESS: {
    label: 'PRESSURE',
    value: formatNumber(last(data?.PRESS)?.value, 2),
    measure: 'dbar',
    icon: <PressureIcon />,
  },
  DO: {
    label: 'DISSOLVED OXYGEN',
    value: formatNumber(last(data?.DO)?.value, 2),
    measure: 'mg/L',
    icon: <DissolvedOxygenIcon />,
  },
  ORP: {
    label: 'ORP',
    value: formatNumber(last(data?.ORP)?.value, 2),
    measure: 'mV',
    icon: <OrpIcon />,
  },
});

const OceanSenseMetrics = ({ classes }: OceanSenseMetricsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.up('md'));
  const data = useSelector(siteLatestOceanSenseDataSelector);
  const loading = useSelector(siteLatestOceanSenseDataLoadingSelector);

  const lastTimestamp = last(data?.PH)?.timestamp;
  const relativeTime = lastTimestamp
    ? toRelativeTime(lastTimestamp)
    : undefined;

  return (
    <>
      <Box className={classes.root}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {Object.values(metrics(data)).map((item) => (
            <Grid
              item
              xs={isMobile ? 12 : undefined}
              sm={isTablet ? undefined : 5}
              key={item.label}
            >
              <Grid
                className={classes.cardItem}
                container
                alignItems="center"
                spacing={2}
              >
                <Grid item>{item.icon}</Grid>
                <Grid item>
                  <Typography display="block" variant="caption">
                    {item.label}
                  </Typography>
                  {loading ? (
                    <Box py={0.5}>
                      <CircularProgress size={22} thickness={2} />
                    </Box>
                  ) : (
                    <Typography className={classes.blueText} variant="h3">
                      {item.value}
                    </Typography>
                  )}
                  <Chip className={classes.chip} label={item.measure} />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Grid container>
        <Grid item xs={12} sm={6} md={3}>
          <UpdateInfo
            timeText="Last data received"
            relativeTime={relativeTime}
            imageText="VIEWBLUE"
            live={false}
            frequency="hourly"
          />
        </Grid>
        {!isMobile && <Grid item className={classes.triangle} />}
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(2),
      borderRadius: '4px 4px 4px 0',
      border: `1px solid ${grey[300]}`,
      padding: theme.spacing(2),
    },

    triangle: {
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '40px 40px 0 0',
      borderColor: `${grey[400]} transparent transparent transparent`,
    },

    cardItem: {
      width: 'auto',
    },

    blueText: {
      color: theme.palette.primary.main,
    },

    chip: {
      display: 'table',
      fontSize: 10,
      color: grey[600],
      height: 'unset',
    },

    skeletonAnimation: {
      backgroundColor: grey[200],
      borderRadius: 10,
    },
  });

interface OceanSenseMetricsIncomingProps {}

type OceanSenseMetricsProps = OceanSenseMetricsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(OceanSenseMetrics);
