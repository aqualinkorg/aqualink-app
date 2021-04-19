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
  Tooltip,
} from "@material-ui/core";
import moment from "moment";
import { RangeButton, RangeValue } from "./types";

const ViewRange = ({
  range,
  disableMaxRange,
  title,
  hasSpotterData,
  onRangeChange,
  classes,
  startDate,
  endDate,
}: ViewRangeProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const buttons: RangeButton[] = [
    {
      id: "three_months",
      title: "3 Months",
      tooltip: "Range of 3 months from maximum date",
    },
    {
      id: "one_year",
      title: "1 Year",
      tooltip: "Range of 1 year from maximum date",
    },
    {
      id: "max",
      title: "Max",
      disabled: disableMaxRange,
      tooltip: disableMaxRange ? "No maximum range" : "Maximun range",
    },
    {
      id: "custom",
      title: "Custom",
      tooltip: "Custom range",
    },
  ];

  const formattedStartDate = moment.utc(startDate).format("MM/DD/YYYY");
  const formattedEndDate = moment.utc(endDate).format("MM/DD/YYYY");
  const type = hasSpotterData ? "Spotter" : "HOBO";
  const dateRangeString = `${type} range: ${formattedStartDate} - ${formattedEndDate}`;

  return (
    <>
      <Grid
        className={classes.autoWidth}
        container
        alignItems="flex-end"
        justify="space-between"
        spacing={2}
      >
        <Grid item>
          <Box ml="42px">
            <Typography variant="h6" color="textSecondary">
              {title || "TEMPERATURE"}
            </Typography>
            <Typography className={classes.titleDateRange} variant="subtitle2">
              &#9432;&nbsp;
              {startDate && endDate ? dateRangeString : "No Range Available"}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={isMobile ? 12 : undefined}>
          <Box
            ml="30px"
            mr={
              (!isTablet && !hasSpotterData) || (!isDesktop && hasSpotterData)
                ? "10px"
                : "0px"
            }
          >
            <Grid
              className={classes.autoWidth}
              container
              justify={isMobile ? "center" : "flex-start"}
              alignItems="center"
              spacing={2}
            >
              <Grid item xs={isMobile ? 12 : undefined}>
                <Typography variant="subtitle1" color="textSecondary">
                  View Range:
                </Typography>
              </Grid>
              {buttons.map((button) => (
                <Grid key={button.id} item xs={isMobile ? 12 : undefined}>
                  <Tooltip arrow placement="top" title={button.tooltip}>
                    <div>
                      <Button
                        onClick={() => onRangeChange(button.id)}
                        size="small"
                        variant={range === button.id ? "contained" : "outlined"}
                        color="primary"
                        disabled={button.disabled}
                        fullWidth
                      >
                        <Typography variant="subtitle1">
                          {button.title}
                        </Typography>
                      </Button>
                    </div>
                  </Tooltip>
                </Grid>
              ))}
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
    titleDateRange: {
      padding: "2px 5px",
      marginTop: 8,
      borderRadius: 5,
      backgroundColor: "#f8f9f9",
      color: "#979797",
    },
  });

interface ViewRangeIncomingProps {
  range: RangeValue;
  disableMaxRange: boolean;
  title?: string;
  hasSpotterData: boolean;
  onRangeChange: (value: RangeValue) => void;
  startDate: string | undefined;
  endDate: string | undefined;
}

ViewRange.defaultProps = {
  title: "",
};

type ViewRangeProps = ViewRangeIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ViewRange);
