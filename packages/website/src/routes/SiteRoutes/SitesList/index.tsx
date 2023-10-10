import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  List,
  ListItem,
  ListItemText,
  createStyles,
  withStyles,
  WithStyles,
  Theme,
} from '@material-ui/core';
import { Link } from 'react-router-dom';

import { sitesListSelector, sitesRequest } from 'store/Sites/sitesListSlice';

const SitesList = ({ classes }: SitesListProps) => {
  const sitesList = useSelector(sitesListSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(sitesRequest());
  }, [dispatch]);

  return (
    <>
      <div className={classes.root}>
        <List component="nav">
          {sitesList?.map((site) => (
            <Link
              key={`site-list-item-${site.id}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
              to={`/sites/${site.id}`}
            >
              <ListItem button>
                <ListItemText style={{ color: 'white' }} primary={site.name} />
              </ListItem>
            </Link>
          ))}
        </List>
      </div>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.primary.dark,
    },
  });

type SitesListProps = WithStyles<typeof styles>;

export default withStyles(styles)(SitesList);
