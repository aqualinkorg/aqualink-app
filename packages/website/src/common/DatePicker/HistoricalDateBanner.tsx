import React from "react";
import { Box, Chip, Typography, makeStyles, Theme } from "@material-ui/core";
import HistoryIcon from "@material-ui/icons/History";
import CloseIcon from "@material-ui/icons/Close";
import { format, parseISO } from "date-fns";

const useStyles = makeStyles((theme: Theme) => ({
  banner: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1200,
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 16px",
    gap: theme.spacing(1),
    boxShadow: theme.shadows[4],
  },
  icon: {
    fontSize: "1.1rem",
  },
  text: {
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  chip: {
    backgroundColor: "rgba(0,0,0,0.15)",
    color: "inherit",
    fontWeight: 700,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.25)",
    },
  },
}));

interface HistoricalDateBannerProps {
  date: string; // ISO date string
  onDismiss: () => void;
}

const HistoricalDateBanner: React.FC<HistoricalDateBannerProps> = ({
  date,
  onDismiss,
}) => {
  const classes = useStyles();
  const formatted = format(parseISO(date), "MMMM d, yyyy");

  return (
    <Box className={classes.banner}>
      <HistoryIcon className={classes.icon} />
      <Typography className={classes.text}>
        Viewing historical data for
      </Typography>
      <Chip
        label={formatted}
        size="small"
        className={classes.chip}
        deleteIcon={<CloseIcon />}
        onDelete={onDismiss}
        onClick={onDismiss}
      />
      <Typography className={classes.text}>— click to return to live view</Typography>
    </Box>
  );
};

export default HistoricalDateBanner;
