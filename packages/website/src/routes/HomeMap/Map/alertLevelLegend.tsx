import React from 'react';
import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { alertLevelColorCode } from '../../../assets/colorCode';

const AlertLevelLegendItems = ({ classes }: AlertLevelLegendItemsProps) => {
  return (
    <>
      {alertLevelColorCode.map((item, index) => (
        <div
          key={item.value}
          style={{ backgroundColor: item.color }}
          className={
            index === alertLevelColorCode.length - 1
              ? `${classes.legendItem} ${classes.lastChild}`
              : `${classes.legendItem}`
          }
        >
          {item.value}
        </div>
      ))}
    </>
  );
};

const contentStyles = (theme: Theme) =>
  createStyles({
    legendItem: {
      color: 'white',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      minWidth: '4rem',
      marginRight: '0.5rem',
      [theme.breakpoints.down('sm')]: {
        fontWeight: 400,
        minWidth: '3rem',
      },
    },
    lastChild: {
      margin: 0,
    },
  });

type AlertLevelLegendItemsProps = WithStyles<typeof contentStyles>;

export const AlertLevelLegendContent = withStyles(contentStyles)(
  AlertLevelLegendItems,
);

const AlertLevelLegend = ({ classes }: AlertLevelLegendProps) => {
  return (
    <div className={classes.root}>
      <AlertLevelLegendContent />
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      zIndex: 401,
      position: 'absolute',
      bottom: 40,
      right: 10,
      display: 'flex',
      [theme.breakpoints.down('lg')]: {
        left: 10,
      },
      [theme.breakpoints.down('sm')]: {
        bottom: 80,
      },
    },
  });

type AlertLevelLegendProps = WithStyles<typeof styles>;

export default withStyles(styles)(AlertLevelLegend);
