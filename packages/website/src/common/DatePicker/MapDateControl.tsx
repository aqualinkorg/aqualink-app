import React from "react";
import { Box, makeStyles, Theme } from "@material-ui/core";
import DatePickerComponent from "./index";
import HistoricalDateBanner from "./HistoricalDateBanner";
import { useHistoricalDate } from "../../hooks/useHistoricalDate";

const useStyles = makeStyles((theme: Theme) => ({
  dateControlWrapper: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1000,
    // Shift down when the banner is shown so it doesn't overlap controls
    "&.with-banner": {
      top: `calc(${theme.spacing(2)}px + 40px)`,
    },
  },
}));

const MapDateControl: React.FC = () => {
  const classes = useStyles();
  const { selectedDate, setDate } = useHistoricalDate();

  return (
    <>
      {selectedDate && (
        <HistoricalDateBanner date={selectedDate} onDismiss={() => setDate(null)} />
      )}
      <Box
        className={`${classes.dateControlWrapper}${
          selectedDate ? " with-banner" : ""
        }`}
      >
        <DatePickerComponent
          selectedDate={selectedDate}
          onDateChange={setDate}
        />
      </Box>
    </>
  );
};

export default MapDateControl;
