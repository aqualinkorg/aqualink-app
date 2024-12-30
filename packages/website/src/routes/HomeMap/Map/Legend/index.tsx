import React from 'react';
import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import classNames from 'classnames';

import CustomLegend from 'common/Legend';
import {
  dhwColorCode,
  surfaceTempColorCode,
  sstAnomalyColorCode,
} from '../../../../assets/colorCode';

const legends = [
  {
    name: 'Sea Surface Temperature',
    element: <CustomLegend unit="°C" colorCode={surfaceTempColorCode} />,
  },
  {
    name: 'Heat Stress',
    element: <CustomLegend unit="DHW" colorCode={dhwColorCode} />,
  },
  {
    name: 'SST Anomaly',
    element: <CustomLegend unit="°C" colorCode={sstAnomalyColorCode} />,
  },
];

const Legend = ({ legendName, bottom, left, classes }: LegendProps) => {
  const legend = legends.find((item) => item.name === legendName);
  return (
    <div
      style={{ bottom, left }}
      className={classNames(classes.root, {
        [classes.defaultPosition]: !bottom && !left,
      })}
    >
      {legend?.element}
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      zIndex: 401,
      position: 'absolute',
    },

    defaultPosition: {
      bottom: 40,
      left: 10,
      [theme.breakpoints.down('lg')]: {
        bottom: 80,
      },
      [theme.breakpoints.down('sm')]: {
        bottom: 110,
      },
    },
  });

interface LegendIncomingProps {
  legendName: string;
  bottom?: number;
  left?: number;
}

type LegendProps = LegendIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Legend);
