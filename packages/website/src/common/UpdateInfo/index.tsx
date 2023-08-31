import React from 'react';
import { Theme, Grid, Box, Typography, makeStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import UpdateIcon from '@material-ui/icons/Update';
import Chip from '../Chip';

const CHIP_SMALL_DEFAULT_WIDTH = 48;
const CHIP_LARGE_DEFAULT_WIDTH = 60;
const UPDATE_ICON_SIZE = 24;
const UPDATE_ICON_RIGHT_MARGIN = 4;

const UpdateInfo = ({
  relativeTime,
  timeText,
  image,
  imageText,
  live,
  frequency,
  href,
  withMargin,
  chipWidth,
  subtitle,
  onClick,
}: UpdateInfoProps) => {
  const classes = useStyles({ chipWidth });
  return (
    <Grid
      className={`${classes.updateInfo} ${withMargin && classes.withMargin}`}
      container
      justifyContent="space-between"
      alignItems="center"
      item
    >
      <Grid item className={classes.dateInfoWrapper} xs={8}>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item>
            <UpdateIcon className={classes.updateIcon} fontSize="small" />
          </Grid>
          <Grid item className={classes.dateInfo}>
            <Box display="flex" flexDirection="column" width="100%">
              {relativeTime && (
                <Typography
                  className={classes.updateInfoText}
                  variant="caption"
                >
                  {timeText} {relativeTime}
                </Typography>
              )}
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
      <Grid item xs={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Chip
          live={live}
          href={live ? undefined : href}
          image={image}
          imageText={imageText}
          onClick={onClick}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  updateInfo: {
    backgroundColor: grey[400],
    color: grey[700],
    padding: 4,
    minHeight: 40,
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
    [theme.breakpoints.between('md', 'md')]: {
      fontSize: 8.5,
    },
  },
  dateInfoWrapper: ({ chipWidth }: { chipWidth?: number }) => ({
    width: `calc(100% - ${chipWidth || CHIP_LARGE_DEFAULT_WIDTH}px)`,
    [theme.breakpoints.only('md')]: {
      width: `calc(100% - ${chipWidth || CHIP_SMALL_DEFAULT_WIDTH}px)`,
    },
    display: 'flex',
    justifyContent: 'flex-start',
  }),
  dateInfo: {
    width: `calc(100% - ${UPDATE_ICON_RIGHT_MARGIN + UPDATE_ICON_SIZE}px)`,
  },
}));

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
}

UpdateInfo.defaultProps = {
  relativeTime: undefined,
  image: undefined,
  imageText: undefined,
  frequency: undefined,
  subtitle: undefined,
  href: undefined,
  withMargin: false,
  live: false,
  chipWidth: undefined,
  onClick: undefined,
};

export default UpdateInfo;
