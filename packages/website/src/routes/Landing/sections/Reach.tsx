import React from 'react';
import { Container } from '@mui/material';

export default function Reach() {
  return (
    <section
      className="landing-page__reach"
      aria-label="The Aqualink community"
    >
      <Container>
        <dl>
          <div>
            <dt>6,000+</dt>
            <dd>sites around the world</dd>
          </div>
          <div>
            <dt>Hundreds</dt>
            <dd>of organizations</dd>
          </div>
          <div>
            <dt>Free &amp; open</dt>
            <dd>for everyone, everywhere</dd>
          </div>
        </dl>
      </Container>
    </section>
  );
}
