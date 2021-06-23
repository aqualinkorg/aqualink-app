import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
} from "@material-ui/core";

import { Value } from "./types";

const Title = ({ classes, values }: TitleProps) => {
  return (
    <Box className={classes.root}>
      <Grid container alignItems="baseline">
        {values.map((item) => (
          <Grid style={{ marginRight: item.marginRight }} key={item.text} item>
            <Typography variant={item.variant}>{item.text}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const styles = () =>
  createStyles({
    root: {
      margin: "0 0 0.2rem 1rem",
    },
  });

interface TitleIncomingProps {
  values: Value[];
}

type TitleProps = TitleIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Title);
