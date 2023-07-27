import React from 'react';
import { Grid, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

const links = [
  { title: 'MAP', to: '/map' },
  { title: 'ABOUT', to: '/about' },
  { title: 'REGISTER YOUR SITE', to: '/register' },
];

const RouteButtons = () => {
  return (
    <Grid container justifyContent="space-evenly" item xs={12} sm={7} md={4}>
      {links.map(({ title, to }) => (
        <Grid item key={title}>
          <Button style={{ color: 'white' }} component={Link} to={to}>
            {title}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default RouteButtons;
