import React, { useEffect, useRef } from 'react';
import { Container } from '@mui/material';
import PageButton from '../components/PageButton';

export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const motion = window.matchMedia(
      '(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 768px)',
    );
    const update = () => {
      frame.current = 0;
      const element = hero.current;
      if (!element) return;
      const { top, bottom } = element.getBoundingClientRect();
      if (!motion.matches || bottom > 0) {
        const offset = motion.matches
          ? Math.max(-32, Math.min(32, -top * 0.08))
          : 0;
        element.style.setProperty('--hero-parallax', `${offset}px`);
      }
    };
    const schedule = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    motion.addEventListener('change', schedule);
    return () => {
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
      window.removeEventListener('scroll', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <section
      ref={hero}
      className="landing-page__hero"
      aria-labelledby="landing-title"
    >
      <Container className="landing-page__hero-content">
        <h1 id="landing-title">
          A clearer picture.
          <br />A healthier ocean.
        </h1>
        <p className="landing-page__hero-description">
          Understand your marine ecosystem with satellite data, connected
          sensors and field surveys. Free tools for the people protecting our
          ocean.
        </p>
        <div className="landing-page__actions">
          <PageButton to="/map">View the map</PageButton>
          <PageButton to="/register" outlined>
            Register your site
          </PageButton>
        </div>
        <p className="landing-page__hero-note">
          Satellite data. Local knowledge. One connected ocean.
        </p>
      </Container>
    </section>
  );
}
