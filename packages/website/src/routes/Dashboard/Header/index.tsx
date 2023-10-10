import React, { useState } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { CollectionDetails } from 'store/Collection/types';
import { userInfoSelector } from 'store/User/userSlice';
import { isCollectionOwner } from 'helpers/user';
import EditNameForm from './EditNameForm';

const Header = ({ collection, classes }: HeaderProps) => {
  const signedInUser = useSelector(userInfoSelector);
  const [editNameEnabled, setEditNameEnabled] = useState(false);

  return (
    <Box mt="50px">
      <Grid container alignItems="center" spacing={1}>
        {editNameEnabled ? (
          <EditNameForm
            collectionId={collection.id}
            signedInUser={signedInUser}
            initialName={collection.name}
            onClose={() => setEditNameEnabled(false)}
          />
        ) : (
          <>
            <Grid item>
              <Button component={Link} to="/map">
                <ArrowBackIcon color="primary" />
              </Button>
            </Grid>
            <Grid item>
              <Typography className={classes.name} color="textSecondary">
                {collection.name}
              </Typography>
            </Grid>
            {isCollectionOwner(signedInUser, collection) && (
              <Grid item>
                <IconButton onClick={() => setEditNameEnabled(true)}>
                  <EditIcon fontSize="small" color="primary" />
                </IconButton>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
};

const styles = () =>
  createStyles({
    name: {
      fontSize: 24,
    },
  });

interface HeaderIncomingProps {
  collection: CollectionDetails;
}

type HeaderProps = HeaderIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Header);
