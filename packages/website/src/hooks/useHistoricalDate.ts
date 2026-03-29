import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { isValid, parseISO, format } from "date-fns";

import { setSelectedDate } from "../store/Homepage";
import { homepageSelectedDateSelector } from "../store/Homepage/homepageSelectors";

const DATE_QUERY_PARAM = "date";

/**
 * Hook that manages historical date selection, keeping URL query params in
 * sync with Redux store so that links to historical views are shareable.
 */
export function useHistoricalDate() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const selectedDate = useSelector(homepageSelectedDateSelector);

  // On mount, read `?date=` from URL and hydrate store
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get(DATE_QUERY_PARAM);
    if (dateParam) {
      const parsed = parseISO(dateParam);
      if (isValid(parsed)) {
        const today = format(new Date(), "yyyy-MM-dd");
        // Only accept past or today dates
        if (dateParam <= today) {
          dispatch(setSelectedDate(dateParam));
          return;
        }
      }
    }
    // No valid date param — clear store if it held one from navigation
    // (don't clear if user just navigated away and back without param change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback(
    (date: string | null) => {
      dispatch(setSelectedDate(date));

      // Sync to URL
      const params = new URLSearchParams(location.search);
      if (date) {
        params.set(DATE_QUERY_PARAM, date);
      } else {
        params.delete(DATE_QUERY_PARAM);
      }
      history.replace({ search: params.toString() });
    },
    [dispatch, history, location.search]
  );

  const onReset = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return {
    selectedDate,
    onChange,
    onReset,
  };
}
