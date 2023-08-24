import React from 'react';
import { Grid, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

const links = [
  { title: 'Map', to: '/map' },
  { title: 'Track a Heatwave', to: '/tracker' },
  { title: 'Register your Site', to: '/register' },
  { title: 'Highlighted Sites', href: 'https://highlights.aqualink.org/' },
  { title: 'FAQ', to: '/faq' },
];

const RouteButtons = () => {
  return (
    <Grid container justify="space-evenly" item xs={12} sm={7} md={6}>
      {links.map(({ title, to, href }) => (
        <Grid item key={title}>
          <Button
            style={{ color: 'white' }}
            component={to ? Link : 'a'}
            to={to || ''}
            href={href || to}
            target={href ? '_blank' : undefined}
            rel={href ? 'noopener' : undefined}
          >
            {title}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default RouteButtons;
