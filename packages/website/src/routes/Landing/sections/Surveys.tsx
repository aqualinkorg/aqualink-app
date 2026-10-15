import React from 'react';
import Story from '../components/Story';
import image from '../../../assets/img/reef1.jpg';

const story = {
  id: 'surveys',
  label: '',
  title: ['Bring the reef', 'into focus.'],
  text: 'Organize photographic surveys, document change and connect what you see to the conditions your ecosystem is experiencing.',
  to: '/register',
  link: 'Start monitoring your site',
  image,
  width: 800,
  height: 546,
  alt: 'A diver surveying branching coral and marine life',
  caption: 'Photographic surveys / Aqualink field imagery',
};

export default function Surveys() {
  return <Story story={story} reverse mist />;
}
