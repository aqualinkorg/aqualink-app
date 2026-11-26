import React from 'react';
import { ReactComponent as SatelliteIcon } from 'assets/img/landing-page/icon-satellite.svg';
import { ReactComponent as SensorIcon } from 'assets/img/landing-page/icon-sensor.svg';
import { ReactComponent as CameraIcon } from 'assets/img/landing-page/icon-camera.svg';
import { ReactComponent as ChartIcon } from 'assets/img/landing-page/icon-chart.svg';
import { ReactComponent as BookIcon } from 'assets/img/landing-page/icon-book.svg';
import { ReactComponent as LightbulbIcon } from 'assets/img/landing-page/icon-lightbulb.svg';
import { CardIncomingProps } from './Card';

export type SearchFieldName = 'heatStress' | 'siteOptions';

interface SearchField {
  id: string;
  name: SearchFieldName;
  label: string;
  options: { value: string; label: string }[];
}

export const searchFields: SearchField[] = [
  {
    id: 'hero-alert',
    name: 'heatStress',
    label: 'Alert level',
    options: [
      { value: '', label: 'Any level' },
      { value: '0', label: 'No alert' },
      { value: '1', label: 'Watch' },
      { value: '2', label: 'Warning' },
      { value: '3', label: 'Alert level 1' },
      { value: '4', label: 'Alert level 2' },
    ],
  },
  {
    id: 'hero-sensor',
    name: 'siteOptions',
    label: 'Sensor type',
    options: [
      { value: '', label: 'Any sensor' },
      { value: 'activeBuoys', label: 'Smart Buoy' },
      { value: 'hoboLoggers', label: 'Temperature logger' },
      { value: 'waterQuality', label: 'Water quality sonde' },
      { value: 'liveStreams', label: 'Live video' },
    ],
  },
];

export const facts = [
  { value: '6,000+', label: 'sites monitored worldwide' },
  { value: 'Daily', label: 'satellite temperature and heat stress' },
  { value: 'Hundreds', label: 'of universities, NGOs and start-ups' },
  { value: '$0', label: 'free to use, open source code' },
];

export const cardTitles: CardIncomingProps[] = [
  {
    title: 'Satellite',
    text: 'Daily sea surface temperature, wind and waves, with heat stress and bleaching alerts calculated for you.',
    tag: 'Automatic for every site',
    icon: SatelliteIcon,
  },
  {
    title: 'In-water sensors',
    text: 'Live streams from Sofar Spotter buoys and live video, or upload batches from sondes, HOBO loggers or any CSV.',
    tag: 'Graphs build themselves',
    icon: SensorIcon,
  },
  {
    title: 'Field surveys',
    text: 'Upload photos and notes to fixed survey points, or run a full Reef Check survey that lands on your dashboard.',
    tag: 'See how the reef responds',
    icon: CameraIcon,
  },
];

export const dashboardFeatures = [
  'Heat stress level, 7-day trend and historical maximum at a glance',
  'Satellite and buoy temperatures side by side',
  'Live underwater video where a camera is installed',
  'Group sites into a collection to follow a heatwave or a region',
];

export const aiSteps: {
  title: string;
  text: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    title: "Reads your site's data",
    text: 'Satellite temperature and heat stress, buoy and water quality readings, wind and waves, surveys and 90 days of history.',
    icon: ChartIcon,
  },
  {
    title: 'Adds what the world has learned',
    text: 'Decades of coral science, bleaching response protocols and survey best practice, plus the local context around your reef.',
    icon: BookIcon,
  },
  {
    title: 'Tells you what to do next',
    text: 'Clear answers on risk and next steps for your site, and an honest note when the data is thin or uncertain.',
    icon: LightbulbIcon,
  },
];

export const partnerGroups = [
  {
    title: 'Universities',
    names:
      'University of Western Australia, Stanford, Florida State, UC Santa Barbara, University of Guam, University of Malaya',
  },
  {
    title: 'NGOs',
    names:
      'The Nature Conservancy, Minderoo Foundation, Reef Check, CARMABI, Beneath the Waves',
  },
  {
    title: 'Start-ups',
    names:
      'Coral Gardeners, Coral Vita, Project Vesta, Crystal Blue, coralive.org',
  },
];

export const startSteps = [
  {
    number: '01',
    title: 'Create a free account',
    text: 'Takes a minute, no cost ever.',
  },
  {
    number: '02',
    title: 'Register your site',
    text: 'Drop a pin and your dashboard starts filling with satellite data.',
  },
  {
    number: '03',
    title: 'Add sensors and surveys',
    text: 'Whenever you are ready, for a fuller picture.',
  },
];
