import React from 'react';
import { Container } from '@mui/material';
import PageButton from '../components/PageButton';

export default function Registration() {
  return (
    <section
      className="landing-page__register"
      aria-labelledby="register-title"
    >
      <Container className="landing-page__split">
        <div>
          <h2 id="register-title">
            Start with your site.
            <br />
            Connect to something bigger.
          </h2>
        </div>
        <div className="landing-page__register-action">
          <PageButton to="/register">Register your site</PageButton>
          <p>Free to use. No sensor required.</p>
        </div>
      </Container>
    </section>
  );
}
