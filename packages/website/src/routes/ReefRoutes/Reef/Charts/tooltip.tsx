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

const Tooltip = ({ data, classes }: TooltipProps) => {
  const date = new Date(data.date).toLocaleString().replace(/:\d{2}\s/, " ");
  const splitDate = date.split(", ");

  return (
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
                {splitDate[0]}
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="textPrimary" variant="caption">
                {splitDate[1]}
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
              <Typography variant="h5">
                {data.bottomTemperature} &#8451;
              </Typography>
            </Grid>
            <Grid container justify="flex-end" item xs={6}>
              <Typography variant="caption">SURFACE TEMP</Typography>
              <Typography variant="h5">
                {data.surfaceTemperature} &#8451;
              </Typography>
            </Grid>
          </Grid>
          <Grid container direction="column" item xs={12}>
            <Typography variant="caption">WIND</Typography>
            <Typography
              style={{ display: "flex", alignItems: "baseline" }}
              component="div"
            >
              <Box>
                <Typography variant="h5">{data.wind}</Typography>
              </Box>
              <Box ml={0.2}>
                <Typography variant="subtitle2">kph</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="caption">FROM</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">{data.windDirection}&#176;</Typography>
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
                <Typography variant="h5">{data.wave}</Typography>
              </Box>
              <Box ml={0.2}>
                <Typography variant="subtitle2">m</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="caption">AT</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">{data.wavePeriod}</Typography>
              </Box>
              <Box ml={0.2}>
                <Typography variant="subtitle2">s</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="overline">FROM</Typography>
              </Box>
              <Box ml={0.5}>
                <Typography variant="h5">
                  {data.waveDirection} &#176;
                </Typography>
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const styles = () =>
  createStyles({
    tooltip: {
      height: 230,
      width: 240,
      display: "flex",
      flexFlow: "column",
      backgroundColor: "#404b6b",
      opacity: 0.9,
    },
  });

interface TooltipData {
  data: {
    date: string;
    bottomTemperature: number;
    surfaceTemperature: number;
    wind: number;
    windDirection: number;
    wave: number;
    wavePeriod: number;
    waveDirection: number;
  };
}

type TooltipProps = TooltipData & WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
