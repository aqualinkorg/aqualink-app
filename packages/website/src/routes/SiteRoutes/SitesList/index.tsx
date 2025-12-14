import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { List, ListItemText, Theme } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { Link } from 'react-router-dom';

import { sitesListSelector, sitesRequest } from 'store/Sites/sitesListSlice';

function SitesList({ classes }: SitesListProps) {
  const sitesList = useSelector(sitesListSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(sitesRequest());
  }, [dispatch]);

  return (
    <div className={classes.root}>
      <List component="nav">
        {sitesList?.map((site) => (
          <Link
            key={`site-list-item-${site.id}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
            to={`/sites/${site.id}`}
          >
            <ListItemButton>
              <ListItemText style={{ color: 'white' }} primary={site.name} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </div>
  );
}

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
