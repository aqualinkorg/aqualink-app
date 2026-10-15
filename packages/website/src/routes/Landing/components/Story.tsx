import React from 'react';
import { Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import classNames from 'classnames';
import PageLink from './PageLink';

interface StoryProps {
  story: {
    id: string;
    label: string;
    title: string[];
    text: string;
    to: string;
    link: string;
    image: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
  };
  reverse?: boolean;
  mist?: boolean;
  hardware?: boolean;
}

export default function Story({
  story,
  reverse = false,
  mist = false,
  hardware = false,
}: StoryProps) {
  return (
    <section
      id={story.id}
      className={classNames('landing-page__story', {
        'landing-page__story--reverse': reverse,
        'landing-page__story--mist': mist,
      })}
      aria-labelledby={`${story.id}-title`}
    >
      <Container className="landing-page__split">
        <figure className={hardware ? 'landing-page__hardware' : undefined}>
          <img
            src={story.image}
            width={story.width}
            height={story.height}
            alt={story.alt}
            loading="lazy"
          />
          <figcaption>{story.caption}</figcaption>
        </figure>
        <div className="landing-page__story-copy">
          {story.label && <p className="landing-page__label">{story.label}</p>}
          <h2 id={`${story.id}-title`}>
            {story.title[0]}
            <br />
            {story.title[1]}
          </h2>
          <p>{story.text}</p>
          <PageLink to={story.to}>
            {story.link}
            <ArrowForwardIcon />
          </PageLink>
        </div>
      </Container>
    </section>
  );
}
