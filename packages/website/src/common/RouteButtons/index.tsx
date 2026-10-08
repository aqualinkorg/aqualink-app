import React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './RouteButtons.scss';

const links = [
  { title: 'Map', to: '/map' },
  { title: 'Highlighted sites', href: 'https://highlights.aqualink.org/' },
  { title: 'Heatwave', to: '/tracker' },
  { title: 'Bristlemouth', href: 'https://bristlemouth.aqualink.org' },
];

function RouteButtons({ compact = false }: { compact?: boolean }) {
  return (
    <nav className="route-buttons" aria-label="Main navigation">
      {links
        .filter(({ title }) => !compact || title !== 'Bristlemouth')
        .map(({ title, to, href }) => (
          <Button
            key={title}
            component={to ? Link : 'a'}
            to={to}
            href={href}
            target={href ? '_blank' : undefined}
            rel={href ? 'noopener noreferrer' : undefined}
          >
            {title}
          </Button>
        ))}
    </nav>
  );
}

export default RouteButtons;
