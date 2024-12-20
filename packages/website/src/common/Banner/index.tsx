import { Theme, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import React from 'react';

function Banner({ message, classes }: BannerProps) {
  return (
    <div className={classes.banner}>
      <Typography variant="h6" className={classes.text}>
        {message}
      </Typography>
    </div>
  );
}

interface BannerIncomingProps {
  message: string;
}

interface BannerProps extends BannerIncomingProps, WithStyles<typeof styles> {}

const styles = (theme: Theme) =>
  createStyles({
    banner: {
      backgroundColor: theme.palette.warning.dark,
      minHeight: '4rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: theme.palette.text.primary,
    },
  });

export default withStyles(styles)(Banner);
