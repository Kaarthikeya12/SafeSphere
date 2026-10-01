export interface GoaBeach {
  id: string;
  name: string;
  lat: number;
  lng: number;
  taluka: string;
  lifeguards: boolean;
  typicalWaveHtM: number; // typical monsoon wave height meters
  swimmingSafe: boolean;
  ripCurrentRisk: 'low' | 'medium' | 'high';
  description: string;
  nearestPolice: string;
  nearestHospital: string;
  knownHazards: string[];
}

export const GOA_BEACHES: GoaBeach[] = [
  {
    id: 'calangute',
    name: 'Calangute Beach',
    lat: 15.5439, lng: 73.7553,
    taluka: 'North Goa',
    lifeguards: true,
    typicalWaveHtM: 1.8,
    swimmingSafe: false,
    ripCurrentRisk: 'high',
    description: 'Busiest tourist beach in Goa. High rip current zones near northern end.',
    nearestPolice: 'Calangute Police Station — 0832-2277254',
    nearestHospital: 'Mapusa Sub-District Hospital — 0832-2262372',
    knownHazards: ['Rip currents', 'Overcrowding', 'Jellyfish in monsoon']
  },
  {
    id: 'baga',
    name: 'Baga Beach',
    lat: 15.5569, lng: 73.7520,
    taluka: 'North Goa',
    lifeguards: true,
    typicalWaveHtM: 1.6,
    swimmingSafe: false,
    ripCurrentRisk: 'medium',
    description: 'Party beach with strong currents in monsoon. Drishti lifeguards patrol.',
    nearestPolice: 'Calangute Police Station — 0832-2277254',
    nearestHospital: 'Mapusa Sub-District Hospital — 0832-2262372',
    knownHazards: ['Monsoon currents', 'Crowded water sports area']
  },
  {
    id: 'anjuna',
    name: 'Anjuna Beach',
    lat: 15.5741, lng: 73.7407,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 2.1,
    swimmingSafe: false,
    ripCurrentRisk: 'high',
    description: 'Rocky outcrops and hidden rip channels. Swimming NOT advised Jun–Sep.',
    nearestPolice: 'Anjuna Police Post — 0832-2274233',
    nearestHospital: 'Mapusa Sub-District Hospital — 0832-2262372',
    knownHazards: ['Rocky bottom', 'Rip channels', 'No lifeguards']
  },
  {
    id: 'vagator',
    name: 'Vagator Beach',
    lat: 15.5985, lng: 73.7371,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 2.4,
    swimmingSafe: false,
    ripCurrentRisk: 'high',
    description: 'Dramatic cliff-framed beach. Treacherous currents beneath the red cliffs.',
    nearestPolice: 'Anjuna Police Post — 0832-2274233',
    nearestHospital: 'Mapusa Sub-District Hospital — 0832-2262372',
    knownHazards: ['Cliff currents', 'No lifeguards', 'Rocky seabed']
  },
  {
    id: 'arambol',
    name: 'Arambol Beach',
    lat: 15.6882, lng: 73.7048,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 1.9,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'Calmer northern beach with a sweet freshwater lake. Safer currents.',
    nearestPolice: 'Pernem Police Station — 0832-2200144',
    nearestHospital: 'Pernem Primary Health Centre — 0832-2200288',
    knownHazards: ['Isolated area', 'No lifeguards', 'Jellyfish']
  },
  {
    id: 'morjim',
    name: 'Morjim Beach',
    lat: 15.6441, lng: 73.7236,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 1.5,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'Olive Ridley turtle nesting zone. Relatively calm waters, quiet beach.',
    nearestPolice: 'Pernem Police Station — 0832-2200144',
    nearestHospital: 'Pernem Primary Health Centre — 0832-2200288',
    knownHazards: ['Wildlife zone (turtle nests)', 'Remote location']
  },
  {
    id: 'miramar',
    name: 'Miramar Beach',
    lat: 15.4862, lng: 73.8078,
    taluka: 'North Goa (Panaji)',
    lifeguards: true,
    typicalWaveHtM: 0.9,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'City beach near Panaji, calmer waters, good infrastructure nearby.',
    nearestPolice: 'Panaji Police Station — 0832-2224488',
    nearestHospital: 'Goa Medical College Bambolim — 0832-2458725',
    knownHazards: ['Occasional jellyfish', 'Boat traffic']
  },
  {
    id: 'dona-paula',
    name: 'Dona Paula Beach',
    lat: 15.4564, lng: 73.8043,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 1.2,
    swimmingSafe: false,
    ripCurrentRisk: 'medium',
    description: 'Scenic headland beach. Strong tidal currents at the jetty point.',
    nearestPolice: 'Panaji Police Station — 0832-2224488',
    nearestHospital: 'Goa Medical College Bambolim — 0832-2458725',
    knownHazards: ['Tidal currents near jetty', 'Boat traffic', 'Rocky shore']
  },
  {
    id: 'colva',
    name: 'Colva Beach',
    lat: 15.2792, lng: 73.9227,
    taluka: 'South Goa',
    lifeguards: true,
    typicalWaveHtM: 1.4,
    swimmingSafe: true,
    ripCurrentRisk: 'medium',
    description: 'Long wide beach in South Goa. Better managed, Drishti patrols active.',
    nearestPolice: 'Margao Police Station — 0832-2705020',
    nearestHospital: 'South Goa District Hospital Margao — 0832-2705664',
    knownHazards: ['Unexpected currents', 'Fishing boat traffic']
  },
  {
    id: 'benaulim',
    name: 'Benaulim Beach',
    lat: 15.2568, lng: 73.9231,
    taluka: 'South Goa',
    lifeguards: true,
    typicalWaveHtM: 1.3,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'Quiet South Goa beach, relatively safe with gentle waves outside monsoon.',
    nearestPolice: 'Benaulim Police Post — 0832-2770128',
    nearestHospital: 'South Goa District Hospital Margao — 0832-2705664',
    knownHazards: ['Monsoon surf', 'Jellyfish']
  },
  {
    id: 'palolem',
    name: 'Palolem Beach',
    lat: 15.0100, lng: 74.0232,
    taluka: 'South Goa (Canacona)',
    lifeguards: false,
    typicalWaveHtM: 0.8,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'Crescent-shaped bay, generally calmest beach in Goa. Great for swimming.',
    nearestPolice: 'Canacona Police Station — 0832-2643220',
    nearestHospital: 'Canacona PHC — 0832-2643222',
    knownHazards: ['Boat taxis crossing zone', 'Remote location if emergency']
  },
  {
    id: 'agonda',
    name: 'Agonda Beach',
    lat: 15.0467, lng: 73.9946,
    taluka: 'South Goa (Canacona)',
    lifeguards: false,
    typicalWaveHtM: 1.0,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'Pristine quiet beach. Turtle nesting area. Safe waters, very remote.',
    nearestPolice: 'Canacona Police Station — 0832-2643220',
    nearestHospital: 'Canacona PHC — 0832-2643222',
    knownHazards: ['Remote location', 'Wildlife nesting zone', 'No lifeguards']
  },
  {
    id: 'patnem',
    name: 'Patnem Beach',
    lat: 15.0182, lng: 74.0185,
    taluka: 'South Goa',
    lifeguards: false,
    typicalWaveHtM: 0.9,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'Small crescent beach adjacent to Palolem. Calm and family friendly.',
    nearestPolice: 'Canacona Police Station — 0832-2643220',
    nearestHospital: 'Canacona PHC — 0832-2643222',
    knownHazards: ['No lifeguards', 'Remote location']
  },
  {
    id: 'majorda',
    name: 'Majorda Beach',
    lat: 15.3007, lng: 73.9071,
    taluka: 'South Goa',
    lifeguards: false,
    typicalWaveHtM: 1.5,
    swimmingSafe: false,
    ripCurrentRisk: 'medium',
    description: 'Long open beach prone to rip currents. Few tourists, minimal safety infrastructure.',
    nearestPolice: 'Margao Police Station — 0832-2705020',
    nearestHospital: 'South Goa District Hospital Margao — 0832-2705664',
    knownHazards: ['Rip currents', 'No lifeguards', 'Isolated stretches']
  },
  {
    id: 'mandrem',
    name: 'Mandrem Beach',
    lat: 15.6613, lng: 73.7173,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 1.7,
    swimmingSafe: false,
    ripCurrentRisk: 'medium',
    description: 'Peaceful, less crowded beach. Can have strong monsoon surf.',
    nearestPolice: 'Pernem Police Station — 0832-2200144',
    nearestHospital: 'Pernem Primary Health Centre — 0832-2200288',
    knownHazards: ['Strong surf in monsoon', 'No lifeguards', 'Remote area']
  },
  {
    id: 'ashwem',
    name: 'Ashwem Beach',
    lat: 15.6756, lng: 73.7109,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 1.9,
    swimmingSafe: false,
    ripCurrentRisk: 'medium',
    description: 'Quiet beach north of Mandrem. Good for sunsets, dangerous for swimming.',
    nearestPolice: 'Pernem Police Station — 0832-2200144',
    nearestHospital: 'Pernem Primary Health Centre — 0832-2200288',
    knownHazards: ['Rip currents', 'No lifeguards', 'Isolated']
  },
  {
    id: 'querim',
    name: 'Querim (Keri) Beach',
    lat: 15.7105, lng: 73.7028,
    taluka: 'North Goa',
    lifeguards: false,
    typicalWaveHtM: 2.0,
    swimmingSafe: false,
    ripCurrentRisk: 'high',
    description: 'Northernmost beach in Goa, near Tiracol Fort. Strong currents at river mouth.',
    nearestPolice: 'Pernem Police Station — 0832-2200144',
    nearestHospital: 'Pernem Primary Health Centre — 0832-2200288',
    knownHazards: ['River mouth currents', 'Very remote', 'No lifeguards', 'Wildlife']
  },
  {
    id: 'betalbatim',
    name: 'Betalbatim Beach',
    lat: 15.3250, lng: 73.9012,
    taluka: 'South Goa',
    lifeguards: false,
    typicalWaveHtM: 1.6,
    swimmingSafe: false,
    ripCurrentRisk: 'medium',
    description: 'Rocky and isolated South Goa beach. Prone to surprise currents.',
    nearestPolice: 'Margao Police Station — 0832-2705020',
    nearestHospital: 'South Goa District Hospital Margao — 0832-2705664',
    knownHazards: ['Rocky seabed', 'Strong currents', 'Isolated location']
  },
  {
    id: 'galgibag',
    name: 'Galgibag Beach',
    lat: 14.9811, lng: 74.0441,
    taluka: 'South Goa (Canacona)',
    lifeguards: false,
    typicalWaveHtM: 1.1,
    swimmingSafe: true,
    ripCurrentRisk: 'low',
    description: 'Pristine turtle nesting beach, very remote. One of Goa\'s cleanest beaches.',
    nearestPolice: 'Canacona Police Station — 0832-2643220',
    nearestHospital: 'Canacona PHC — 0832-2643222',
    knownHazards: ['Extremely remote', 'No facilities', 'Wildlife zone']
  },
  {
    id: 'sinquerim',
    name: 'Sinquerim Beach',
    lat: 15.5190, lng: 73.7674,
    taluka: 'North Goa',
    lifeguards: true,
    typicalWaveHtM: 1.5,
    swimmingSafe: false,
    ripCurrentRisk: 'medium',
    description: 'Near Aguada Fort. Water sports hub, mixed currents, patrolled shore.',
    nearestPolice: 'Calangute Police Station — 0832-2277254',
    nearestHospital: 'Mapusa Sub-District Hospital — 0832-2262372',
    knownHazards: ['Water sports collision risk', 'Rip currents', 'Boat traffic']
  }
];
