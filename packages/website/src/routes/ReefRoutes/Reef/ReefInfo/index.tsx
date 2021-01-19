import React, { useCallback, useState } from "react";
import moment from "moment";
import {
  Grid,
  Typography,
  IconButton,
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Box,
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
import DeployDialog from "./DeployDialog";
import MaintainDialog from "./MaintainDialog";
import {
  setSelectedReef,
  setReefData,
  setReefDraft,
} from "../../../../store/Reefs/selectedReefSlice";
import { Reef, ReefUpdateParams } from "../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../store/Reefs/helpers";
import reefServices from "../../../../services/reefServices";
import { userInfoSelector } from "../../../../store/User/userSlice";
import { convertToLocalTime } from "../../../../helpers/dates";

const ReefNavBar = ({
  hasDailyData,
  reef,
  lastSurvey,
  isManager,
  classes,
}: ReefNavBarProps) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector(userInfoSelector);
  const [editEnabled, setEditEnabled] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">();
  const { name: reefName, region: reefRegion } = getReefNameAndRegion(reef);
  const organizationName = reef.admins[0]?.organization;
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [maintainDialogOpen, setMaintainDialogOpen] = useState(false);

  const clearReefInfo = useCallback(() => {
    if (!hasDailyData) {
      dispatch(setSelectedReef(null));
    }
  }, [hasDailyData, dispatch]);

  const onCloseForm = useCallback(() => {
    dispatch(setReefDraft(null));
    setEditEnabled(false);
  }, [dispatch]);

  const onOpenForm = useCallback(() => {
    if (reef.depth && reef.polygon.type === "Point") {
      dispatch(
        setReefDraft({
          name: reefName || "",
          depth: reef.depth,
          coordinates: {
            longitude: reef.polygon.coordinates[0],
            latitude: reef.polygon.coordinates[1],
          },
        })
      );
    }
    setEditEnabled(true);
  }, [
    dispatch,
    reef.depth,
    reef.polygon.coordinates,
    reef.polygon.type,
    reefName,
  ]);

  const handleFormSubmit = useCallback(
    (data: ReefUpdateParams) => {
      if (user && user.token) {
        reefServices
          .updateReef(reef.id, data, user.token)
          .then(() => dispatch(setReefData(data)))
          .then(() => setAlertSeverity("success"))
          .catch(() => setAlertSeverity("error"))
          .finally(() => {
            dispatch(setReefDraft(null));
            setEditEnabled(false);
            setAlertOpen(true);
          });
      }
    },
    [user, reef.id, dispatch]
  );

  return (
    <>
      {user?.token && reef.timezone && (
        <DeployDialog
          onClose={() => setDeployDialogOpen(false)}
          open={deployDialogOpen}
          token={user.token}
          timeZone={reef.timezone}
          reefId={reef.id}
        />
      )}
      {user?.token && reef.timezone && (
        <MaintainDialog
          onClose={() => setMaintainDialogOpen(false)}
          open={maintainDialogOpen}
          token={user.token}
          timeZone={reef.timezone}
          reefId={reef.id}
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
              <Grid item>
                <Link
                  style={{ color: "inherit", textDecoration: "none" }}
                  to="/map"
                >
                  <IconButton
                    onClick={clearReefInfo}
                    edge="start"
                    color="primary"
                    aria-label="menu"
                  >
                    <ArrowBack />
                  </IconButton>
                </Link>
              </Grid>
            ) : null}

            {editEnabled ? (
              <Grid item xs={10}>
                <EditForm
                  reef={reef}
                  onClose={onCloseForm}
                  onSubmit={handleFormSubmit}
                />
              </Grid>
            ) : (
              <Grid container alignItems="center" item xs={10} spacing={1}>
                <Grid item xs={12} md={8} direction="column" container>
                  <Box>
                    <Typography variant="h4">
                      {reefName}
                      {reefRegion && `, ${reefRegion}`}
                    </Typography>
                  </Box>
                  {organizationName && (
                    <Box>
                      <Typography variant="h6">{`Managed by ${organizationName}`}</Typography>
                    </Box>
                  )}
                  {lastSurvey && (
                    <Box>
                      <Typography variant="subtitle1">{`Last surveyed: ${moment(
                        convertToLocalTime(lastSurvey, reef.timezone)
                      ).format("MMM DD[,] YYYY")}`}</Typography>
                    </Box>
                  )}
                </Grid>
                {isManager && (
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
                    {reef.status === "shipped" && (
                      <Grid item>
                        <Button
                          className={classes.button}
                          onClick={() => setDeployDialogOpen(true)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        >
                          MARK AS DEPLOYED
                        </Button>
                      </Grid>
                    )}
                    {reef.status === "deployed" && (
                      <Grid item>
                        <Button
                          className={classes.button}
                          onClick={() => setMaintainDialogOpen(true)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        >
                          ADD MAINTENANCE
                        </Button>
                      </Grid>
                    )}
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
      width: 160,
    },
  });

interface ReefNavBarIncomingProps {
  hasDailyData: boolean;
  reef: Reef;
  lastSurvey?: string | null;
  isManager: boolean;
}

ReefNavBar.defaultProps = {
  lastSurvey: null,
};

type ReefNavBarProps = ReefNavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(ReefNavBar);
