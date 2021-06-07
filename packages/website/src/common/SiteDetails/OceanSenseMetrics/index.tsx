import React from "react";
import {
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Theme,
  Typography,
  Chip,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

import UpdateInfo from "../../UpdateInfo";
import { ReactComponent as AcidityIcon } from "../../../assets/acidity.svg";
import { ReactComponent as ConductivityIcon } from "../../../assets/conductivuty.svg";
import { ReactComponent as PressureIcon } from "../../../assets/pressure.svg";
import { ReactComponent as DissolvedOxygenIcon } from "../../../assets/dissolved_oxygen.svg";
import { ReactComponent as OrpIcon } from "../../../assets/orp.svg";

interface Metric {
  label: string;
  value: number;
  measure: string;
  icon: JSX.Element;
}

// TODO: Make this a function and pass real metrics values
const metrics: Metric[] = [
  {
    label: "ACIDITY",
    value: 8.1,
    measure: "pH",
    icon: <AcidityIcon />,
  },
  {
    label: "CUNDUCTIVITY",
    value: 83.17,
    measure: "\u00B5S",
    icon: <ConductivityIcon />,
  },
  {
    label: "PRESSURE",
    value: 10.2,
    measure: "dbar",
    icon: <PressureIcon />,
  },
  {
    label: "DISSOLVED OXYGEN",
    value: 9.03,
    measure: "mg/L",
    icon: <DissolvedOxygenIcon />,
  },
  {
    label: "ORP",
    value: 173,
    measure: "mV",
    icon: <OrpIcon />,
  },
];

const OceanSenseMetrics = ({ classes }: OceanSenseMetricsProps) => {
  return (
    <>
      <Box className={classes.root}>
        <Grid container justify="space-between" alignItems="center" spacing={2}>
          {metrics.map((item) => (
            <Grid item key={item.label}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>{item.icon}</Grid>
                <Grid item>
                  <Typography variant="caption">{item.label}</Typography>
                  <Typography className={classes.blueText} variant="h3">
                    {item.value}
                  </Typography>
                  <Chip className={classes.chip} label={item.measure} />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Grid container>
        <Grid item xs={10} sm={6} md={3}>
          <UpdateInfo
            timeText="Last data received"
            relativeTime="1 hour ago"
            imageText="VIEWBLUE"
            image={null}
            live={false}
            frequency="hourly"
          />
        </Grid>
        <Grid item className={classes.triangle} />
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(2),
      borderRadius: "4px 4px 4px 0",
      border: `1px solid ${grey[300]}`,
      padding: theme.spacing(2),
    },

    triangle: {
      width: 0,
      height: 0,
      borderStyle: "solid",
      borderWidth: "40px 40px 0 0",
      borderColor: "#c4c4c4 transparent transparent transparent",
    },

    blueText: {
      color: theme.palette.primary.main,
    },

    chip: {
      fontSize: 10,
      color: grey[600],
      height: "unset",
    },
  });

interface OceanSenseMetricsIncomingProps {}

type OceanSenseMetricsProps = OceanSenseMetricsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(OceanSenseMetrics);
