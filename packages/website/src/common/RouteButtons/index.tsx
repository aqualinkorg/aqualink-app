import { Grid, Button } from '@mui/material';
import Link from 'next/link';

const links = [
  { title: 'Map', to: '/map' },
  { title: 'Register your Site', to: '/register' },
  { title: 'Highlighted Sites', href: 'https://highlights.aqualink.org/' },
  { title: 'Heatwave', to: '/tracker' },
  {
    title: 'Bristlemouth',
    href: 'https://bristlemouth.aqualink.org',
  },
];

const RouteButtons = () => {
  return (
    <Grid container justifyContent="space-evenly" item xs={12} sm={7} md={6}>
      {links.map(({ title, to, href }) => (
        <Grid item key={title}>
          <Button
            style={{ color: 'white' }}
            component={to ? Link : 'a'}
            // href={to || ''}
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
