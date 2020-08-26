import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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

const featuredReefId = process.env.REACT_APP_FEATURED_REEF_ID || "";

const Homepage = ({ classes }: HomepageProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reefsRequest());
    dispatch(reefRequest(featuredReefId));
  }, [dispatch]);

  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <>
      <Hidden smUp>
        <div
          role="presentation"
          onClick={openDrawer ? toggleDrawer : () => null}
        >
          <HomepageNavBar searchLocation />
        </div>
      </Hidden>
      <Hidden xsDown>
        <HomepageNavBar searchLocation />
      </Hidden>
      <div className={classes.root}>
        <Grid
          style={{ height: "100%" }}
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          <Grid className={classes.map} item xs={12} sm={6}>
            <HomepageMap />
          </Grid>
          <Hidden xsDown>
            <Grid className={classes.reefTable} item sm={6}>
              <ReefTable />
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
                <ReefTable />
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
      height: "100%",
    },
    map: {
      height: "100%",
    },
    reefTable: {
      height: "calc(100vh - 64px)",
      overflowY: "auto",
    },
    drawer: {
      borderTopLeftRadius: "15px",
      borderTopRightRadius: "15px",
    },
    openDrawer: {
      height: "calc(100% - 64px);", // subtract height of the navbar
    },
    closedDrawer: {
      height: "50px",
      overflow: "revert",
    },
  });

type HomepageProps = WithStyles<typeof styles>;

export default withStyles(styles)(Homepage);
