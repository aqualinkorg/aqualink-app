import React from 'react';
import { Box, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { colors, ibmPlexMonoFontFamily } from 'layout/App/theme';

function Card({ title, text, tag, icon: Icon, classes }: CardProps) {
  return (
    <Box className={classes.card}>
      <Icon aria-hidden="true" />
      <Typography variant="h3" className={classes.title}>
        {title}
      </Typography>
      <Typography className={classes.text}>{text}</Typography>
      <Typography className={classes.tag}>{tag}</Typography>
    </Box>
  );
}

const styles = () =>
  createStyles({
    card: {
      background: colors.mistGray,
      borderRadius: 14,
      padding: 32,
    },
    title: {
      margin: '20px 0 0',
      fontFamily: 'inherit',
      fontSize: 22,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    text: {
      margin: '10px 0 0',
      fontFamily: 'inherit',
      fontSize: 17,
      lineHeight: 1.55,
      letterSpacing: 'normal',
      color: colors.slateGray,
    },
    tag: {
      margin: '16px 0 0',
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 13,
      lineHeight: 'normal',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: colors.oceanBlue,
    },
  });

export interface CardIncomingProps {
  title: string;
  text: string;
  tag: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

type CardProps = CardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Card);
