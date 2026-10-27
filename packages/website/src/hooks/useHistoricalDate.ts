import { useLocation, useNavigate } from 'react-router-dom';
import {
  changeHistoricalDate,
  historicalDateError,
} from 'helpers/historicalDate';

export const useHistoricalDate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const date = new URLSearchParams(location.search).get('date') ?? undefined;
  const error = historicalDateError(location.search);
  const setDate = (value?: string) => {
    navigate({
      ...location,
      search: changeHistoricalDate(location.search, value),
    });
  };
  return { date, error, setDate };
};
