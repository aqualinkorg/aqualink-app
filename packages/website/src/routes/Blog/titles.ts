interface Story {
  title: string;
  location: string;
  tag: string;
  summary: string;
  href: string;
}

export const stories: Story[] = [
  {
    title: 'Fernando de Noronha Archipelago',
    location: 'Brazil',
    tag: 'Smart Buoy',
    summary:
      "A Smart Buoy turns one or two measurements a year into a continuous record for Brazil's oceanic islands.",
    href: 'https://highlights.aqualink.org/stories/fernando-de-noronha-archipelago',
  },
  {
    title: 'Wellington Reef',
    location: 'Galápagos, Ecuador',
    tag: 'Heatwave',
    summary:
      'The last structural reef in the Galápagos, and the heatwave it lived through in March 2022.',
    href: 'https://highlights.aqualink.org/stories/wellington-reef-galapagos-islands',
  },
  {
    title: 'Palos Verdes Reef',
    location: 'California, USA',
    tag: 'Tides and temperature',
    summary:
      'How tides drive seafloor temperature on a newly built restoration reef.',
    href: 'https://highlights.aqualink.org/stories/palos-verdes-reef-california',
  },
  {
    title: 'Elbow Beach',
    location: 'Bermuda',
    tag: 'Citizen science',
    summary:
      'One free-diver, a GoPro and a reef that stayed above the bleaching threshold for six weeks.',
    href: 'https://highlights.aqualink.org/stories/elbow-beach-bermuda',
  },
  {
    title: 'Ningaloo Reef',
    location: 'Western Australia',
    tag: 'Coral restoration',
    summary:
      'Environmental drivers of coral restoration success. By Camille Grimaldi, March 25, 2024.',
    href: 'https://highlights.aqualink.org/stories/ningaloo-reef-australia',
  },
  {
    title: 'Coral Vita',
    location: 'Grand Bahama, Bahamas',
    tag: 'Coral farming',
    summary:
      'A land-based coral farm that uses live data to decide when it is safe to plant.',
    href: 'https://highlights.aqualink.org/stories/coral-vita-bahamas',
  },
];

export const tableHeaders = ['Story', 'Location', 'Summary', ''];
