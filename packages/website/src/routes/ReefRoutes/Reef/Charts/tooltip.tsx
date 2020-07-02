import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Box,
  Typography,
} from "@material-ui/core";

const Tooltip = ({ classes }: ChartsProps) => (
  <Card className={classes.tooltip}>
    <CardHeader
      style={{ flex: "0 1 auto", padding: "0.5rem 2rem 0.5rem 2rem" }}
      title={
        <Grid
          alignItems="center"
          justify="space-between"
          item
          container
          xs={12}
        >
          <Grid item>
            <Typography color="textPrimary" variant="caption">
              05/19/20
            </Typography>
          </Grid>
          <Grid item>
            <Typography color="textPrimary" variant="caption">
              8:15AM
            </Typography>
          </Grid>
        </Grid>
      }
    />
    <CardContent
      style={{ flex: "1 1 auto", padding: "0.5rem 2rem 0.5rem 2rem" }}
    >
      <Grid
        style={{ height: "100%" }}
        item
        container
        direction="row"
        justify="space-between"
      >
        <Grid
          container
          justify="space-between"
          alignItems="center"
          item
          xs={12}
        >
          <Grid container justify="flex-start" item xs={6}>
            <Typography variant="caption">TEMP AT 25M</Typography>
            <Typography variant="h5">60 &#8451;</Typography>
          </Grid>
          <Grid container justify="flex-end" item xs={6}>
            <Typography variant="caption">SURFACE TEMP</Typography>
            <Typography variant="h5">31.4 &#8451;</Typography>
          </Grid>
        </Grid>
        <Grid container direction="column" item xs={12}>
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
              <Typography variant="h5">230&#176;</Typography>
            </Box>
          </Typography>
        </Grid>
        <Grid container direction="column" item xs={12}>
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
              <Typography variant="h5">25 &#176;</Typography>
            </Box>
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const styles = () =>
  createStyles({
    tooltip: {
      height: "25vh",
      width: "26vh",
      display: "flex",
      flexFlow: "column",
      backgroundColor: "#404b6b",
      opacity: 0.9,
    },
  });

type ChartsProps = WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
