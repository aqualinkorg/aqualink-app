import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

const GradientLegend = ({ colorCode, classes }: GradientLegendProps) => {
  const gradientColors = colorCode.map((item) => item.color).join(", ");

  return (
    <div
      className={classes.root}
      style={{ background: `linear-gradient(to right, ${gradientColors})` }}
    >
      {colorCode.map((item, index) => (
        <div
          key={item.color}
          className={`${classes.codeItem} ${
            // eslint-disable-next-line no-nested-ternary
            index === 0
              ? classes.firstChild
              : index === colorCode.length - 1
              ? classes.lastChild
              : ""
          }`}
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
      width: "1.3rem",
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

interface ColorItem {
  color: string;
  value: number;
}

interface GradientLegendIncomingProps {
  colorCode: ColorItem[];
}

type GradientLegendProps = GradientLegendIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(GradientLegend);
