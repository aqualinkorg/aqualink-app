import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  siteDetailsSelector,
  siteLoadingSelector,
  siteRequest,
} from 'store/Sites/selectedSiteSlice';

export const useSiteRequest = (siteId: string) => {
  const dispatch = useDispatch();
  const site = useSelector(siteDetailsSelector);
  const siteLoading = useSelector(siteLoadingSelector);

  useEffect(() => {
    if (!site || site.id !== parseInt(siteId, 10)) {
      dispatch(siteRequest(siteId));
    }
  }, [dispatch, site, siteId]);

  return { site, siteLoading };
};
