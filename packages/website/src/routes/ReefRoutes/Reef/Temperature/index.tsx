import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardContent,
  Typography,
  Box,
  CardHeader,
  Grid,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

const Temperature = ({ classes }: TemperatureProps) => (
  <Card className={classes.card}>
    <CardHeader
      className={classes.header}
      title={
        <div className={classes.title}>
          <Typography variant="h6">CURRENT CONDITIONS</Typography>
          <Typography style={{ marginLeft: 8 }} variant="subtitle2">
            (05/12/20 8:16AM PST)
          </Typography>
        </div>
      }
    />
    <CardContent className={classes.content}>
      <Grid
        style={{ height: "100%", padding: "0 32px 0 32px" }}
        item
        xs={12}
        container
        direction="row"
        justify="flex-end"
        alignItems="flex-start"
      >
        <Grid
          item
          xs={12}
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid
            item
            xs={6}
            container
            direction="column"
            alignItems="flex-start"
          >
            <Typography variant="caption">TEMP AT 25M</Typography>
            <Typography variant="h2">31.4 &#8451;</Typography>
          </Grid>
          <Grid
            item
            xs={6}
            container
            direction="column"
            alignItems="flex-start"
            justify="space-between"
          >
            <Typography variant="caption">SURFACE TEMP</Typography>
            <Typography gutterBottom variant="h5">
              32 &#8451;
            </Typography>
            <Typography variant="caption">WIND</Typography>
            <Typography
              style={{ display: "flex", alignItems: "baseline" }}
              component="div"
            >
              <Box>
                <Typography variant="h5">7</Typography>
              </Box>
              <Box ml={0}>
                <Typography variant="subtitle2">kph</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="caption">FROM</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">223 &#176;</Typography>
              </Box>
            </Typography>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid
            item
            xs={6}
            container
            direction="column"
            alignItems="flex-start"
          >
            <Alert
              className={classes.alert}
              variant="filled"
              severity="warning"
            >
              <Typography variant="caption">ALERT LEVEL: HIGH</Typography>
            </Alert>
          </Grid>
          <Grid
            item
            xs={6}
            container
            direction="column"
            alignItems="flex-start"
          >
            <Typography variant="caption">WAVES</Typography>
            <Typography
              style={{ display: "flex", alignItems: "baseline" }}
              component="div"
            >
              <Box>
                <Typography variant="h5">0.5</Typography>
              </Box>
              <Box ml={0}>
                <Typography variant="subtitle2">m</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="caption">AT</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">15</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="subtitle2">S</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="overline">FROM</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography style={{ marginLeft: 4 }} variant="h5">
                  25 &#8451;
                </Typography>
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const styles = () =>
  createStyles({
    card: {
      height: "100%",
      width: "100%",
      backgroundColor: "#128cc0",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      display: "flex",
      padding: "10px 32px 10px 32px",
    },
    title: {
      display: "flex",
      alignItems: "center",
    },
    content: {
      height: "100%",
      width: "100%",
      padding: 0,
      marginTop: "2rem",
    },
    alert: {
      height: 23,
      display: "flex",
      alignItems: "center",
    },
  });

interface TemperatureProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(Temperature);
