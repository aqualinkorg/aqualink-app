import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

const Legend = ({ colorCode, image, classes }: LegendProps) => {
  const gradientColors = colorCode.map((item) => item.color).join(", ");

  if (image) {
    return <img src={image} alt="surface-temperature-legend" />;
  }

  return (
    <div
      className={classes.root}
      style={{ background: `linear-gradient(to right, ${gradientColors})` }}
    >
      {colorCode.map((item) => (
        <div key={item.color} className={classes.codeItem}>
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
  });

interface ColorItem {
  color: string;
  value: number;
}

interface LegendIncomingProps {
  colorCode: ColorItem[];
  image?: string | null;
}

Legend.defaultProps = {
  image: null,
};

type LegendProps = LegendIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Legend);
