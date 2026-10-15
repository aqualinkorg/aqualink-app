import React from 'react';
import { Container } from '@mui/material';
import PageLink from '../components/PageLink';
import DataDiagram from './DataDiagram';

const sources = [
  {
    title: 'Satellite observations',
    text: 'See daily ocean temperature and heat stress in the wider context of your site.',
    label: 'Explore the map',
    to: '/map',
    diagram: 'satellite',
  },
  {
    title: 'Connected sensors',
    text: 'Bring temperature, water quality, wind and wave measurements together in one place.',
    label: 'Connect your data',
    to: '/register',
    diagram: 'sensors',
  },
  {
    title: 'Field surveys',
    text: 'Document marine life with photographs and observations, then follow how it changes.',
    label: 'Explore field surveys',
    to: '#surveys',
    diagram: 'surveys',
  },
];

export default function Connections() {
  return (
    <section
      className="landing-page__connections"
      aria-labelledby="connections-title"
    >
      <Container>
        <div className="landing-page__split">
          <h2 id="connections-title">
            Know your ecosystem.
            <br />
            See the connections.
          </h2>
          <p>
            Ocean data is more powerful together. Aqualink connects satellite
            observations, in-water sensors and field surveys in one accessible
            place, so you can understand what is happening above and below the
            surface.
          </p>
        </div>
        <div className="landing-page__sources">
          {sources.map((source) => (
            <article key={source.title}>
              <DataDiagram type={source.diagram} />
              <h3>{source.title}</h3>
              <p>{source.text}</p>
              <PageLink to={source.to}>{source.label}</PageLink>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
