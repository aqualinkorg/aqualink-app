import { useLocation } from 'react-router-dom';
import { validHistoricalDate } from 'helpers/historicalDate';

export const useHistoricalDate = () => {
  const { search } = useLocation();
  const value = new URLSearchParams(search).get('asOf');
  return value && validHistoricalDate(value) ? value : undefined;
};
