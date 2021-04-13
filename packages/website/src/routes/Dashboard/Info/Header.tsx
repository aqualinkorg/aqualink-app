import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
  Theme,
} from "@material-ui/core";
import EmailIcon from "@material-ui/icons/Email";
import classNames from "classnames";

import { Collection } from "../collection";
import { User } from "../../../store/User/types";

const Header = ({ user, collection, classes }: HeaderProps) => {
  const nSites = collection.reefs.length;

  return (
    <Grid container justify="space-between">
      <Grid item>
        <Grid container direction="column">
          <Grid item>
            <Typography variant="subtitle2" color="textSecondary">
              Managed by
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h5" color="textSecondary">
              {user.organization}
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Typography
                  className={classNames(classes.organization, classes.blueText)}
                >
                  {nSites}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6" className={classes.grayText}>
                  Sites
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="column">
          <Grid item>
            <Typography variant="subtitle1" color="textSecondary">
              {user.fullName}
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <EmailIcon className={classes.emailIcon} />
              </Grid>
              <Grid item>
                <Typography variant="caption" color="textSecondary">
                  {user.email}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    organization: {
      fontSize: 24,
    },

    blueText: {
      color: theme.palette.primary.main,
    },

    grayText: {
      color: "#AAB1B4",
    },

    emailIcon: {
      color: "#757575",
      height: 11,
      width: 14,
      marginRight: 4,
    },
  });

interface HeaderIncomingProps {
  user: User;
  collection: Collection;
}

type HeaderProps = HeaderIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Header);
