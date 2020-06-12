import React from "react";
import {
  AppBar,
  Toolbar,
  Grid,
  Typography,
  IconButton,
  Avatar,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";

const ReefNavBar = ({ reefName, lastSurvey, managerName }: ReefNavBarProps) => (
  <AppBar position="static">
    <Toolbar>
      <Grid item container justify="space-between" alignItems="center" xs={12}>
        <Grid item>
          <Grid alignItems="center" container spacing={2}>
            <Grid item>
              <Link style={{ color: "inherit" }} to="/reefs">
                <IconButton edge="start" color="inherit" aria-label="menu">
                  <ArrowBack />
                </IconButton>
              </Link>
            </Grid>
            {reefName && lastSurvey && (
              <>
                <Grid item>
                  <Typography variant="h5">{reefName}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1">{`Last surveyed: ${lastSurvey}`}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        <Grid item>
          {managerName && (
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Grid container direction="column" alignItems="flex-end">
                  <Typography variant="subtitle2">
                    {`Managed by: ${managerName}`}
                  </Typography>
                  <Typography variant="caption">Contact Manager</Typography>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container>
                  <Avatar />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
);

interface ReefNavBarProps {
  reefName?: string;
  lastSurvey?: string;
  managerName?: string;
}

export default ReefNavBar;
