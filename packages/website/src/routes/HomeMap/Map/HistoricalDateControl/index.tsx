import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import { Button, CircularProgress, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isValid, parseISO } from 'date-fns';
import { DateTime } from 'luxon-extensions';
import { useAppDispatch } from 'store/hooks';
import {
  setSitesListDate,
  sitesListDateSelector,
  sitesListRefreshingSelector,
} from 'store/Sites/sitesListSlice';
import { isValidHistoricalDate } from 'store/Sites/helpers';

// NOAA Coral Reef Watch satellite records start in 1985
const MIN_DATE = new Date(1985, 0, 1);

const useStyles = makeStyles(() => ({
  root: {
    position: 'absolute',
    top: 10,
    left: 54,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 8px',
    borderRadius: 5,
    backgroundColor: 'white',
    backgroundClip: 'padding-box',
    border: '2px solid rgba(0,0,0,0.2)',
  },
  picker: {
    width: 150,
  },
}));

/**
 * Lets users display the map data (alert levels, temperatures, DHW...)
 * as it was at the end of a past day instead of the latest values.
 */
function HistoricalDateControl() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const date = useSelector(sitesListDateSelector);
  const refreshing = useSelector(sitesListRefreshingSelector);
  const ref = useRef<HTMLDivElement>(null);
  // Latest selectable day is yesterday (UTC), today is the live data
  const maxDate = parseISO(
    DateTime.now().setZone('utc').minus({ days: 1 }).toISODate() as string,
  );

  // Keep clicks and scrolls on the control from moving the map
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  }, []);

  const onChange = (value: Date | null) => {
    if (value === null) {
      dispatch(setSitesListDate(null));
      return;
    }
    if (!isValid(value)) return;
    const day = format(value, 'yyyy-MM-dd');
    if (isValidHistoricalDate(day)) {
      dispatch(setSitesListDate(day));
    }
  };

  return (
    <div ref={ref} className={classes.root} data-testid="historical-date">
      <Typography variant="subtitle2" color="textSecondary">
        {date ? 'Data as of' : 'Latest data'}
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          className={classes.picker}
          format="yyyy-MM-dd"
          minDate={MIN_DATE}
          maxDate={maxDate}
          closeOnSelect
          disableFuture
          value={date ? parseISO(date) : null}
          onAccept={onChange}
          onChange={(value) => {
            // Typed dates are applied once complete, picked ones on accept
            if (value && isValid(value) && value >= MIN_DATE) onChange(value);
          }}
          slotProps={{
            textField: {
              size: 'small',
              variant: 'standard',
              placeholder: 'Pick a past date',
              inputProps: { 'aria-label': 'Map data date' },
            },
            actionBar: { actions: ['clear'] },
          }}
        />
      </LocalizationProvider>
      {refreshing && <CircularProgress size={16} />}
      {date && (
        <Button
          size="small"
          color="primary"
          onClick={() => dispatch(setSitesListDate(null))}
        >
          Today
        </Button>
      )}
    </div>
  );
}

export default HistoricalDateControl;
