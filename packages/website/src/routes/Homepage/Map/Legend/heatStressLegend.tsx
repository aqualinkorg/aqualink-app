import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import { dhwColorCode } from "../../../../assets/colorCode";

const HeatStressLegend = ({ classes }: HeatStressLegendProps) => {
  return (
    <div className={classes.root}>
      {dhwColorCode.map((item, index) => (
        <div
          key={item.color}
          className={`${classes.codeItem} ${
            // eslint-disable-next-line no-nested-ternary
            index === 0
              ? classes.firstChild
              : index === dhwColorCode.length - 1
              ? classes.lastChild
              : ""
          }`}
          style={{ backgroundColor: item.color }}
        >
          {item.value}
        </div>
      ))}
    </div>
  );
};

const styles = () =>
  createStyles({
    root: {
      display: "flex",
      borderRadius: 4,
    },
    codeItem: {
      display: "flex",
      fontSize: 9,
      width: "1.2rem",
      height: 17,
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    },
    firstChild: {
      borderRadius: "4px 0 0 4px",
    },
    lastChild: {
      borderRadius: "0 4px 4px 0",
    },
  });

type HeatStressLegendProps = WithStyles<typeof styles>;

export default withStyles(styles)(HeatStressLegend);
