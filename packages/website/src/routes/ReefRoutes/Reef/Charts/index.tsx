import React from "react";
import {
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import type { Data } from "../../../../store/Reefs/types";
import "../../../../helpers/backgroundPlugin";
import "../../../../helpers/fillPlugin";
import "../../../../helpers/slicePlugin";
import "chartjs-plugin-annotation";
import Chart from "../../../../common/Chart";

const Charts = ({ classes, temperatureThreshold, ...rest }: ChartsProps) => {
  return (
    <Chart
      {...rest}
      className={classes.root}
      temperatureThreshold={temperatureThreshold}
      chartAnnotations={[
        {
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: temperatureThreshold,
          borderColor: "#ff8d00",
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            backgroundColor: "rgb(169,169,169)",
            enabled: false,
            position: "left",
            xAdjust: 10,
            content: "Bleaching Threshold",
          },
        },
      ]}
    >
      <Typography className={classes.graphTitle} variant="h6">
        DAILY WATER TEMPERATURE (°C)
      </Typography>
    </Chart>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: "16rem",
    },
    graphTitle: {
      lineHeight: 1.5,
      marginLeft: "4rem",

      [theme.breakpoints.down("xs")]: {
        marginLeft: 0,
      },
    },
  });

interface ChartsIncomingProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
  depth: number | null;
}

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
