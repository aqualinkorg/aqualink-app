import { CardIncomingProps } from './Card';
import metrics from '../../assets/img/landing-page/metrics.jpg';
import sensors from '../../assets/img/landing-page/sensors.png';
import surveyImages from '../../assets/img/landing-page/survey-images.jpg';
import map from '../../assets/img/landing-page/map.png';
import customers from '../../assets/img/landing-page/customers.jpg';

export const cardTitles: CardIncomingProps[] = [
  {
    title: 'Centralized information',
    text: 'Aqualink integrates data from sensors, models, satellite observations, surveys, images, and video to give you an instant view of your ecosystem.',
    backgroundColor: 'rgba(69, 76, 79, 0.05)',
    direction: 'row',
    image: metrics,
  },
  {
    title: 'Integrated sensors for automated data collection',
    text: 'Sofar spotter for real-time telemetry, Fathom for live underwater video, a multi-parameter sonde for water quality information, and hobo temperature logger. Additionally any data in csv format can be uploaded to Aqualink.',
    backgroundColor: '#ffffff',
    direction: 'row-reverse',
    image: sensors,
    scaleDown: true,
  },
  {
    title: 'A structured approach to survey management',
    text: 'Collect data and conduct photographic surveys in a structured way based on best practices. Create a grid of survey points and upload data and imagery to each point.',
    backgroundColor: 'rgba(69, 76, 79, 0.05)',
    direction: 'row',
    image: surveyImages,
    scaleDown: true,
  },
  {
    title: 'Open source and free to use globally',
    text: 'All of the aqualink code is open source. Let us know what we should build, or build extensions yourself. The system is provided for free by Aqualink, a philanthropic engineering organization.',
    backgroundColor: '#ffffff',
    direction: 'row-reverse',
    image: map,
    scaleDown: true,
  },
  {
    title: 'Over 6,000 sites across hundreds of organizations',
    text: '',
    backgroundColor: '#ffffff',
    direction: 'row-reverse',
    image: customers,
    scaleDown: true,
  },
];
