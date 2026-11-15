const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
const VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'; // placeholder: replace with real walkthroughs

export const agents = [
  { slug: 'aarav-deshmukh', name: 'Aarav Deshmukh', company: 'Shailesh.dev', phone: '+91 98765 43210', email: 'aarav@shailesh.dev', office: '12 Civil Lines, Nagpur', bio: 'Twelve years helping families find homes they keep.', photo: '' },
  { slug: 'neha-patil', name: 'Neha Patil', company: 'Shailesh.dev', phone: '+91 98765 43211', email: 'neha@shailesh.dev', office: '12 Civil Lines, Nagpur', bio: 'Commercial leasing and land specialist across Nagpur.', photo: '' },
];

const base = { city: 'Nagpur', state: 'Maharashtra', parking: '1 covered', furnishing: 'Unfurnished', facing: 'East', video: VIDEO, agentId: 'aarav-deshmukh', featured: false };

export const properties = [
  { ...base, slug: 'lakeview-villa', name: 'Lakeview Villa', category: 'Residential', type: 'Villa', location: 'Seminary Hills', address: '14 Lake Road, Seminary Hills, Nagpur 440006', coordinates: { lat: 21.137, lng: 79.078 }, price: 32000000, area: 3800, bedrooms: 4, bathrooms: 5, parking: '2 covered', furnishing: 'Semi-furnished', yearBuilt: 2022, featured: true,
    short: 'Four-bedroom villa with a landscaped backyard.', description: 'A light-filled villa set against the Seminary Hills ridge, with a double-height living room, a chef’s kitchen and a landscaped backyard with a covered sit-out.', amenities: ['Garden', 'Power backup', 'Security', 'Lift', 'Rainwater harvesting'], construction: 'RCC frame, vitrified flooring, teak joinery, 2022 build with 10-year structural warranty.', features: ['Home office', 'Solar water heating', 'Landscaped backyard'], images: [img('photo-1613490493576-7fde63acd811'), img('photo-1512917774080-9991f1c4c750'), img('photo-1600585154340-be6161a56a0c')] },
  { ...base, slug: 'orange-city-apartment', name: 'Orange City Apartment', category: 'Residential', type: 'Apartment', location: 'Dharampeth', address: '7 Orange Residency, Dharampeth, Nagpur 440010', coordinates: { lat: 21.135, lng: 79.063 }, price: 8500000, area: 1250, bedrooms: 2, bathrooms: 2, parking: '1 covered', furnishing: 'Semi-furnished', yearBuilt: 2020, featured: true, facing: 'North',
    short: 'Bright 2 BHK in the heart of Dharampeth.', description: 'A corner apartment on the 6th floor with cross ventilation, a balcony facing the park and walkable access to cafes and schools.', amenities: ['Lift', 'Gym', 'Security', 'Power backup'], construction: 'RCC frame, branded fittings, 6th floor of 12.', features: ['Corner unit', 'Park-facing balcony'], images: [img('photo-1545324418-cc1a3fa10c00'), img('photo-1502672260266-1c1ef2d93688')] },
  { ...base, slug: 'wardha-road-showroom', name: 'Wardha Road Showroom', category: 'Commercial', type: 'Commercial', location: 'Wardha Road', address: '221 Wardha Road, Nagpur 440025', coordinates: { lat: 21.099, lng: 79.06 }, price: 45000000, area: 4200, bedrooms: 0, bathrooms: 4, parking: '12 open', furnishing: 'Bare shell', yearBuilt: 2019, featured: true, facing: 'West', agentId: 'neha-patil',
    short: 'Double-height showroom on a high-footfall arterial road.', description: 'A ground-plus-mezzanine showroom with 60 ft frontage, a loading bay and visible signage from the main carriageway.', amenities: ['Loading bay', 'Security', 'Power backup', 'CCTV'], construction: 'Steel and RCC hybrid, 18 ft ceiling height.', features: ['60 ft frontage', 'Mezzanine office'], images: [img('photo-1486406146926-c627a92ad1ab'), img('photo-1497366216548-37526070297c')] },
  { ...base, slug: 'garden-plot', name: 'Garden Plot', category: 'Residential', type: 'Plot', location: 'Besa', address: 'Plot 18, Besa Layout, Nagpur 440037', coordinates: { lat: 21.07, lng: 79.1 }, price: 4200000, area: 2400, bedrooms: 0, bathrooms: 0, parking: 'n/a', furnishing: 'n/a', yearBuilt: 0, agentId: 'neha-patil',
    short: 'NIT-approved corner plot in a green layout.', description: 'A clear-title corner plot with 30 ft roads on two sides, ready for construction in a quiet, tree-lined layout.', amenities: ['Water line', 'Street lights', 'Gated layout'], construction: 'Vacant plot with boundary pillars.', features: ['Corner plot', 'Clear title'], images: [img('photo-1500382017468-9049fed747ef'), img('photo-1500382017468-9049fed747ef')] },
  { ...base, slug: 'civil-lines-house', name: 'Civil Lines House', category: 'Residential', type: 'House', location: 'Civil Lines', address: '31 Civil Lines, Nagpur 440001', coordinates: { lat: 21.15, lng: 79.083 }, price: 14000000, area: 2600, bedrooms: 3, bathrooms: 3, parking: '2 open', furnishing: 'Furnished', yearBuilt: 2015, facing: 'South',
    short: 'Heritage-style bungalow with a mature garden.', description: 'A three-bedroom bungalow on a tree-lined Civil Lines street, with a deep front verandah and a mature mango garden.', amenities: ['Garden', 'Security', 'Power backup'], construction: 'Load-bearing brick with RCC slab, Kota stone flooring.', features: ['Verandah', 'Mango garden'], images: [img('photo-1564013799919-ab600027ffc6'), img('photo-1570129477492-45c003edd2be')] },
  { ...base, slug: 'trimurti-residency', name: 'Trimurti Residency', category: 'Residential', type: 'Apartment', location: 'Trimurti Nagar', address: 'Trimurti Residency, Trimurti Nagar, Nagpur 440022', coordinates: { lat: 21.11, lng: 79.05 }, price: 9500000, area: 1400, bedrooms: 3, bathrooms: 2, parking: '1 covered', furnishing: 'Unfurnished', yearBuilt: 2021, facing: 'East', agentId: 'neha-patil',
    short: 'Spacious 3 BHK close to the metro.', description: 'A 3 BHK in a gated society, ten minutes from the metro with a clubhouse, play area and covered parking.', amenities: ['Clubhouse', 'Lift', 'Play area', 'Security'], construction: 'RCC frame, 9th floor of 14.', features: ['Metro access', 'Clubhouse'], images: [img('photo-1560448204-e02f11c3d0e2'), img('photo-1522708323590-d24dbb6b0267')] },
  { ...base, slug: 'hingna-farmhouse', name: 'Hingna Farmhouse', category: 'Residential', type: 'Other', location: 'Hingna', address: 'Survey 42, Hingna Road, Nagpur 441110', coordinates: { lat: 21.1, lng: 78.99 }, price: 21000000, area: 5200, bedrooms: 3, bathrooms: 3, parking: '4 open', furnishing: 'Semi-furnished', yearBuilt: 2018, facing: 'North-east',
    short: 'Weekend farmhouse on one acre with a pool.', description: 'A one-acre farmhouse with a mango orchard, a pool and a three-bedroom main house, 25 minutes from the city.', amenities: ['Pool', 'Orchard', 'Borewell', 'Security'], construction: 'RCC with stone cladding.', features: ['One acre', 'Mango orchard'], images: [img('photo-1568605114967-8130f3a36994'), img('photo-1600596542815-ffad4c1539a9')] },
];

