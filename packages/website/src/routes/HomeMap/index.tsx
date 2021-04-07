import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  createStyles,
  Grid,
  Hidden,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import SwipeableBottomSheet from "react-swipeable-bottom-sheet";
import HomepageNavBar from "../../common/NavBar";
import HomepageMap from "./Map";
import ReefTable from "./ReefTable";
import {
  reefsRequest,
  reefsListSelector,
} from "../../store/Reefs/reefsListSlice";
import { reefRequest } from "../../store/Reefs/selectedReefSlice";
import { reefOnMapSelector } from "../../store/Homepage/homepageSlice";

import { surveysRequest } from "../../store/Survey/surveyListSlice";
import { findReefById } from "../../helpers/reefUtils";

enum QueryParamKeys {
  REEF_ID = "reef_id",
  ZOOM_LEVEL = "zoom",
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Homepage = ({ classes }: HomepageProps) => {
  const dispatch = useDispatch();
  const reefOnMap = useSelector(reefOnMapSelector);
  const reefsList = useSelector(reefsListSelector) || [];

  const urlParams: URLSearchParams = useQuery();
  const zoomLevelParam = urlParams.get(QueryParamKeys.ZOOM_LEVEL);
  const initialZoom: number = zoomLevelParam ? +zoomLevelParam : 0;

  const queryParamReefId = urlParams.get(QueryParamKeys.REEF_ID) || "";
  const featuredReefId = process.env.REACT_APP_FEATURED_REEF_ID || "";

  const initialReefId =
    findReefById(reefsList, queryParamReefId)?.id.toString() || featuredReefId;

  useEffect(() => {
    dispatch(reefsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!reefOnMap) {
      dispatch(reefRequest(initialReefId));
      dispatch(surveysRequest(initialReefId));
    } else {
      dispatch(reefRequest(`${reefOnMap.id}`));
      dispatch(surveysRequest(`${reefOnMap.id}`));
    }
  }, [dispatch, initialReefId, reefOnMap]);

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  // scroll drawer to top when its closed.
  // the lib we use doesn't support passing ID or ref, so we rely on class name here.
  // scrollTopAtClose prop doesn't work with manually controlled state
  useEffect(() => {
    if (isDrawerOpen) return;
    const className = "ReactSwipeableBottomSheet";
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
          <Grid className={classes.map} item xs={12} sm={6}>
            <HomepageMap
              initialZoom={initialZoom}
              initialReefId={queryParamReefId && initialReefId}
            />
          </Grid>
          <Hidden xsDown>
            <Grid className={classes.reefTable} item sm={6}>
              <ReefTable />
            </Grid>
          </Hidden>
          <Hidden smUp>
            <SwipeableBottomSheet
              overflowHeight={60}
              bodyStyle={{
                borderTopLeftRadius: "25px",
                borderTopRightRadius: "25px",
                maxHeight: "80vh",
              }}
              onChange={setDrawerOpen}
              open={isDrawerOpen}
            >
              <div role="presentation" onClick={toggleDrawer}>
                <ReefTable isDrawerOpen={isDrawerOpen} />
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
      display: "flex",
      flexGrow: 1,
    },
    map: {
      display: "flex",
      zIndex: 0,
    },
    reefTable: {
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 64px);", // subtract height of the navbar
      overflowY: "auto",
    },
  });

type HomepageProps = WithStyles<typeof styles>;

export default withStyles(styles)(Homepage);
