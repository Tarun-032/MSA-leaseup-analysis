export const clusters = [
  {
    id: 0,
    label: 'High Concession',
    count: 44,
    avgLeaseUp: 12.9,
    avgConcession: 14.2,
    avgPriceVsMarket: 18.3,
    color: '#6366F1',
    avgUnits: 312,
    avgRentGrowth: -4.2,
  },
  {
    id: 1,
    label: 'Mid Market',
    count: 106,
    avgLeaseUp: 14.0,
    avgConcession: 9.8,
    avgPriceVsMarket: 22.1,
    color: '#06B6D4',
    avgUnits: 278,
    avgRentGrowth: -2.8,
  },
  {
    id: 2,
    label: 'Premium Pricing',
    count: 51,
    avgLeaseUp: 14.1,
    avgConcession: 11.2,
    avgPriceVsMarket: 47.8,
    color: '#F59E0B',
    avgUnits: 245,
    avgRentGrowth: -5.1,
  },
  {
    id: 3,
    label: 'Fast Lease-Up',
    count: 47,
    avgLeaseUp: 9.0,
    avgConcession: 8.1,
    avgPriceVsMarket: 12.4,
    color: '#10B981',
    avgUnits: 198,
    avgRentGrowth: -1.5,
  },
  {
    id: 4,
    label: 'Outlier',
    count: 1,
    avgLeaseUp: 1.0,
    avgConcession: 2.0,
    avgPriceVsMarket: 5.0,
    color: '#EF4444',
    avgUnits: 150,
    avgRentGrowth: 0.0,
  },
];

export const marketStats = {
  markets: [
    { name: 'Austin-Round Rock TX', count: 247, avgLeaseUp: 12.9 },
    { name: 'Akron OH', count: 2, avgLeaseUp: 8.0 },
  ],
  overallAvg: 12.8,
  overallMedian: 12,
  totalProperties: 249,
};

export const seasonDistribution = [
  { season: 'Q1 (Jan-Mar)', count: 62, color: '#6366F1' },
  { season: 'Q2 (Apr-Jun)', count: 57, color: '#06B6D4' },
  { season: 'Q3 (Jul-Sep)', count: 75, color: '#10B981' },
  { season: 'Q4 (Oct-Dec)', count: 55, color: '#F59E0B' },
];

export const buildingAge = [
  { category: 'New (2010+)', count: 199 },
  { category: 'Recent (2000-09)', count: 50 },
];

export const leaseUpHistogram = [
  { bucket: '0-3', count: 8 },
  { bucket: '3-6', count: 23 },
  { bucket: '6-9', count: 48 },
  { bucket: '9-12', count: 67 },
  { bucket: '12-15', count: 52 },
  { bucket: '15-18', count: 28 },
  { bucket: '18-21', count: 14 },
  { bucket: '21-25', count: 5 },
  { bucket: '25+', count: 4 },
];

