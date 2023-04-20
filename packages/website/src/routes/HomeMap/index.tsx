import { LatLng } from 'leaflet';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  createStyles,
  Grid,
  Hidden,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import HomepageNavBar from '../../common/NavBar';
import HomepageMap from './Map';
import SiteTable from './SiteTable';
import {
  sitesRequest,
  sitesListSelector,
} from '../../store/Sites/sitesListSlice';
import { siteRequest } from '../../store/Sites/selectedSiteSlice';
import { siteOnMapSelector } from '../../store/Homepage/homepageSlice';

import { surveysRequest } from '../../store/Survey/surveyListSlice';
import { findSiteById, findInitialSitePosition } from '../../helpers/siteUtils';

enum QueryParamKeys {
  SITE_ID = 'site_id',
  ZOOM_LEVEL = 'zoom',
}

interface MapQueryParams {
  initialCenter: LatLng;
  initialZoom: number;
  initialSiteId: string | undefined;
}

const INITIAL_CENTER = new LatLng(0, 121.3);
const INITIAL_ZOOM = 5;

function useQuery() {
  const urlParams: URLSearchParams = new URLSearchParams(useLocation().search);
  const zoomLevelParam = urlParams.get(QueryParamKeys.ZOOM_LEVEL);
  const initialZoom: number = zoomLevelParam ? +zoomLevelParam : INITIAL_ZOOM;
  const queryParamSiteId = urlParams.get(QueryParamKeys.SITE_ID) || '';
  const sitesList = useSelector(sitesListSelector) || [];
  const featuredSiteId = process.env.REACT_APP_FEATURED_SITE_ID || '';
  const initialSiteId = queryParamSiteId
    ? findSiteById(sitesList, queryParamSiteId)?.id.toString() ||
      findSiteById(sitesList, featuredSiteId)?.id.toString() ||
      ''
    : featuredSiteId;

  // Focus on the site provided in the queryParamSiteId or the site with highest alert level.
  const initialCenter =
    findInitialSitePosition(
      sitesList,
      queryParamSiteId === initialSiteId ? initialSiteId : undefined,
    ) || INITIAL_CENTER;

  return {
    initialCenter,
    initialSiteId,
    initialZoom,
  };
}

const Homepage = ({ classes }: HomepageProps) => {
  const dispatch = useDispatch();
  const siteOnMap = useSelector(siteOnMapSelector);

  const { initialZoom, initialSiteId, initialCenter }: MapQueryParams =
    useQuery();

  useEffect(() => {
    dispatch(sitesRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!siteOnMap && initialSiteId) {
      dispatch(siteRequest(initialSiteId));
      dispatch(surveysRequest(initialSiteId));
    } else if (siteOnMap) {
      dispatch(siteRequest(`${siteOnMap.id}`));
      dispatch(surveysRequest(`${siteOnMap.id}`));
    }
  }, [dispatch, initialSiteId, siteOnMap]);

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  // scroll drawer to top when its closed.
  // the lib we use doesn't support passing ID or ref, so we rely on class name here.
  // scrollTopAtClose prop doesn't work with manually controlled state
  useEffect(() => {
    if (isDrawerOpen) return;
    const className = 'ReactSwipeableBottomSheet';
    const drawer =
      document.getElementsByClassName(`${className}--opened`)[0] ||
      document.getElementsByClassName(`${className}--closed`)[0];
    if (!drawer) return;
    // eslint-disable-next-line fp/no-mutation
    drawer.scrollTop = 0;
  });

  return (
    <>
      <div role="presentation" onClick={isDrawerOpen ? toggleDrawer : () => {}}>
        <HomepageNavBar searchLocation geocodingEnabled />
      </div>
      <div className={classes.root}>
        <Grid container>
          <Grid className={classes.map} item xs={12} md={6}>
            <HomepageMap
              initialZoom={initialZoom}
              initialCenter={initialCenter}
            />
          </Grid>
          <Hidden smDown>
            <Grid className={classes.siteTable} item md={6}>
              <SiteTable />
            </Grid>
          </Hidden>
          <Hidden mdUp>
            <SwipeableBottomSheet
              overflowHeight={60}
              bodyStyle={{
                borderTopLeftRadius: '25px',
                borderTopRightRadius: '25px',
                maxHeight: '80vh',
              }}
              onChange={setDrawerOpen}
              open={isDrawerOpen}
            >
              <div role="presentation" onClick={toggleDrawer}>
                <SiteTable isDrawerOpen={isDrawerOpen} />
              </div>
            </SwipeableBottomSheet>
          </Hidden>
        </Grid>
      </div>
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      display: 'flex',
      flexGrow: 1,
    },
    map: {
      display: 'flex',
      zIndex: 0,
    },
    siteTable: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px);', // subtract height of the navbar
      overflowY: 'auto',
    },
  });

type HomepageProps = WithStyles<typeof styles>;

export default withStyles(styles)(Homepage);
