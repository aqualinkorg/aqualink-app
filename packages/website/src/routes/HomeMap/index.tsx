import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Hidden,
  Drawer,
} from "@material-ui/core";
import classNames from "classnames";

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

  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <>
      <div role="presentation" onClick={openDrawer ? toggleDrawer : () => {}}>
        <HomepageNavBar searchLocation />
      </div>
      <div className={classes.root}>
        <Grid container direction="row">
          <Grid className={classes.map} item xs={12} sm={6}>
            <HomepageMap />
          </Grid>
          <Hidden xsDown>
            <Grid className={classes.reefTable} item sm={6}>
              <ReefTable openDrawer={openDrawer} />
            </Grid>
          </Hidden>
          <Hidden smUp>
            <Drawer
              variant="permanent"
              anchor="bottom"
              open={openDrawer}
              onClose={toggleDrawer}
              className={classNames({
                [classes.openDrawer]: openDrawer,
                [classes.closedDrawer]: !openDrawer,
              })}
              classes={{
                paper: classNames(classes.drawer, {
                  [classes.openDrawer]: openDrawer,
                  [classes.closedDrawer]: !openDrawer,
                }),
              }}
            >
              <div role="presentation" onClick={toggleDrawer}>
                <ReefTable openDrawer={openDrawer} />
              </div>
            </Drawer>
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
    },
    reefTable: {
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 64px);", // subtract height of the navbar
      overflowY: "auto",
    },
    drawer: {
      borderTopLeftRadius: "15px",
      borderTopRightRadius: "15px",
    },
    openDrawer: {
      height: "calc(95% - 64px);", // subtract height of the navbar
      overflow: "auto",
    },
    closedDrawer: {
      height: "50px",
      overflow: "hidden",
    },
  });

type HomepageProps = WithStyles<typeof styles>;

export default withStyles(styles)(Homepage);
