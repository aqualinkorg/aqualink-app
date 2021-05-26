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

import { CollectionDetails } from "../../../store/Collection/types";

const Header = ({ collection, classes }: HeaderProps) => {
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
              {collection.user.organization}
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
              {collection.user.fullName}
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <EmailIcon className={classes.emailIcon} />
              </Grid>
              <Grid item>
                <Typography variant="caption" color="textSecondary">
                  {collection.user.email}
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
      color: theme.palette.grey[400],
    },

    emailIcon: {
      color: theme.palette.grey[600],
      height: 11,
      width: 14,
      marginRight: 4,
    },
  });

interface HeaderIncomingProps {
  collection: CollectionDetails;
}

type HeaderProps = HeaderIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Header);
