interface ExampleSite {
  feature: string;
  site: string;
  location: string;
  description: string;
  linkLabel: string;
  to?: string;
  href?: string;
}

export const exampleSites: ExampleSite[] = [
  {
    feature: 'Smart Buoy',
    site: 'Fagatele Bay National Marine Sanctuary',
    location: 'American Samoa',
    description:
      'A Smart Buoy managed by Old Dominion University streams real-time temperature, waves and wind, side by side with the satellite reading.',
    linkLabel: 'Open the dashboard →',
    to: '/sites/1144',
  },
  {
    feature: 'AI assistant',
    site: 'Keahole Point',
    location: "Kona, Hawai'i",
    description:
      "Ask about heat stress or bleaching and get answers drawn from this site's own data.",
    linkLabel: 'Ask the AI →',
    to: '/sites/1006',
  },
  {
    feature: 'Surveys',
    site: 'Tamandaré',
    location: 'Pernambuco, Brazil',
    description:
      'Repeat photos from one survey point show the same coral healthy, bleached and dead in 2024.',
    linkLabel: 'See the surveys →',
    to: '/sites/3331',
  },
  {
    feature: 'Live video',
    site: 'Utopia Village',
    location: 'Utila, Honduras',
    description:
      "Six underwater cameras give a 270° view of the reef, streamed alongside the site's data.",
    linkLabel: 'Watch the reef →',
    to: '/sites/3301',
  },
  {
    feature: 'Live video',
    site: 'Coral City Camera',
    location: 'Miami, USA',
    description:
      'An urban reef in a busy port, streaming live next to its temperature record.',
    linkLabel: 'Watch the reef →',
    to: '/sites/1024',
  },
  {
    feature: 'Surveys',
    site: 'Elbow Beach',
    location: 'Bermuda',
    description:
      'Over 30 surveys from 2021 to 2024, many from the same anchor point, track the reef before, during and after the 2022 heatwave.',
    linkLabel: 'View the site →',
    to: '/sites/2943/points/558',
  },
  {
    feature: 'Coral restoration',
    site: 'Coral Gardeners Tiaia Nursery',
    location: "Mo'orea, French Polynesia",
    description:
      'A restoration nursery monitored by a Smart Buoy, with daily temperature, wave and wind data.',
    linkLabel: 'Open the dashboard →',
    to: '/sites/3358',
  },
  {
    feature: 'Coral restoration',
    site: 'Fulhadhoo',
    location: 'Maldives',
    description:
      "The Maldives Coral Institute's restoration site, with daily video highlights.",
    linkLabel: 'Open the dashboard →',
    to: '/sites/3492',
  },
  {
    feature: 'Water quality',
    site: 'Hui O Ka Wai Ola',
    location: "Maui, Hawai'i",
    description:
      'Community volunteers upload nutrient and water quality samples that graph next to temperature.',
    linkLabel: 'See the data →',
    href: 'https://highlights.aqualink.org/huiokawaiola',
  },
  {
    feature: 'Temperature loggers',
    site: 'Stanford University',
    location: 'Palau',
    description:
      'HOBO loggers across 38 sites, uploaded in batches and ready to view or download.',
    linkLabel: 'View the collection →',
    to: '/collections/779',
  },
  {
    feature: '3D models',
    site: 'Makiminato',
    location: 'Okinawa, Japan',
    description:
      'A 3D model of the reef by YUMA Inc., one of seven sites with models on their dashboards.',
    linkLabel: 'Explore the model →',
    to: '/sites/3323',
  },
  {
    feature: 'Collections',
    site: 'La Niña sensor network',
    location: 'Western Australia',
    description:
      'Smart Buoys from the Minderoo Foundation and UWA, grouped to follow one extreme event.',
    linkLabel: 'Open the collection →',
    to: '/collections/minderoo',
  },
  {
    feature: 'Reef Check surveys',
    site: 'Tai She Wan',
    location: 'Hong Kong',
    description:
      'Eight Reef Check surveys from 2005 to 2012 track species, reef composition, bleaching and human impacts at one site.',
    linkLabel: 'See the surveys →',
    to: '/sites/5795',
  },
];

export const tableHeaders = [
  'Feature',
  'Example site',
  "What you'll see",
  'Link',
];
