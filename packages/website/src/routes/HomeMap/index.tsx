import L, { LatLng } from 'leaflet';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { useLocation } from 'react-router-dom';
import { Grid, Hidden } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {
  selectedDateSelector,
  setSelectedDate,
  sitesRequest,
  sitesListSelector,
} from 'store/Sites/sitesListSlice';
import { siteRequest } from 'store/Sites/selectedSiteSlice';
import { siteOnMapSelector } from 'store/Homepage/homepageSlice';
import {
  readHistoricalDateFromUrl,
  writeHistoricalDateToUrl,
} from 'store/Sites/historicalDateHelpers';
import type { Site } from 'store/Sites/types';

import { surveysRequest } from 'store/Survey/surveyListSlice';
import { findSiteById } from 'helpers/siteUtils';
import HomepageNavBar from 'common/NavBar';
import SiteTable from './SiteTable';
import HomepageMap from './Map';

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
const INITIAL_ZOOM = 4;

const resolveInitialSiteId = (
  sitesList: Site[],
  queryParamSiteId: string,
): string => {
  const featuredSiteId = process.env.REACT_APP_FEATURED_SITE_ID || '';
  if (!queryParamSiteId) {
    return featuredSiteId;
  }
  const matchedQuerySite = findSiteById(sitesList, queryParamSiteId);
  if (matchedQuerySite) {
    return matchedQuerySite.id.toString();
  }
  return findSiteById(sitesList, featuredSiteId)?.id.toString() || '';
};

const resetBottomSheetScroll = (isDrawerOpen: boolean): void => {
  if (isDrawerOpen) {
    return;
  }
  const className = 'ReactSwipeableBottomSheet';
  const drawer =
    document.getElementsByClassName(`${className}--opened`)[0] ||
    document.getElementsByClassName(`${className}--closed`)[0];
  if (!drawer) {
    return;
  }
  // eslint-disable-next-line fp/no-mutation
  drawer.scrollTop = 0;
};

function useQuery(): MapQueryParams {
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const zoomLevelParam = urlParams.get(QueryParamKeys.ZOOM_LEVEL);
  const initialZoom = zoomLevelParam ? +zoomLevelParam : INITIAL_ZOOM;
  const queryParamSiteId = urlParams.get(QueryParamKeys.SITE_ID) || '';
  const sitesList = useSelector(sitesListSelector) || [];
  const initialSiteId = resolveInitialSiteId(sitesList, queryParamSiteId);

  return {
    initialCenter: INITIAL_CENTER,
    initialSiteId,
    initialZoom,
  };
}

function Homepage({ classes }: HomepageProps) {
  const dispatch = useAppDispatch();
  const { search } = useLocation();
  const siteOnMap = useSelector(siteOnMapSelector);
  const selectedDate = useSelector(selectedDateSelector);
  const [showSiteTable, setShowSiteTable] = React.useState(true);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const { initialZoom, initialSiteId, initialCenter }: MapQueryParams =
    useQuery();

  useEffect(() => {
    const urlDate = readHistoricalDateFromUrl(search);
    if (urlDate) {
      dispatch(setSelectedDate(urlDate));
      return;
    }
    if (selectedDate) {
      writeHistoricalDateToUrl(selectedDate);
    }
    // Synchronize only when route search string changes so manual date resets are preserved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search]);

  useEffect(() => {
    dispatch(sitesRequest(selectedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    const targetSiteId = siteOnMap ? `${siteOnMap.id}` : initialSiteId;
    if (!targetSiteId) {
      return;
    }
    dispatch(
      siteRequest(
        selectedDate ? { id: targetSiteId, date: selectedDate } : targetSiteId,
      ),
    );
    dispatch(surveysRequest(targetSiteId));
  }, [dispatch, initialSiteId, selectedDate, siteOnMap]);

  useEffect(() => {
    resetBottomSheetScroll(isDrawerOpen);
  });

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <div role="presentation" onClick={isDrawerOpen ? toggleDrawer : () => {}}>
        <HomepageNavBar searchLocation geocodingEnabled />
      </div>
      <div className={classes.root}>
        <Grid container>
          <Grid
            className={classes.map}
            item
            xs={12}
            md={showSiteTable ? 6 : 12}
          >
            <HomepageMap
              onMapLoad={setMapInstance}
              setShowSiteTable={setShowSiteTable}
              showSiteTable={showSiteTable}
              initialZoom={initialZoom}
              initialCenter={initialCenter}
            />
          </Grid>
          {showSiteTable && (
            <Hidden mdDown>
              <Grid className={classes.siteTable} item md={6}>
                <SiteTable map={mapInstance} />
              </Grid>
            </Hidden>
          )}
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
                <SiteTable map={mapInstance} isDrawerOpen={isDrawerOpen} />
              </div>
            </SwipeableBottomSheet>
          </Hidden>
        </Grid>
      </div>
    </>
  );
}

const styles = () =>
  createStyles({
    root: {
      display: 'flex',
      flexGrow: 1,
      userSelect: 'none',
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
