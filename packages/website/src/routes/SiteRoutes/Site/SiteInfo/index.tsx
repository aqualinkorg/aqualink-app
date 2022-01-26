import React, { useState } from "react";
import {
  Grid,
  Typography,
  IconButton,
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import CloseIcon from "@material-ui/icons/Close";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";

import EditForm from "./EditForm";
import ExclusionDatesDialog from "./ExclusionDatesDialog";
import {
  setSelectedSite,
  setSiteData,
  setSiteDraft,
} from "../../../../store/Sites/selectedSiteSlice";
import { Site, SiteUpdateParams } from "../../../../store/Sites/types";
import { getSiteNameAndRegion } from "../../../../store/Sites/helpers";
import siteServices from "../../../../services/siteServices";
import {
  setAdministeredSiteName,
  userInfoSelector,
} from "../../../../store/User/userSlice";
import { displayTimeInLocalTimezone } from "../../../../helpers/dates";
import CollectionButton from "./CollectionButton";
import {
  sitesListSelector,
  setSiteName,
} from "../../../../store/Sites/sitesListSlice";

const SiteNavBar = ({
  hasDailyData,
  site,
  lastSurvey,
  isAdmin,
  classes,
}: SiteNavBarProps) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector(userInfoSelector);
  const sitesList = useSelector(sitesListSelector);
  const [editEnabled, setEditEnabled] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { name: siteName, region: siteRegion } = getSiteNameAndRegion(site);
  const organizationName = site.admins[0]?.organization;
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [exclusionDatesDialogOpen, setExclusionDatesDeployDialogOpen] =
    useState(false);

  const clearSiteInfo = () => {
    if (!hasDailyData) {
      dispatch(setSelectedSite(null));
    }
  };

  const onCloseForm = () => {
    dispatch(setSiteDraft(null));
    setEditEnabled(false);
  };

  const onOpenForm = () => {
    if (site.depth && site.polygon.type === "Point") {
      dispatch(
        setSiteDraft({
          name: siteName || "",
          depth: site.depth,
          coordinates: {
            longitude: site.polygon.coordinates[0],
            latitude: site.polygon.coordinates[1],
          },
        })
      );
    }
    setEditEnabled(true);
  };

  const handleFormSubmit = (data: SiteUpdateParams) => {
    if (user && user.token) {
      setFormSubmitLoading(true);
      siteServices
        .updateSite(site.id, data, user.token)
        .then(() => dispatch(setSiteData(data)))
        .then(() => {
          dispatch(
            setAdministeredSiteName({
              id: site.id,
              list: user?.administeredSites,
              name: data.name,
            })
          );
          dispatch(
            setSiteName({
              id: site.id,
              list: sitesList,
              name: data.name,
            })
          );
        })
        .then(() => setAlertSeverity("success"))
        .catch(() => setAlertSeverity("error"))
        .finally(() => {
          dispatch(setSiteDraft(null));
          setEditEnabled(false);
          setAlertOpen(true);
          setFormSubmitLoading(false);
        });
    }
  };

  return (
    <>
      {user?.token &&
        isAdmin &&
        (site.status === "shipped" || site.status === "deployed") && (
          <ExclusionDatesDialog
            dialogType={site.status === "shipped" ? "deploy" : "maintain"}
            open={exclusionDatesDialogOpen}
            onClose={() => setExclusionDatesDeployDialogOpen(false)}
            token={user.token}
            timeZone={site.timezone}
            siteId={site.id}
          />
        )}
      <Collapse in={alertOpen}>
        <Alert
          severity={alertSeverity}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setAlertOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alertSeverity === "success"
            ? "Successfully updated site information"
            : "Something went wrong"}
        </Alert>
      </Collapse>
      <Grid
        className={classes.root}
        container
        justify="space-between"
        alignItems="center"
      >
        <Grid item xs={12}>
          <Grid alignItems="center" container spacing={1}>
            {!editEnabled ? (
              <Grid item className={classes.headerButtonWrapper}>
                <IconButton
                  onClick={clearSiteInfo}
                  edge="start"
                  color="primary"
                  aria-label="menu"
                  component={Link}
                  to="/map"
                >
                  <ArrowBack />
                </IconButton>
              </Grid>
            ) : null}

            {editEnabled ? (
              <Grid item xs={12}>
                <EditForm
                  site={site}
                  loading={formSubmitLoading}
                  onClose={onCloseForm}
                  onSubmit={handleFormSubmit}
                />
              </Grid>
            ) : (
              <Grid
                className={classes.headerWrapper}
                container
                alignItems="center"
                item
                spacing={1}
              >
                <Grid item xs={12} md={8} container alignItems="center">
                  <Grid item xs={12}>
                    <Grid container alignItems="baseline">
                      <Grid className={classes.siteNameWrapper} item>
                        <Typography variant="h4">
                          {siteName}
                          {siteRegion && `, ${siteRegion}`}
                        </Typography>
                      </Grid>
                      <Grid className={classes.headerButtonWrapper} item>
                        <CollectionButton
                          siteId={site.id}
                          errorCallback={() => {
                            setAlertOpen(true);
                            setAlertSeverity("error");
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  {organizationName && (
                    <Grid item xs={12}>
                      <Typography variant="h6">{`Managed by ${organizationName}`}</Typography>
                    </Grid>
                  )}
                  {lastSurvey && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">{`Last surveyed: ${displayTimeInLocalTimezone(
                        {
                          isoDate: lastSurvey,
                          format: "MMM DD[,] YYYY",
                          displayTimezone: false,
                          timeZone: site.timezone,
                        }
                      )}`}</Typography>
                    </Grid>
                  )}
                </Grid>
                {isAdmin && (
                  <Grid
                    container
                    direction={matches ? "row" : "column"}
                    item
                    xs={12}
                    md={4}
                    spacing={1}
                  >
                    <Grid item>
                      <Button
                        className={classes.button}
                        onClick={onOpenForm}
                        size="small"
                        color="primary"
                        variant="outlined"
                      >
                        EDIT SITE DETAILS
                      </Button>
                    </Grid>
                    {site.sensorId &&
                      (site.status === "shipped" ||
                        site.status === "deployed") && (
                        <Grid item>
                          <Button
                            className={classes.button}
                            onClick={() =>
                              setExclusionDatesDeployDialogOpen(true)
                            }
                            size="small"
                            color="primary"
                            variant="outlined"
                          >
                            {site.status === "shipped"
                              ? "MARK AS DEPLOYED"
                              : "ADD EXCLUSION DATES"}
                          </Button>
                        </Grid>
                      )}
                    <Grid item>
                      <Button
                        component={Link}
                        to={`/sites/${site.id}/upload_data`}
                        className={classes.button}
                        color="primary"
                        variant="outlined"
                        size="small"
                      >
                        UPLOAD DATA
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
    managerInfo: {
      marginRight: "0.5rem",
    },
    button: {
      minWidth: 180,
    },
    headerButtonWrapper: {
      width: 48,
    },
    headerWrapper: {
      maxWidth: "calc(100% - 48px)", // maximum width of 100% minus the width of the back button
    },
    siteNameWrapper: {
      maxWidth: "calc(100% - 56px)", // maximum width of 100% minus the width of the collection button and its padding
      overflowWrap: "break-word",
    },
  });

interface SiteNavBarIncomingProps {
  hasDailyData: boolean;
  site: Site;
  lastSurvey?: string | null;
  isAdmin: boolean;
}

SiteNavBar.defaultProps = {
  lastSurvey: null,
};

type SiteNavBarProps = SiteNavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SiteNavBar);
