import dashboardImage from '../../assets/img/landing-page/dashboard.jpg';
import smartBuoyImage from '../../assets/img/projects-page/smart-buoy.jpg';
import bristlemouthImage from '../../assets/img/projects-page/bristlemouth.png';
import droneImage from '../../assets/img/projects-page/drone.jpg';
import houseOfFishImage from '../../assets/img/projects-page/house-of-fish.jpg';

interface ProjectLink {
  label: string;
  to?: string;
  href?: string;
}

interface Project {
  title: string;
  tag: string;
  description: string;
  image: string;
  imageAlt: string;
  imageStyle?: 'contain' | 'poster';
  links: ProjectLink[];
}

export const projects: Project[] = [
  {
    title: 'Aqualink app',
    tag: 'Monitoring platform',
    description:
      "A free application for monitoring your reef. Each site brings satellite temperature, Smart Buoy readings, heat stress alerts and diver surveys together on one dashboard, with an AI assistant that answers questions using the site's own data.",
    image: dashboardImage,
    imageAlt: 'Aqualink site dashboard with temperature charts',
    links: [{ label: 'Open the map →', to: '/map' }],
  },
  {
    title: 'Smart Mooring program',
    tag: 'Hardware',
    description:
      'We deploy Smart Moorings throughout the planet alongside partners. A solar-powered Spotter buoy with a seafloor sensor gives reef teams real-time water temperature, plus dissolved oxygen, acoustics and other data.',
    image: smartBuoyImage,
    imageAlt: 'Yellow solar-powered Spotter buoy floating at sea',
    links: [{ label: 'About the buoy →', to: '/buoy' }],
  },
  {
    title: 'Bristlemouth Explorer',
    tag: 'Sensor data',
    description:
      'Bristlemouth is an open standard for plug-and-play marine hardware: one connector that works for the whole ocean. Aqualink is a strategic partner, and the Explorer shows live data from Bristlemouth sensors on Smart Moorings. It is a development tool that helps you inspect the data.',
    image: bristlemouthImage,
    imageAlt: 'Bristlemouth connectors, logo and circuit board',
    imageStyle: 'contain',
    links: [
      {
        label: 'Open the explorer →',
        href: 'https://bristlemouth.aqualink.org',
      },
    ],
  },
  {
    title: 'Open-source drone',
    tag: 'Open hardware',
    description:
      'A DIY kit for building a solar-powered surface drone, built on Pixhawk and ROS, with an NVIDIA Jetson for machine vision and sonar for depth. Electronics and motors cost under $2,500.',
    image: droneImage,
    imageAlt: 'Yellow solar-powered autonomous surface drone',
    links: [
      { label: 'About the drone →', to: '/drones' },
      { label: 'Code on GitHub →', href: 'https://github.com/aqualinkorg/asv' },
    ],
  },
  {
    title: 'House of Fish',
    tag: 'Documentary film',
    description:
      'A film by Santiago Burin des Roziers, made in association with Aqualink. To block trawlers and rebuild marine habitats, fisherman Paolo Fanciulli and local artisans installed concrete blocks and 44 carved marble sculptures underwater, creating an art museum in the sea near Talamone, Italy.',
    image: houseOfFishImage,
    imageAlt:
      'House of Fish film poster: a fisherman in a green jacket, a crane barge at sunset and marble sculptures underwater',
    imageStyle: 'poster',
    links: [
      {
        label: 'Film website →',
        href: 'https://vimeo.com/1165618582?fl=pl&fe=sh',
      },
    ],
  },
];

export const tableHeaders = ['', 'Project', 'What it does', 'Links'];
