import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate } from "../store/Homepage";
import { homepageSelectedDateSelector } from "../store/Homepage/homepageSelectors";

/**
 * Hook to read and update the global historical date selection.
 *
 * When `selectedDate` is null the app displays live/current data.
 * When it is a "YYYY-MM-DD" string the map and site pages should
 * fetch data limited to that date.
 */
export function useHistoricalDate() {
  const dispatch = useDispatch();
  const selectedDate = useSelector(homepageSelectedDateSelector);

  const setDate = useCallback(
    (date: string | null) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch]
  );

  return { selectedDate, setDate };
}
