import React from 'react';
import { Container } from '@mui/material';
import PageLink from '../components/PageLink';

const footerGroups = [
  {
    title: 'Explore',
    links: [
      ['Map', '/map'],
      ['Highlighted sites', 'https://highlights.aqualink.org/'],
      ['Heatwave tracker', '/tracker'],
    ],
  },
  {
    title: 'Aqualink',
    links: [
      ['About us', '/about'],
      ['The Aqualink buoy', '/buoy'],
      ['Bristlemouth', 'https://bristlemouth.aqualink.org'],
    ],
  },
  {
    title: 'Get involved',
    links: [
      ['Register a site', '/register'],
      ['Open-source code', 'https://github.com/aqualinkorg/aqualink-app'],
      ['Contact us', 'https://highlights.aqualink.org/contact-us'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="landing-page__footer">
      <Container>
        <div className="landing-page__footer-grid">
          <div>
            <PageLink to="/" className="landing-page__wordmark">
              Aqualink
            </PageLink>
            <p>
              Monitoring for marine ecosystems.
              <br />A tool for the people protecting our ocean.
            </p>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              {group.links.map(([label, to]) => (
                <PageLink key={to} to={to}>
                  {label}
                </PageLink>
              ))}
            </nav>
          ))}
        </div>
        <div className="landing-page__footer-bottom">
          <p>Aqualink / Free and open ocean monitoring</p>
          <PageLink to="/terms">Terms of use</PageLink>
        </div>
      </Container>
    </footer>
  );
}
