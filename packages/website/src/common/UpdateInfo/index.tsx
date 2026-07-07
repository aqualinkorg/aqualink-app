import React from 'react';
import { Theme, Grid, Box, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { grey } from '@mui/material/colors';
import UpdateIcon from '@mui/icons-material/Update';
import Chip from '../Chip';

const UPDATE_ICON_SIZE = 24;
const UPDATE_ICON_RIGHT_MARGIN = 4;

const useStyles = makeStyles((theme: Theme) => ({
  updateInfo: {
    backgroundColor: grey[400],
    color: grey[700],
    padding: 4,
    minHeight: 40,
    flexWrap: 'nowrap',
  },
  withMargin: {
    marginTop: 32,
  },
  updateIcon: {
    marginRight: UPDATE_ICON_RIGHT_MARGIN,
    height: UPDATE_ICON_SIZE,
    width: UPDATE_ICON_SIZE,
  },
  updateInfoText: {
    width: '99%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: 8.5,
    },
  },
  dateInfoWrapper: {
    flex: '1 1 auto',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  dateInfo: {
    width: `calc(100% - ${UPDATE_ICON_RIGHT_MARGIN + UPDATE_ICON_SIZE}px)`,
  },
  chipsWrapper: {
    display: 'flex',
    gap: 4,
    flexShrink: 0,
  },
}));

function UpdateInfo({
  relativeTime,
  timeText,
  image,
  imageText,
  live = false,
  frequency,
  href,
  withMargin = false,
  chipWidth,
  subtitle,
  onClick,
  secondaryImage,
  secondaryImageText,
  secondaryLive = false,
  secondaryHref,
  secondaryOnClick,
}: UpdateInfoProps) {
  const classes = useStyles({ chipWidth });
  const hasSecondaryChip = Boolean(secondaryImageText || secondaryImage);
  return (
    <Grid
      className={`${classes.updateInfo} ${withMargin && classes.withMargin}`}
      container
      justifyContent="space-between"
      alignItems="center"
      item
    >
      <Grid item className={classes.dateInfoWrapper}>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item>
            <UpdateIcon className={classes.updateIcon} fontSize="small" />
          </Grid>
          <Grid item className={classes.dateInfo}>
            <Box display="flex" flexDirection="column" width="100%">
              <Typography className={classes.updateInfoText} variant="caption">
                {relativeTime
                  ? `${timeText} ${relativeTime}`
                  : 'No data available'}
              </Typography>
              <Typography
                title={subtitle}
                className={classes.updateInfoText}
                variant="caption"
              >
                {frequency ? `Updated ${frequency}` : subtitle}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.chipsWrapper}>
        <Chip
          live={live}
          href={live ? undefined : href}
          image={image}
          imageText={imageText}
          onClick={onClick}
        />
        {hasSecondaryChip && (
          <Chip
            live={secondaryLive}
            href={secondaryLive ? undefined : secondaryHref}
            image={secondaryImage}
            imageText={secondaryImageText}
            onClick={secondaryOnClick}
          />
        )}
      </Grid>
    </Grid>
  );
}

interface UpdateInfoProps {
  relativeTime?: string;
  timeText: string;
  image?: string;
  imageText?: string;
  live?: boolean;
  frequency?: 'hourly' | 'daily' | 'every 6 hours';
  subtitle?: string;
  href?: string;
  withMargin?: boolean;
  chipWidth?: number;
  onClick?: () => void;
  secondaryImage?: string;
  secondaryImageText?: string;
  secondaryLive?: boolean;
  secondaryHref?: string;
  secondaryOnClick?: () => void;
}

export default UpdateInfo;
