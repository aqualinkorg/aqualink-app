import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  CircularProgress,
  createStyles,
  Grid,
  Hidden,
  IconButton,
  LinearProgress,
  makeStyles,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Helmet } from "react-helmet";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import SiteTable from "./SiteTable";
import CoralMap from "./CoralMap";
import DatePicker from "./DatePicker";
import {
  reefListSelector,
  reefLoadingSelector,
  reefErrorSelector,
  reefOnMapSelector,
} from "../../store/Reefs/reefsListSlice";
import { getReefsList } from "../../store/Reefs/reefsListSlice";
import { getReefsDailyData } from "../../store/Reefs/reefsListSlice";
import { Site } from "../../store/Sites/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
    },
    contentContainer: {
      flex: 1,
      overflow: "hidden",
    },
    mapContainer: {
      height: "100%",
      position: "relative",
    },
    tableContainer: {
      height: "100%",
      overflow: "auto",
      backgroundColor: theme.palette.background.default,
    },
    datePickerContainer: {
      position: "absolute",
      top: 16,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: 8,
      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      padding: "8px 16px",
    },
    toggleButton: {
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      backgroundColor: theme.palette.primary.main,
      color: "white",
      borderRadius: "4px 0 0 4px",
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    toggleButtonIcon: {
      transition: "transform 0.3s ease",
    },
    toggleButtonIconRotated: {
      transform: "rotate(180deg)",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      zIndex: 500,
    },
    historicalBanner: {
      position: "absolute",
      bottom: 32,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      backgroundColor: "rgba(25, 100, 170, 0.9)",
      color: "white",
      borderRadius: 4,
      padding: "4px 16px",
      whiteSpace: "nowrap",
    },
  })
);

const MapPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const reefs = useSelector(reefListSelector);
  const loading = useSelector(reefLoadingSelector);
  const error = useSelector(reefErrorSelector);
  const reefOnMap = useSelector(reefOnMapSelector);

  const [tableOpen, setTableOpen] = useState(!isMobile);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load reefs on mount
  useEffect(() => {
    dispatch(getReefsList());
  }, [dispatch]);

  // When date changes, load daily data for that date
  useEffect(() => {
    if (selectedDate) {
      dispatch(getReefsDailyData(selectedDate.toISOString()));
    }
  }, [dispatch, selectedDate]);

  const handleDateChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  const handleTableToggle = useCallback(() => {
    setTableOpen((prev) => !prev);
  }, []);

  const isHistoricalView = selectedDate !== null;

  if (error) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Typography variant="h6" color="error">
          Failed to load reef data. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Aqualink Map</title>
      </Helmet>
      <div className={classes.root}>
        <NavBar searchLocation />
        <Grid container className={classes.contentContainer}>
          {/* Map Panel */}
          <Grid
            item
            xs={12}
            md={tableOpen ? 8 : 12}
            className={classes.mapContainer}
            style={{ position: "relative" }}
          >
            {/* Date Picker floating over the map */}
            <Box className={classes.datePickerContainer}>
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </Box>

            <CoralMap sites={reefs} selectedSite={reefOnMap} />

            {/* Historical view banner */}
            {isHistoricalView && (
              <Box className={classes.historicalBanner}>
                <Typography variant="body2">
                  Viewing historical data for{" "}
                  {selectedDate!.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            )}

            {/* Loading overlay while fetching historical data */}
            {loading && isHistoricalView && (
              <Box className={classes.loadingOverlay}>
                <CircularProgress />
              </Box>
            )}

            {/* Table toggle button (desktop) */}
            <Hidden smDown>
              <IconButton
                className={classes.toggleButton}
                onClick={handleTableToggle}
                size="small"
              >
                <ChevronRightIcon
                  className={`${classes.toggleButtonIcon} ${
                    tableOpen ? classes.toggleButtonIconRotated : ""
                  }`}
                />
              </IconButton>
            </Hidden>
          </Grid>

          {/* Site Table Panel */}
          {tableOpen && (
            <Grid
              item
              xs={12}
              md={4}
              className={classes.tableContainer}
            >
              {loading && !isHistoricalView ? (
                <LinearProgress />
              ) : (
                <SiteTable sites={reefs} />
              )}
            </Grid>
          )}
        </Grid>
        <Footer />
      </div>
    </>
  );
};

export default MapPage;
