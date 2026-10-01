export interface GoaFerry {
  id: string;
  name: string;
  river: string;
  fromBank: string;
  toBank: string;
  fromLat: number; fromLng: number;
  toLat: number; toLng: number;
  operator: string;
  contact: string;
  frequency: string;
  operatingHours: string;
  fare: string;
  carFerry: boolean;
  suspended_monsoon: boolean;
  notes: string;
}

export const GOA_FERRIES: GoaFerry[] = [
  {
    id: 'querim-tiracol',
    name: 'Querim–Tiracol Ferry',
    river: 'Tiracol River',
    fromBank: 'Querim (Keri)', toBank: 'Tiracol',
    fromLat: 15.7089, fromLng: 73.7054,
    toLat: 15.7133, toLng: 73.7002,
    operator: 'Goa State Water Transport Department (GSWTD)',
    contact: '0832-2224888',
    frequency: 'Every 30 minutes',
    operatingHours: '6:00 AM – 10:00 PM',
    fare: '₹3 per person | ₹15 bike | ₹55 car',
    carFerry: true,
    suspended_monsoon: false,
    notes: 'Only link to Tiracol Fort and villages. Critical route—suspensions cause complete isolation.'
  },
  {
    id: 'siolim-chopdem',
    name: 'Siolim–Chopdem Ferry',
    river: 'Chapora River',
    fromBank: 'Siolim', toBank: 'Chopdem',
    fromLat: 15.6205, fromLng: 73.7542,
    toLat: 15.6270, toLng: 73.7493,
    operator: 'GSWTD',
    contact: '0832-2224888',
    frequency: 'Every 20 minutes',
    operatingHours: '6:00 AM – 10:30 PM',
    fare: '₹3 per person | ₹12 bike | ₹45 car',
    carFerry: true,
    suspended_monsoon: false,
    notes: 'High demand tourist route connecting North Goa beaches. Gets busy in season.'
  },
  {
    id: 'aldona-corjuem',
    name: 'Aldona–Corjuem Ferry',
    river: 'Mapusa River',
    fromBank: 'Aldona', toBank: 'Corjuem Island',
    fromLat: 15.5475, fromLng: 73.9032,
    toLat: 15.5514, toLng: 73.9012,
    operator: 'GSWTD',
    contact: '0832-2224888',
    frequency: 'Every 45 minutes',
    operatingHours: '7:00 AM – 9:00 PM',
    fare: '₹3 per person | ₹10 bike',
    carFerry: false,
    suspended_monsoon: true,
    notes: 'Small pedestrian + bike ferry. Suspended during heavy monsoon. River levels can rise dangerously.'
  },
  {
    id: 'panaji-betim',
    name: 'Panaji–Betim Ferry',
    river: 'Mandovi River',
    fromBank: 'Panaji (Old Goa Rd)', toBank: 'Betim, Bardez',
    fromLat: 15.4965, fromLng: 73.8290,
    toLat: 15.5028, toLng: 73.8247,
    operator: 'GSWTD',
    contact: '0832-2224888',
    frequency: 'Every 15 minutes',
    operatingHours: '6:00 AM – 11:00 PM',
    fare: '₹5 per person | ₹15 bike | ₹60 car',
    carFerry: true,
    suspended_monsoon: false,
    notes: 'Busiest ferry crossing in Goa. Connects Panaji to North Goa arterial roads. Long queues during peak hours.'
  },
  {
    id: 'agassaim-curca',
    name: 'Agassaim–Curca Ferry',
    river: 'Zuari River',
    fromBank: 'Agassaim', toBank: 'Curca, Ilhas',
    fromLat: 15.4339, fromLng: 73.9018,
    toLat: 15.4418, toLng: 73.8987,
    operator: 'GSWTD',
    contact: '0832-2224888',
    frequency: 'Every 30 minutes',
    operatingHours: '6:00 AM – 10:00 PM',
    fare: '₹4 per person | ₹12 bike | ₹50 car',
    carFerry: true,
    suspended_monsoon: false,
    notes: 'Alternative route to Goa Medical College without NH-4A highway congestion.'
  },
  {
    id: 'cavelossim-assolna',
    name: 'Cavelossim–Assolna Ferry',
    river: 'Sal River',
    fromBank: 'Cavelossim', toBank: 'Assolna, Quepem',
    fromLat: 15.1814, fromLng: 73.9481,
    toLat: 15.1861, toLng: 73.9428,
    operator: 'GSWTD',
    contact: '0832-2224888',
    frequency: 'Every 45 minutes',
    operatingHours: '6:30 AM – 9:30 PM',
    fare: '₹3 per person | ₹10 bike | ₹40 car',
    carFerry: true,
    suspended_monsoon: true,
    notes: 'Important link for South Goa coastal village connectivity. Monsoon suspension forces 30km road detour.'
  }
];
