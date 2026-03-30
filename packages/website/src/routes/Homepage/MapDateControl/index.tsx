import React from "react";
import { Box, makeStyles, Paper, Tooltip, Typography } from "@material-ui/core";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";

import DatePicker from "../../../common/DatePicker";
import { useHistoricalDate } from "../../../hooks/useHistoricalDate";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "absolute",
    // Positioned in the top-right corner of the map, below the navbar
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1000,
    padding: theme.spacing(1, 1.5),
    backgroundColor: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(4px)",
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  label: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  infoIcon: {
    fontSize: 14,
    color: theme.palette.text.disabled,
  },
}));

/**
 * A floating control rendered inside the map that lets users pick a
 * historical date.  It uses the shared `useHistoricalDate` hook so the
 * selected value is reflected in the URL and in Redux.
 */
const MapDateControl: React.FC = () => {
  const classes = useStyles();
  const { selectedDate, onChange } = useHistoricalDate();

  return (
    <Paper className={classes.root} elevation={3}>
      <Box className={classes.header}>
        <Typography className={classes.label}>Historical date</Typography>
        <Tooltip
          title="Select a past date to view site conditions as they were on that day."
          arrow
        >
          <InfoOutlinedIcon className={classes.infoIcon} />
        </Tooltip>
      </Box>
      <DatePicker
        selectedDate={selectedDate}
        onChange={onChange}
        label="Select date"
      />
    </Paper>
  );
};

export default MapDateControl;
