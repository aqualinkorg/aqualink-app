import React from "react";
import { withStyles, WithStyles, createStyles, Theme } from "@material-ui/core";

import HeatStressLegend from "./heatStressLegend";
import SeaSurfaceTemperatureLegend from "./seaSurfaceLegend";

const legends = [
  {
    name: "Sea Surface Temperature",
    element: <SeaSurfaceTemperatureLegend />,
  },
  {
    name: "Heat Stress",
    element: <HeatStressLegend />,
  },
];

const Legend = ({ legendName, classes }: LegendProps) => {
  const legend = legends.find((item) => item.name === legendName);
  return <div className={classes.root}>{legend?.element}</div>;
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      zIndex: 401,
      position: "absolute",
      bottom: 0,
      left: 0,
      margin: "0 0 8px 8px",
      [theme.breakpoints.down("xs")]: {
        marginBottom: 64,
      },
    },
  });

interface LegendIncomingProps {
  legendName: string;
}

type LegendProps = LegendIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Legend);