export const worstRentDeclines = [
  { name: 'Colonial Grand at Ashton Oaks', decline: -34.2, deliveryDate: 'Oct-08', leaseUpMonths: 14, cluster: 0 },
  { name: 'Villas at Tech Ridge', decline: -26.3, deliveryDate: 'Mar-09', leaseUpMonths: 15, cluster: 1 },
  { name: '3500 Westlake', decline: -24.7, deliveryDate: 'Apr-08', leaseUpMonths: 12, cluster: 2 },
  { name: 'AMLI on 2ND', decline: -23.5, deliveryDate: 'Apr-08', leaseUpMonths: 5, cluster: 3 },
  { name: 'Marquis Lakeline Station', decline: -21.5, deliveryDate: 'May-08', leaseUpMonths: 11, cluster: 1 },
  { name: 'Camden Amber Oaks', decline: -19.8, deliveryDate: 'Jul-08', leaseUpMonths: 18, cluster: 0 },
  { name: 'Gables at Round Rock', decline: -18.4, deliveryDate: 'Sep-08', leaseUpMonths: 16, cluster: 1 },
  { name: 'Windsor Ridge at Westgate', decline: -17.2, deliveryDate: 'Nov-08', leaseUpMonths: 13, cluster: 2 },
  { name: 'Alexan Braker Pointe', decline: -16.9, deliveryDate: 'Jun-08', leaseUpMonths: 10, cluster: 1 },
  { name: 'Camden Lamar Heights', decline: -15.3, deliveryDate: 'Aug-08', leaseUpMonths: 9, cluster: 3 },
  { name: 'Broadstone Grand Ave', decline: -14.7, deliveryDate: 'Feb-09', leaseUpMonths: 17, cluster: 0 },
  { name: 'AMLI at Mueller', decline: -13.2, deliveryDate: 'Jan-09', leaseUpMonths: 14, cluster: 1 },
  { name: 'Domain at Tech Ridge', decline: -12.8, deliveryDate: 'Dec-08', leaseUpMonths: 11, cluster: 2 },
  { name: 'Midtown Commons at Crestview', decline: -11.5, deliveryDate: 'Mar-08', leaseUpMonths: 8, cluster: 3 },
  { name: 'Springs at Bee Cave', decline: -10.9, deliveryDate: 'May-09', leaseUpMonths: 19, cluster: 1 },
];

export const scatterData = generateScatterData();

function generateScatterData() {
  const names = [
    'Alexan Downtown', 'Windsor at Barton Creek', 'AMLI on 2ND', 'Camden Rainey St',
    'Broadstone Ranch', 'Gables Park Tower', 'Domain at Tech Ridge', 'Midtown Commons',
    'Lamar Union', 'Mueller Flats', 'South Shore District', 'The Independent',
    'Whisper Valley', 'Eastside Station', 'Saltillo Lofts', 'Riverview at Montopolis',
    'East Austin Commons', 'Circle C Ranch', 'Oak Hill Terrace', 'Lakeline Station',
    'Pflugerville Square', 'Round Rock Crossing', 'Cedar Park West', 'Georgetown Heights',
    'Bee Cave Luxury', 'Dripping Springs', 'Kyle Crossing', 'Buda Town Center',
    'Manor Park', 'Leander Trails', 'Wells Branch Point', 'Great Hills Place',
    'Arboretum Reserve', 'Spicewood Springs', 'Northwest Hills', 'Jollyville Station',
    'Research Park', 'Parmer Lane Lofts', 'Metric Blvd', 'Riata Crossing',
    'Balcones Woods', 'Cat Hollow', 'Scofield Ridge', 'Avery Ranch',
    'Brushy Creek', 'Sam Bass Trail', 'Forest North', 'Burnet Road',
    'Anderson Mill', 'Canyon Creek', 'Colonial Grand at Ashton Oaks', 'Villas at Tech Ridge',
    '3500 Westlake', 'Marquis Lakeline Station', 'Camden Amber Oaks',
  ];

  const seed = (i) => Math.sin(i * 127.1 + 311.7) * 43758.5453 % 1;
  const data = [];

  for (let i = 0; i < 120; i++) {
    const s = Math.abs(seed(i));
    const s2 = Math.abs(seed(i + 100));
    const s3 = Math.abs(seed(i + 200));
    const clusterId = s < 0.18 ? 0 : s < 0.60 ? 1 : s < 0.80 ? 2 : s < 0.98 ? 3 : 4;
    const cluster = clusters.find(c => c.id === clusterId);

    const baseLeaseUp = cluster.avgLeaseUp + (s2 - 0.5) * 12;
    const basePremium = cluster.avgPriceVsMarket + (s3 - 0.5) * 30;

    data.push({
      name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
      leaseUpMonths: Math.max(1, Math.round(baseLeaseUp * 10) / 10),
      pricePremium: Math.round(basePremium * 10) / 10,
      cluster: clusterId,
      clusterLabel: cluster.label,
      color: cluster.color,
      concession: Math.round((cluster.avgConcession + (s2 - 0.5) * 8) * 10) / 10,
      units: Math.round(150 + s3 * 250),
    });
  }

  return data;
}

