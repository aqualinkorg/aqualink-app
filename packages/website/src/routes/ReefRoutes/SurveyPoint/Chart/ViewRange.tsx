import React from "react";
import {
  Grid,
  Box,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
  Button,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";

const ViewRange = ({ classes }: ViewRangeProps) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <>
      <Grid
        className={classes.autoWidth}
        container
        alignItems="center"
        justify="space-between"
        spacing={2}
      >
        <Grid item>
          <Box ml={isMobile ? "0px" : "27px"}>
            <Typography variant="h6" color="textSecondary">
              TEMPERATURE
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={isMobile ? 12 : undefined}>
          <Box ml={isTablet && !isMobile ? "27px" : "0px"}>
            <Grid
              className={classes.autoWidth}
              container
              justify={isMobile ? "center" : "flex-start"}
              alignItems="center"
              spacing={2}
            >
              <Grid item xs={isMobile ? 10 : undefined}>
                <Typography variant="subtitle1" color="textSecondary">
                  View Range:
                </Typography>
              </Grid>
              <Grid item xs={isMobile ? 10 : undefined}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  <Typography variant="subtitle1">3 Months</Typography>
                </Button>
              </Grid>
              <Grid item xs={isMobile ? 10 : undefined}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  <Typography variant="subtitle1">1 Year</Typography>
                </Button>
              </Grid>
              <Grid item xs={isMobile ? 10 : undefined}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  <Typography variant="subtitle1">Max</Typography>
                </Button>
              </Grid>
              <Grid item xs={isMobile ? 10 : undefined}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  <Typography variant="subtitle1">Custom</Typography>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

const styles = () =>
  createStyles({
    autoWidth: {
      width: "auto",
    },
  });

interface ViewRangeIncomingProps {}

type ViewRangeProps = ViewRangeIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ViewRange);
