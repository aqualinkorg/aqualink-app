import React from 'react';
import { Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageLink from '../components/PageLink';

export default function Science() {
  return (
    <section className="landing-page__science" aria-labelledby="science-title">
      <Container className="landing-page__split">
        <h2 id="science-title">
          Open science.
          <br />
          Shared possibility.
        </h2>
        <div>
          <p>
            Aqualink is a philanthropic engineering organization. Our platform
            is free to use globally, and our code is open source. Bring your
            observations, shape what we build, or create an extension of your
            own.
          </p>
          <PageLink to="https://github.com/aqualinkorg/aqualink-app">
            Explore our open-source code
            <ArrowForwardIcon />
          </PageLink>
        </div>
      </Container>
    </section>
  );
}
