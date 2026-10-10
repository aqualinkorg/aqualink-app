import React from 'react';
import Story from '../components/Story';
import image from '../../../assets/img/landing-page/buoy.jpg';

const story = {
  id: 'buoy',
  label: 'The Aqualink buoy',
  title: ['From the surface', 'to the seafloor.'],
  text: 'Collect data automatically with connected sensors, or upload your own CSV files. Temperature, water quality and visual observations—all in one place.',
  to: '/buoy',
  link: 'Explore the Aqualink buoy',
  image,
  width: 720,
  height: 570,
  alt: 'Yellow Aqualink smart buoy monitoring the ocean off a rocky coastline',
  caption: 'Aqualink smart buoy / Sofar Spotter',
};

export default function Buoy() {
  return <Story story={story} />;
}
