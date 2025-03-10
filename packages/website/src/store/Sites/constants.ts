export const siteFilterOptions = {
  heatStressStatus: [
    { value: 3, label: 'Alert Level 1' },
    { value: 4, label: 'Alert Level 2' },
    { value: 2, label: 'Warning' },
    { value: 1, label: 'Watch' },
    { value: 0, label: 'No Alert' },
  ],
  siteOptions: [
    { value: 'activeBuoys', label: 'Active buoys' },
    { value: '3DModels', label: '3D Models' },
    { value: 'hoboLoggers', label: 'HOBO loggers' },
    { value: 'liveStreams', label: 'Live streams' },
    { value: 'reefCheckSites', label: 'Reef Check Sites' },
    { value: 'waterQuality', label: 'Water quality' },
  ],
  species: {
    fish: [
      'Algae-farming Damsel',
      'Barramundi Cod',
      'Bumphead Parrot',
      'Butterflyfish',
      'Camotillo',
      'Giant Hawkfish',
      'Grunt',
      'Grouper',
      'Haemulidae',
      'King Angelfish',
      'Mexican Hogfish',
      'Moray Eel',
      'Parrotfish',
      'Snapper',
      'Wrasse',
    ],
    invertebrates: [
      'Banded Coral Shrimp',
      'COTS',
      'Cowries',
      'Diadema',
      'Edible Sea Cucumber',
      'Flamingo Tongue',
      'Giant Clam',
      'Gorgonian',
      'Lobster',
      'Pencil Urchin',
      'Sea Fan',
      'Sea Star',
      'Spider Crab',
      'Triton',
      'Tripneustes',
      'Urchin',
    ],
    rareAnimals: ['Lionfish', 'Mantas', 'Sharks', 'Turtles'],
  },
  reefComposition: [
    { value: 'FS', label: 'Fleshy Seaweed' },
    { value: 'HC', label: 'Hard Coral' },
    { value: 'HC/B', label: 'Hard Coral Bleaching' },
    { value: 'HC/D', label: 'Hard Coral Disease' },
    { value: 'NIA', label: 'Nutrient indicator Algea' },
    { value: 'RC', label: 'Rock' },
    { value: 'RKC', label: 'Recently Killed Coral' },
    { value: 'RB', label: 'Rubble' },
    { value: 'SD', label: 'Sand' },
    { value: 'SI', label: 'Silt/Clay' },
    { value: 'SC', label: 'Soft Coral' },
    { value: 'SP', label: 'Sponge' },
    { value: 'OT', label: 'Other' },
  ],
  impact: ['None', 'Low', 'Medium', 'High'],
} as const;