export const correlationMatrix = {
  features: ['Lease-Up', 'Concession', 'Price Premium', 'Units', 'Rent Growth'],
  values: [
    [1.0, 0.34, 0.21, -0.12, -0.45],
    [0.34, 1.0, 0.52, 0.08, -0.28],
    [0.21, 0.52, 1.0, -0.05, -0.33],
    [-0.12, 0.08, -0.05, 1.0, 0.15],
    [-0.45, -0.28, -0.33, 0.15, 1.0],
  ],
};

export const timePatternData = [
  { year: '2003', avgLeaseUp: 11.2, count: 8 },
  { year: '2004', avgLeaseUp: 10.5, count: 15 },
  { year: '2005', avgLeaseUp: 9.8, count: 22 },
  { year: '2006', avgLeaseUp: 10.1, count: 28 },
  { year: '2007', avgLeaseUp: 11.8, count: 35 },
  { year: '2008', avgLeaseUp: 15.2, count: 42 },
  { year: '2009', avgLeaseUp: 18.3, count: 30 },
  { year: '2010', avgLeaseUp: 14.6, count: 25 },
  { year: '2011', avgLeaseUp: 12.1, count: 18 },
  { year: '2012', avgLeaseUp: 11.4, count: 12 },
  { year: '2013', avgLeaseUp: 10.8, count: 14 },
];

export const buildingAgeComparison = [
  { category: 'New (2010+)', min: 3, q1: 8, median: 11, q3: 15, max: 24, avg: 11.8 },
  { category: 'Recent (2000-09)', min: 5, q1: 10, median: 14, q3: 18, max: 28, avg: 14.2 },
];

export const umapData = generateUMAPData();

function generateUMAPData() {
  const data = [];
  const clusterCenters = [
    { x: -3, y: 2 }, { x: 1, y: 0 }, { x: 4, y: 3 }, { x: -1, y: -3 }, { x: 6, y: -2 },
  ];

  const names = [
    'Alexan Downtown', 'Windsor Barton Creek', 'AMLI on 2ND', 'Camden Rainey',
    'Broadstone Ranch', 'Gables Park Tower', 'Domain Tech Ridge', 'Midtown Commons',
    'Lamar Union', 'Mueller Flats', 'South Shore', 'The Independent',
    'Whisper Valley', 'Eastside Station', 'Saltillo Lofts', 'Riverview Montopolis',
  ];

  clusters.forEach((cluster) => {
    const center = clusterCenters[cluster.id];
    for (let i = 0; i < cluster.count && i < 30; i++) {
      const angle = (i / cluster.count) * Math.PI * 2;
      const radius = 0.8 + Math.abs(Math.sin(i * 3.14159 * 7.3)) * 1.5;
      data.push({
        x: Math.round((center.x + Math.cos(angle) * radius) * 100) / 100,
        y: Math.round((center.y + Math.sin(angle) * radius) * 100) / 100,
        cluster: cluster.id,
        clusterLabel: cluster.label,
        color: cluster.color,
        name: names[i % names.length] + (cluster.id > 0 ? ` C${cluster.id}` : ''),
        leaseUpMonths: Math.round((cluster.avgLeaseUp + (Math.sin(i) * 3)) * 10) / 10,
        concession: Math.round((cluster.avgConcession + (Math.cos(i) * 4)) * 10) / 10,
      });
    }
  });

  return data;
}

export const rentDeclineStats = {
  avgDecline: -8.4,
  worstDrop: -34.2,
  medianDecline: -5.7,
  propertiesWithDecline: 104,
  percentWithDecline: 41.8,
};

export const suggestedQuestions = [
  'Which cluster leases fastest?',
  'Why did 2008 rents decline?',
  'What drives premium pricing?',
  'Compare Austin vs Akron markets',
];
