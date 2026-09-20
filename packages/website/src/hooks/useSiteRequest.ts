import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';

import {
  siteDetailsSelector,
  siteLoadingSelector,
  siteRequest,
} from 'store/Sites/selectedSiteSlice';
import { isHistoricalDateParam } from 'helpers/historicalDate';
import { useQueryParam } from 'hooks/useQueryParams';

export const useSiteRequest = (siteId: string) => {
  const dispatch = useAppDispatch();
  const site = useSelector(siteDetailsSelector);
  const siteLoading = useSelector(siteLoadingSelector);
  const [date] = useQueryParam('date', isHistoricalDateParam);

  useEffect(() => {
    if (!site || site.id !== parseInt(siteId, 10)) {
      dispatch(siteRequest({ id: siteId, date }));
    }
  }, [dispatch, site, siteId, date]);

  return { site, siteLoading };
};
