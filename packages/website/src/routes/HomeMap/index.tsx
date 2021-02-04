import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { reefsRequest } from "../../store/Reefs/reefsListSlice";
import { reefRequest } from "../../store/Reefs/selectedReefSlice";
import { reefOnMapSelector } from "../../store/Homepage/homepageSlice";
import { surveysRequest } from "../../store/Survey/surveyListSlice";

const featuredReefId = process.env.REACT_APP_FEATURED_REEF_ID || "";

const Homepage = ({ classes }: HomepageProps) => {
  const dispatch = useDispatch();
  const reefOnMap = useSelector(reefOnMapSelector);

  useEffect(() => {
    dispatch(reefsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!reefOnMap) {
      dispatch(reefRequest(featuredReefId));
      dispatch(surveysRequest(featuredReefId));
    } else {
      dispatch(reefRequest(`${reefOnMap.id}`));
      dispatch(surveysRequest(`${reefOnMap.id}`));
    }
  }, [dispatch, reefOnMap]);

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <div role="presentation" onClick={isDrawerOpen ? toggleDrawer : () => {}}>
        <HomepageNavBar searchLocation geolocationEnabled />
      </div>
      <div className={classes.root}>
        <Grid container>
          <Grid className={classes.map} item xs={12} sm={6}>
            <HomepageMap />
          </Grid>
          <Hidden xsDown>
            <Grid className={classes.reefTable} item sm={6}>
              <ReefTable openDrawer={isDrawerOpen} />
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
              <ReefTable openDrawer={isDrawerOpen} />
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
