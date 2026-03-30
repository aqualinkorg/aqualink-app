import React from "react";
import {
  Box,
  Button,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import HistoryIcon from "@material-ui/icons/History";
import { format, parseISO } from "date-fns";

interface HistoricalDataBannerProps {
  selectedDate: string;
  onReset: () => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0.75, 2),
    backgroundColor: theme.palette.warning.light,
    borderRadius: 0,
    zIndex: 1100,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  icon: {
    color: theme.palette.warning.dark,
    fontSize: 20,
  },
  text: {
    color: theme.palette.warning.dark,
    fontWeight: 600,
  },
  button: {
    color: theme.palette.warning.dark,
    borderColor: theme.palette.warning.dark,
    "&:hover": {
      backgroundColor: theme.palette.warning.main,
    },
  },
}));

const HistoricalDataBanner: React.FC<HistoricalDataBannerProps> = ({
  selectedDate,
  onReset,
}) => {
  const classes = useStyles();

  const formattedDate = (() => {
    try {
      return format(parseISO(selectedDate), "MMMM d, yyyy");
    } catch {
      return selectedDate;
    }
  })();

  return (
    <Paper className={classes.root} elevation={2}>
      <Box className={classes.left}>
        <HistoryIcon className={classes.icon} />
        <Typography className={classes.text} variant="body2">
          Viewing historical data for{" "}
          <strong>{formattedDate}</strong>
        </Typography>
      </Box>
      <Button
        className={classes.button}
        size="small"
        variant="outlined"
        onClick={onReset}
      >
        Return to today
      </Button>
    </Paper>
  );
};

export default HistoricalDataBanner;
