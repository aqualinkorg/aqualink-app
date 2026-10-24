import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HISTORICAL_DATE_PARAM,
  isValidHistoricalDate,
} from 'helpers/historicalDate';

/**
 * Reads the historical date (`?date=YYYY-MM-DD`) straight from the URL, so it
 * stays in sync with links and browser back/forward navigation, and returns
 * a setter that updates it while keeping the rest of the query string.
 */
export const useHistoricalDate = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const value = new URLSearchParams(search).get(HISTORICAL_DATE_PARAM);
  const date = value && isValidHistoricalDate(value) ? value : undefined;

  const setDate = useCallback(
    (next: string | undefined) => {
      const params = new URLSearchParams(window.location.search);
      if (next && isValidHistoricalDate(next)) {
        params.set(HISTORICAL_DATE_PARAM, next);
      } else {
        params.delete(HISTORICAL_DATE_PARAM);
      }
      const nextSearch = params.toString();
      navigate({ search: nextSearch ? `?${nextSearch}` : '' });
    },
    [navigate],
  );

  return [date, setDate] as const;
};
