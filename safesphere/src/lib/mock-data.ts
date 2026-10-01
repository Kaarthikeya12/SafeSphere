export interface LocationCoordinate {
  lat: number;
  lng: number;
  name: string;
  landmark?: string;
}

export interface CommunityResponder {
  id: string;
  name: string;
  role: 'Campus Security' | 'Student Guardian' | 'Local Resident' | 'EMT Volunteer' | 'Goa Police Cadet';
  phone: string;
  lat: number;
  lng: number;
  currentStatus: 'available' | 'responding' | 'offline';
  rating: number;
  distanceKm?: number;
  etaMinutes?: number;
  verified: boolean;
  avatar: string;
}

export interface SafeHavenZone {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'campus_post' | 'safe_business' | 'rip_current_danger';
  lat: number;
  lng: number;
  description: string;
  open24x7: boolean;
  contactNumber?: string;
}

export const GOA_LOCATIONS: LocationCoordinate[] = [
  {
    name: 'GEC Farmagudi Campus, Ponda',
    landmark: 'Civil Engineering Dept / Hostel Quad',
    lat: 15.4227,
    lng: 74.0089,
  },
  {
    name: 'Ponda Old Bus Stand & Market',
    landmark: 'Near Tisk Junction',
    lat: 15.4026,
    lng: 74.0152,
  },
  {
    name: 'Miramar Beach & Coastal Promenade, Panjim',
    landmark: 'Near Youth Hostel',
    lat: 15.4862,
    lng: 73.8078,
  },
  {
    name: 'Calangute Tourist Belt & Beach',
    landmark: 'North Goa Coastal Police Outpost',
    lat: 15.5439,
    lng: 73.7553,
  },
  {
    name: 'Goa Medical College (GMC), Bambolim',
    landmark: 'Emergency Trauma Ward Gate',
    lat: 15.4619,
    lng: 73.8560,
  },
  {
    name: 'Margao Railway Station Junction',
    landmark: 'Platform 1 South Goa Exit',
    lat: 15.2736,
    lng: 73.9582,
  },
  {
    name: 'Khandepar - Curti Hill Stretch',
    landmark: 'Isolated Highway Curve',
    lat: 15.4295,
    lng: 74.0321,
  }
];

export const INITIAL_RESPONDERS: CommunityResponder[] = [
  {
    id: 'resp-1',
    name: 'Rohan Naik',
    role: 'Campus Security',
    phone: '+91 98221 44512',
    lat: 15.4235,
    lng: 74.0098,
    currentStatus: 'available',
    rating: 4.9,
    distanceKm: 0.2,
    etaMinutes: 2,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'resp-2',
    name: 'Dr. Shruti Sawant',
    role: 'EMT Volunteer',
    phone: '+91 97645 88210',
    lat: 15.4215,
    lng: 74.0062,
    currentStatus: 'available',
    rating: 5.0,
    distanceKm: 0.4,
    etaMinutes: 3,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1594824813627-81d3f9b2d398?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'resp-3',
    name: 'Jared Furtado',
    role: 'Student Guardian',
    phone: '+91 88301 22914',
    lat: 15.4241,
    lng: 74.0079,
    currentStatus: 'available',
    rating: 4.8,
    distanceKm: 0.3,
    etaMinutes: 2,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'resp-4',
    name: 'PSI Santosh Gaonkar',
    role: 'Goa Police Cadet',
    phone: '+91 98229 11200',
    lat: 15.4020,
    lng: 74.0160,
    currentStatus: 'available',
    rating: 4.9,
    distanceKm: 2.1,
    etaMinutes: 5,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces'
  }
];

export const SAFE_HAVENS: SafeHavenZone[] = [
  {
    id: 'haven-1',
    name: 'GEC Main Security Gate Post',
    type: 'campus_post',
    lat: 15.4222,
    lng: 74.0075,
    description: '24/7 Security guard outpost with emergency intercom and high-lux lighting',
    open24x7: true,
    contactNumber: '0832-2399100'
  },
  {
    id: 'haven-2',
    name: 'Ponda Sub-District Hospital Casualty',
    type: 'hospital',
    lat: 15.4060,
    lng: 74.0180,
    description: 'Emergency ICU, 108 ambulance hub, 24/7 trauma response',
    open24x7: true,
    contactNumber: '0832-2312225'
  },
  {
    id: 'haven-3',
    name: 'Ponda Police Station (PCR Base)',
    type: 'police',
    lat: 15.4010,
    lng: 74.0165,
    description: 'Sub-divisional police headquarters with mobile PCR patrol vans',
    open24x7: true,
    contactNumber: '0832-2312121'
  },
  {
    id: 'haven-4',
    name: 'Farmagudi 24/7 Chemist & Convenience',
    type: 'safe_business',
    lat: 15.4208,
    lng: 74.0095,
    description: 'CCTV-monitored safe shelter zone for stranded students',
    open24x7: true,
    contactNumber: '+91 94220 55198'
  }
];
