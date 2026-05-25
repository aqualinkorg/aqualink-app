import L, { LatLng } from 'leaflet';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { useLocation } from 'react-router-dom';
import { Grid, Hidden, Box, Button } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import { sitesRequest, sitesListSelector } from 'store/Sites/sitesListSlice';
import { siteRequest } from 'store/Sites/selectedSiteSlice';
import { siteOnMapSelector } from 'store/Homepage/homepageSlice';

import { surveysRequest } from 'store/Survey/surveyListSlice';
import { findSiteById } from 'helpers/siteUtils';
import HomepageNavBar from 'common/NavBar';
import DatePicker from 'common/Datepicker';
import SiteTable from './SiteTable';
import HomepageMap from './Map';
import { useQueryParam } from 'hooks/useQueryParams';
import { DateTime } from 'luxon-extensions';

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
  // const initialCenter =
  //   findInitialSitePosition(
  //     sitesList,
  //     queryParamSiteId === initialSiteId ? initialSiteId : undefined,
  //   ) || INITIAL_CENTER;

  // WARNING - temporarily zoom to Australia during summer
  const initialCenter = INITIAL_CENTER;

  return {
    initialCenter,
    initialSiteId,
    initialZoom,
  };
}

function Homepage({ classes }: HomepageProps) {
  const dispatch = useAppDispatch();
  const siteOnMap = useSelector(siteOnMapSelector);
  const [showSiteTable, setShowSiteTable] = React.useState(true);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [selectedDate, setSelectedDate] = useQueryParam('date');
  const displayDate = selectedDate || DateTime.now().toISODate() || '';

  const { initialZoom, initialSiteId, initialCenter }: MapQueryParams =
    useQuery();

  useEffect(() => {
    dispatch(sitesRequest(selectedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    if (!siteOnMap && initialSiteId) {
      dispatch(siteRequest({ id: initialSiteId, date: selectedDate }));
      dispatch(surveysRequest(initialSiteId));
    } else if (siteOnMap) {
      dispatch(siteRequest({ id: `${siteOnMap.id}`, date: selectedDate }));
      dispatch(surveysRequest(`${siteOnMap.id}`));
    }
  }, [dispatch, initialSiteId, selectedDate, siteOnMap]);

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
        <Box className={classes.dateToolbar}>
          <DatePicker
            value={displayDate}
            timeZone={null}
            dateName="Historical date"
            onChange={(date) =>
              setSelectedDate(
                date ? DateTime.fromJSDate(date).toISODate() || undefined : undefined,
              )
            }
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedDate(undefined)}
          >
            Today
          </Button>
        </Box>
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
      position: 'relative',
    },
    dateToolbar: {
      position: 'absolute',
      zIndex: 1000,
      top: '5rem',
      left: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      background: 'rgba(255,255,255,0.92)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
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
