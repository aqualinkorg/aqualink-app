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
  const date = new Date(`${data.date} 2020`);

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
                {date.toLocaleDateString("en-US")}
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="textPrimary" variant="caption">
                12:00AM
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
                {`${data.temperature}`} &#8451;
              </Typography>
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
                <Typography variant="h5">{data.wind}</Typography>
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
                <Typography variant="h5">{data.wave}</Typography>
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
};

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

interface TooltipData {
  data: {
    date: string;
    temperature: number;
    wind: number;
    wave: number;
  };
}

type TooltipProps = TooltipData & WithStyles<typeof styles>;

export default withStyles(styles)(Tooltip);
