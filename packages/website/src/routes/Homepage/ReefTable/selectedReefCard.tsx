import React from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  CardMedia,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";

import CardChart from "./cardChart";
import { Reef } from "../../../store/Reefs/types";

const reefImage = require("../../../assets/reef-image.png");

const SelectedReefCard = ({ classes, reef }: SelectedReefCardProps) => {
  return (
    <div className={classes.root}>
      <Typography
        style={{ margin: "0 0 0.5rem 1.5rem" }}
        variant="h5"
        color="textSecondary"
      >
        Featured Reef
      </Typography>
      <Grid container justify="center">
        <Paper elevation={3} className={classes.selectedReef}>
          <Grid className={classes.card} container item xs={12}>
            <Grid item xs={4}>
              <CardMedia className={classes.cardImage} image={reefImage} />
            </Grid>
            <Grid container item xs={6}>
              <Grid item xs={12}>
                <Typography
                  style={{ padding: "0.5rem 0 0 0.5rem" }}
                  color="textSecondary"
                  variant="h5"
                >
                  Kealakekua Bay Reef
                </Typography>
                <Typography
                  style={{ padding: "0 0 0.5rem 0.5rem", fontWeight: 400 }}
                  color="textSecondary"
                  variant="h6"
                >
                  Kahaluu-eauhou, HI
                </Typography>
              </Grid>
              {reef &&
                reef.dailyData &&
                reef.dailyData.length > 0 &&
                reef.temperatureThreshold && (
                  <Grid item xs={12}>
                    <Typography
                      style={{ padding: "0 0 0.5rem 0.5rem", fontWeight: 400 }}
                      color="textSecondary"
                      variant="subtitle1"
                    >
                      MEAN DAILY WATER TEMPERATURE AT 25M (C°)
                    </Typography>
                    <CardChart
                      dailyData={reef.dailyData}
                      temperatureThreshold={reef.temperatureThreshold}
                    />
                  </Grid>
                )}
            </Grid>
            <Grid
              style={{ paddingLeft: "2rem" }}
              container
              direction="row"
              alignItems="center"
              item
              xs={2}
            >
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  TEMP AT 25M
                </Typography>
                <Typography
                  className={classes.cardMetrics}
                  variant="h4"
                  color="textSecondary"
                >
                  29.5&#8451;
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  SURFACE TEMP
                </Typography>
                <Typography
                  className={classes.cardMetrics}
                  variant="h4"
                  color="textSecondary"
                >
                  31.8&#8451;
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  DEG. HEAT. DAYS
                </Typography>
                <Typography
                  className={classes.cardMetrics}
                  variant="h4"
                  color="textSecondary"
                >
                  14
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button size="small" variant="contained" color="primary">
                  EXPLORE
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: "1rem",
    },
    selectedReef: {
      width: "48vw",
      height: "28vh",
    },
    card: {
      height: "100%",
    },
    cardImage: {
      borderRadius: "4px 0 0 4px",
      height: "100%",
    },
    cardMetrics: {
      color: theme.palette.primary.main,
    },
  });

interface selectedReefCardIncomingProps {
  reef?: Reef;
}

type SelectedReefCardProps = selectedReefCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SelectedReefCard);
