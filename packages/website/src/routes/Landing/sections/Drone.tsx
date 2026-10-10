import React from 'react';
import Story from '../components/Story';
import image from '../../../assets/img/dronepersp.jpg';

const story = {
  id: 'drone',
  label: 'The Aqualink drone',
  title: ['Open hardware.', 'More possibilities.'],
  text: 'An open-source autonomous surface vehicle, designed to help automate marine surveys and other field tasks. Explore the design, software and ways to contribute.',
  to: '/drones',
  link: 'Explore the drone project',
  image,
  width: 800,
  height: 348,
  alt: 'Solar-powered Aqualink autonomous surface vehicle design',
  caption: 'Autonomous surface vehicle / Design concept',
};

export default function Drone() {
  return <Story story={story} reverse hardware />;
}
