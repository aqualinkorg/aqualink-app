import React from 'react';
import { Box, Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { CollectionDetails } from 'store/Collection/types';
import Header from './Header';
import BarChart from './BarChart';

const Info = ({ collection, classes }: InfoProps) => {
  return (
    <Box className={classes.root}>
      {collection.user && (
        <Header user={collection.user} nSites={collection.sites.length} />
      )}
      <BarChart collection={collection} />
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 5,
      border: `2px solid ${theme.palette.grey[200]}`,
      height: 480,
      padding: theme.spacing(3),
      marginTop: 46,
      display: 'flex',
      flexDirection: 'column',
      [theme.breakpoints.only('md')]: {
        height: 420,
      },
      [theme.breakpoints.down('sm')]: {
        height: 440,
        padding: theme.spacing(2),
      },
    },
  });

interface InfoIncomingProps {
  collection: CollectionDetails;
}

type InfoProps = InfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Info);
