import React from 'react';
import { Grid, IconButton, Typography } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';

import { Site } from '../../../store/Sites/types';

const Header = ({ site }: HeaderProps) => (
  <Grid container alignItems="center" spacing={1}>
    <Grid item>
      <IconButton color="primary" component={Link} to={`/sites/${site.id}`}>
        <ArrowBackIcon />
      </IconButton>
    </Grid>
    <Grid item>
      <Typography variant="h5">Upload Data</Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="h6">
        You&apos;re about to upload data for the following parameters: site “
        {site.name}”.
      </Typography>
      <Typography variant="h6">
        Please confirm survey point and sensor type to continue.
      </Typography>
    </Grid>
  </Grid>
);

interface HeaderProps {
  site: Site;
}

export default Header;
