import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { LatestDataASSofarValue } from 'store/Sites/types';
import { formatNumber } from 'helpers/numberUtils';
import { toRelativeTime } from 'helpers/dates';
import bubbles from '../../../assets/bubbles.svg';
import { styles as incomingStyles } from '../styles';
import UpdateInfo from '../../UpdateInfo';

const DISSOLVED_OXYGEN_CARD_COLOR = '#0b6e8a';
const GOOD_QUALITY_COLOR = '#4caf50';
const BAD_QUALITY_COLOR = '#f44336';
const QUALITY_THRESHOLD = 0.7;
const QUALITY_TOOLTIP =
  'DO sensor quality: a self-check score from the sensor. 0.7 or higher is Good, below 0.7 is Bad.';

function DissolvedOxygenCard({ data, classes }: DissolvedOxygenCardProps) {
  const { odoConcentration, odoSaturation, odoQuality } = data;

  const timestamp = odoSaturation?.timestamp || odoConcentration?.timestamp;
  const relativeTime = timestamp && toRelativeTime(timestamp);

  const hasQuality = typeof odoQuality?.value === 'number';
  const isGoodQuality = (odoQuality?.value ?? 0) >= QUALITY_THRESHOLD;

  const metrics = [
    {
      label: 'CONCENTRATION',
      value: formatNumber(odoConcentration?.value, 2),
      unit: 'mg/L',
    },
    {
      label: 'SATURATION',
      value: formatNumber(odoSaturation?.value, 1),
      unit: '%',
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
                DISSOLVED OXYGEN
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent className={classes.content}>
        <Box className={classes.body}>
          <Box className={classes.metrics}>
            {metrics.map(({ label, value, unit }) => (
              <Box
                key={label}
                style={{ opacity: hasQuality && !isGoodQuality ? 0.6 : 1 }}
              >
                <Typography
                  className={classes.contentTextTitles}
                  variant="subtitle2"
                >
                  {label}
                </Typography>
                <Box className={classes.valueRow}>
                  <Typography
                    className={classes.contentTextValues}
                    variant="h3"
                  >
                    {value}
                  </Typography>
                  <Typography className={classes.contentUnits} variant="h6">
                    {unit}
                  </Typography>
                </Box>
              </Box>
            ))}
            {hasQuality && (
              <Tooltip title={QUALITY_TOOLTIP} placement="top" arrow>
                <Box className={classes.quality}>
                  <Typography
                    className={classes.contentTextTitles}
                    variant="subtitle2"
                  >
                    QUALITY
                  </Typography>
                  <Box className={classes.qualityValue}>
                    <Typography variant="h6">
                      {isGoodQuality ? 'Good' : 'Bad'} (
                      {formatNumber(odoQuality?.value, 2)})
                    </Typography>
                    {isGoodQuality ? (
                      <CheckIcon className={classes.goodIcon} />
                    ) : (
                      <CloseIcon className={classes.badIcon} />
                    )}
                  </Box>
                </Box>
              </Tooltip>
            )}
          </Box>
          <img
            className={classes.image}
            alt="bubbles"
            src={bubbles}
            height="150"
            width="auto"
          />
        </Box>
        <UpdateInfo
          relativeTime={relativeTime}
          timeText="Last data received"
          live
          frequency="hourly"
        />
      </CardContent>
    </Card>
  );
}

const styles = () =>
  createStyles({
    ...incomingStyles,
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: DISSOLVED_OXYGEN_CARD_COLOR,
      color: 'white',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexGrow: 1,
      padding: 0,
    },
    body: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '1rem',
      flexGrow: 1,
    },
    metrics: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '1rem',
    },
    valueRow: {
      display: 'flex',
      alignItems: 'flex-end',
    },
    quality: {
      width: 'fit-content',
      cursor: 'help',
    },
    qualityValue: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap',
    },
    goodIcon: {
      color: GOOD_QUALITY_COLOR,
    },
    badIcon: {
      color: BAD_QUALITY_COLOR,
    },
    image: {
      alignSelf: 'center',
    },
  });

interface DissolvedOxygenCardIncomingProps {
  data: LatestDataASSofarValue;
}

type DissolvedOxygenCardProps = WithStyles<typeof styles> &
  DissolvedOxygenCardIncomingProps;

export default withStyles(styles)(DissolvedOxygenCard);
