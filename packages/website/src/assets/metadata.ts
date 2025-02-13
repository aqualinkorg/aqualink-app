import { Metadata } from 'next';
import startPage from './img/meta/start_page.png';
import buoy from './img/landing-page/buoy.jpg';
import drone from './img/dronepersp.jpg';
import map from './img/meta/map.png';
import tracker from './img/meta/tracker.png';
import dashboard from './img/meta/dashboard.png';

type OGImage = Extract<
  NonNullable<Metadata['openGraph']>['images'],
  Array<unknown>
>[number];

export const startPageImage: OGImage = {
  url: startPage.src,
  alt: 'This image displays the interactive Aqualink map and the Aqualink dashboard, which are the main two parts of the Aqualink platform for coastal ocean monitoring. You can explore all of the Aqualink sites around the globe in the interactive map. The map has four layers where you can toggle between standard view, heat stress, sea surface temperature, and SST Anomaly. Each site has a dashboard that allows you to monitor your reef. It includes a map, survey feature, satellite data with wind, wave, and temperature data, heat stress alerts for coral bleaching, and graphs.',
};

export const buoyImage: OGImage = {
  url: buoy.src,
  alt: 'This image displays the Aqualink Smart Buoy which is also known as Smart Mooring Spotter. This Smart buoy is powered by solar panels and transmits data in real-time over the air. It collects wind, wave, barometric pressure and temperature from seafloor and sea surface.',
};

export const droneImage: OGImage = {
  url: drone.src,
  alt: 'This image display the Aqualink drone, which is an affordable Autonomous Surface Vehicle (ASV)',
};

export const dashboardImage: OGImage = {
  url: dashboard.src,
  alt: 'The images display the Aqualink dashboard, which allows you to monitor your reef. It includes a map, survey feature, satellite data with wind, wave, and temperature data, heat stress alerts for coral bleaching, and graphs.',
};

export const mapImage: OGImage = {
  url: map.src,
  alt: 'This image displays the interactive Aqualink map where you can explore all of the Aqualink sites around the globe. Each site has a dashboard where site managers monitor their local reefs with in situ data and survey collections combined with satellite data. The map has four layers where you can toggle between standard view, heat stress, sea surface temperature, and SST Anomaly.',
};

export const trackerImage: OGImage = {
  url: tracker.src,
  alt: "This image is a screenshot of the Aqualink map where we're tracking marine heatwaves through the heat stress layer on the map. The map indicate where heat stress is occurring and how long the area has been exposed to warmer waters. This is the most accurate way to track heat waves and bleaching events on a global scale.",
};