export const company = {
  name: 'Shailesh.dev', tagline: 'A Nagpur-based agency focused on honest advice and well-built homes.',
  story: 'Founded in 2012 with a single office and three listings.',
  history: [
    { year: 2012, text: 'Opened our first office on Civil Lines with three listings.' },
    { year: 2016, text: 'Launched commercial leasing and land advisory.' },
    { year: 2021, text: 'Crossed 1,000 families served across Vidarbha.' },
    { year: 2024, text: 'Added video walkthroughs to every listing.' },
  ],
  mission: 'Make every property decision clear and confident.',
  vision: 'The most trusted property advisor in central India.',
  stats: { propertiesListed: 420, clientsServed: 1800, yearsExperience: 14 },
  achievements: ['Best Realty Agency, Vidarbha 2023', 'Zero-dispute title record since 2012', 'Rated 4.8 by 900+ clients'],
  expertise: ['Residential sales', 'Commercial leasing', 'Land and plots', 'Legal and title checks', 'Home loan assistance'],
  offices: [{ city: 'Nagpur', address: '12 Civil Lines, Nagpur 440001' }],
  leadership: [{ name: 'Rohan Kulkarni', role: 'Founder', bio: 'Started Shailesh.dev in 2012 after a decade in construction.' }, { name: 'Meera Joshi', role: 'CEO', bio: 'Leads operations and client experience.' }, { name: 'Team lead', role: 'Sales', bio: 'Heads the sales team.' }],
  team: [{ name: 'Aarav Deshmukh', role: 'Senior agent' }, { name: 'Neha Patil', role: 'Commercial and land' }],
  contact: { address: '12 Civil Lines, Nagpur, Maharashtra 440001', phone: '+91 98765 43210', email: 'hello@shailesh.dev', coordinates: { lat: 21.1458, lng: 79.0882 } },
};
