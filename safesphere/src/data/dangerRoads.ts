export interface DangerRoad {
  id: string;
  name: string;
  stretch: string;
  lat: number; lng: number;
  fromLat: number; fromLng: number;
  toLat: number; toLng: number;
  riskLevel: 'extreme' | 'high' | 'medium';
  reasons: string[];
  monsoonWorse: boolean;
  recommendedAction: string;
  localTip: string;
}

export const DANGER_ROADS: DangerRoad[] = [
  {
    id: 'nh4a-khandepar',
    name: 'NH-4A — Khandepar Ghats Section',
    stretch: 'Khandepar to Valpoi, Sattari Taluka',
    lat: 15.4371, lng: 74.1088,
    fromLat: 15.4295, fromLng: 74.0321,
    toLat: 15.5102, toLng: 74.1540,
    riskLevel: 'extreme',
    reasons: ['Zero network coverage zones', 'Blind hairpin bends', 'Always flooded culverts in monsoon', 'Wildlife crossing (leopard, bison)', 'No shoulder or crash barrier'],
    monsoonWorse: true,
    recommendedAction: 'Avoid night travel. Share your route before entering. Carry fuel, water, and a physical map.',
    localTip: 'Locals call this "zero signal zone". Accidents here take 40+ min for help to arrive.'
  },
  {
    id: 'calangute-anjuna-night',
    name: 'Calangute–Anjuna Coastal Road (Night)',
    stretch: 'Baga to Anjuna junction after 11 PM',
    lat: 15.5640, lng: 73.7450,
    fromLat: 15.5569, fromLng: 73.7520,
    toLat: 15.5741, toLng: 73.7407,
    riskLevel: 'high',
    reasons: ['Speeding tourist bikes', 'No streetlights on narrow stretches', 'Drunk driving incidents', 'Potholed road surface', 'Blind beach access turns'],
    monsoonWorse: false,
    recommendedAction: 'Use auto/taxi after 11 PM. Avoid bike rentals if unfamiliar with road.',
    localTip: 'Police set up naka bandi (checkpoints) Fri-Sat nights. Carry your license.'
  },
  {
    id: 'old-goa-ponda-nh748',
    name: 'NH-748 Old Goa–Ponda Stretch',
    stretch: 'Ela Bridge to Farmagudi, ~14km',
    lat: 15.4540, lng: 73.9520,
    fromLat: 15.4965, fromLng: 73.9016,
    toLat: 15.4227, toLng: 74.0089,
    riskLevel: 'high',
    reasons: ['High speed mixed traffic (trucks + two-wheelers)', 'Multiple blind intersections', 'Kamakshi temple pilgrim traffic spikes', 'Inadequate lighting near Curti', 'Frequent road-kill animal crossing'],
    monsoonWorse: true,
    recommendedAction: 'Use service road parallel tracks when available. Slow down near Khandepar junction.',
    localTip: 'Temple days (Shigmo, Navratri) cause sudden traffic pile-ups and pedestrian overflow.'
  },
  {
    id: 'margao-colva-night',
    name: 'Margao–Colva Road (Night)',
    stretch: 'Ravindra Bhavan Junction to Colva Circle',
    lat: 15.2900, lng: 73.9380,
    fromLat: 15.2736, fromLng: 73.9582,
    toLat: 15.2792, toLng: 73.9227,
    riskLevel: 'medium',
    reasons: ['Unlit side roads with open drains', 'Auto-rickshaw racing late night', 'Tourist bike accidents frequent', 'Pedestrians walking on carriageway'],
    monsoonWorse: false,
    recommendedAction: 'Use main illuminated road. Book OLA/Rapido for night travel.',
    localTip: 'Colva beach road is blocked for parking until 10 PM - vehicles park on road shoulder causing blind corners.'
  },
  {
    id: 'dudhsagar-approach',
    name: 'Dudhsagar Trek Approach Road',
    stretch: 'Collem to Dudhsagar Waterfall Entry (Forest Track)',
    lat: 15.3139, lng: 74.3119,
    fromLat: 15.3274, fromLng: 74.2986,
    toLat: 15.3139, toLng: 74.3119,
    riskLevel: 'extreme',
    reasons: ['Forest road closes completely in monsoon Jun-Sep', 'Flash flood risk from Mhadei tributary', 'Wildlife — elephant corridor', 'Zero mobile signal', 'Jeep track washout common'],
    monsoonWorse: true,
    recommendedAction: 'DO NOT attempt Jun–Sep. Off-season: only enter with certified eco-guide and before 8 AM.',
    localTip: 'Forest Department closes officially Jun-Sep. Deaths have occurred from flash floods here.'
  },
  {
    id: 'tiswadi-highway-merge',
    name: 'Panaji–Ribandar Causeway Approach',
    stretch: 'Santa Monica Jetty to Dando, Ribandar',
    lat: 15.4916, lng: 73.8658,
    fromLat: 15.4980, fromLng: 73.8480,
    toLat: 15.4856, toLng: 73.8760,
    riskLevel: 'medium',
    reasons: ['Narrow two-lane with dense traffic', 'High tide flooding risk', 'Blind bend at Ribandar village', 'No pedestrian footpath'],
    monsoonWorse: true,
    recommendedAction: 'Avoid during high tide (5:30-7 AM and 6-8 PM typical tidal windows).',
    localTip: 'When sea level rises, water covers the low-lying approach road near the fishing village.'
  },
  {
    id: 'vasco-cortalim',
    name: 'Vasco–Cortalim Highway (Industrial)',
    stretch: 'Zuari Nagar to Cortalim Junction, ~9km',
    lat: 15.4138, lng: 73.8665,
    fromLat: 15.3945, fromLng: 73.8120,
    toLat: 15.4339, toLng: 73.9018,
    riskLevel: 'high',
    reasons: ['Heavy mining trucks', 'Poor road markings', 'Dust visibility issues', 'Industrial plant entrances with blind exits', 'No ambulance access route from one side'],
    monsoonWorse: false,
    recommendedAction: 'Keep headlights on at all times. Do not overtake near plant entrances.',
    localTip: 'Ore trucks run to Mormugao Port late nights. Avoid 9 PM–1 AM on this stretch.'
  },
  {
    id: 'mapusa-thivim-nh748',
    name: 'Mapusa–Thivim Bypass (NH-748)',
    stretch: 'Mapusa Market to Thivim Railway Station',
    lat: 15.5925, lng: 73.8207,
    fromLat: 15.5917, fromLng: 73.8118,
    toLat: 15.6275, toLng: 73.8303,
    riskLevel: 'high',
    reasons: ['Station road chaos during train arrivals', 'Tourist taxi congregation blocks road', 'Multiple unregulated intersections', 'Rickshaw U-turns without warning'],
    monsoonWorse: false,
    recommendedAction: 'Check Konkan Railway schedule before using this road. Use alternate Calangute bypass.',
    localTip: 'When Rajdhani Express arrives (8:15 AM), this road jams for 25+ minutes.'
  },
  {
    id: 'sanguem-mollem-wildlife',
    name: 'Sanguem–Mollem Wildlife Corridor Road',
    stretch: 'Castle Rock Gate to Mollem National Park',
    lat: 15.3980, lng: 74.3355,
    fromLat: 15.3600, fromLng: 74.3180,
    toLat: 15.4100, toLng: 74.3480,
    riskLevel: 'extreme',
    reasons: ['Active elephant and bison crossing', 'Night driving strictly prohibited', 'Zero street lighting', 'No mobile network', 'Single-lane forest road', 'Flash landslides in monsoon'],
    monsoonWorse: true,
    recommendedAction: 'NEVER drive at night. Report wildlife sightings to Forest Department: 0832-2612095. Keep windows up.',
    localTip: 'Bison (Gaur) sightings peak at dawn and dusk. A charging bison at 100+kg can overturn a vehicle.'
  },
  {
    id: 'panaji-old-bridge-mdp',
    name: 'Mandovi Bridge Approach — Panaji Side',
    stretch: 'Dayanand Bandodkar Marg to Mandovi Bridge toll',
    lat: 15.5001, lng: 73.8320,
    fromLat: 15.4990, fromLng: 73.8270,
    toLat: 15.5015, toLng: 73.8390,
    riskLevel: 'medium',
    reasons: ['Severe congestion during peak hours (8–10 AM, 5–7 PM)', 'Pedestrian jaywalking at casino jetty', 'Bridge narrow with no emergency shoulder', 'Frequent monsoon visibility drops'],
    monsoonWorse: true,
    recommendedAction: 'Use Atal Setu New Zuari Bridge as alternative for South–North Goa trips.',
    localTip: 'Fog and mist over Mandovi during Jul-Aug can reduce visibility to 30m on the bridge.'
  }
];
