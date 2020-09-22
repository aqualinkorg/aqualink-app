import React from "react";
import { withStyles, WithStyles, createStyles, Theme } from "@material-ui/core";

import CustomLegend from "../../../../common/Legend";
import { dhwColorCode } from "../../../../assets/colorCode";
import celsiusLegend from "../../../../assets/celsiusLegend.png";

const legends = [
  {
    name: "Sea Surface Temperature",
    element: <CustomLegend colorCode={[]} image={celsiusLegend} />,
  },
  {
    name: "Heat Stress",
    element: <CustomLegend colorCode={dhwColorCode} />,
  },
];

const Legend = ({ legendName, classes }: LegendProps) => {
  const legend = legends.find((item) => item.name === legendName);
  return <div className={classes.root}>{legend?.element}</div>;
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
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
