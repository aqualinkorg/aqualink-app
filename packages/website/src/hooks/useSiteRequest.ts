import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';

import {
  siteDetailsSelector,
  siteLoadingSelector,
  siteRequest,
} from 'store/Sites/selectedSiteSlice';

export const useSiteRequest = (siteId: string) => {
  const dispatch = useAppDispatch();
  const site = useSelector(siteDetailsSelector);
  const siteLoading = useSelector(siteLoadingSelector);

  useEffect(() => {
    if (!site || site.id !== parseInt(siteId, 10)) {
      dispatch(siteRequest(siteId));
    }
  }, [dispatch, site, siteId]);

  return { site, siteLoading };
};
