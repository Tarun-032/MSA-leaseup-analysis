import {
  clusters, leaseUpHistogram, seasonDistribution, worstRentDeclines,
  scatterData, timePatternData, buildingAge, marketStats,
} from '../data/dataset';

const chartRegistry = [
  {
    keywords: ['histogram', 'distribution', 'lease-up distribution', 'leaseup distribution', 'lease up distribution', 'how long', 'stabilize', 'stabilization', 'duration'],
    id: 'leaseup_histogram',
    title: 'Lease-Up Duration Distribution',
    type: 'bar',
    generate: () => ({
      data: leaseUpHistogram,
      xKey: 'bucket',
      yKey: 'count',
      xLabel: 'Lease-Up Duration (months)',
      yLabel: 'Number of Properties',
      color: '#6366F1',
    }),
  },
  {
    keywords: ['season', 'seasonal', 'quarterly', 'delivery season', 'quarter', 'q1', 'q2', 'q3', 'q4', 'best time to deliver', 'when to deliver'],
    id: 'season_distribution',
    title: 'Delivery Season Distribution',
    type: 'bar',
    generate: () => ({
      data: seasonDistribution.map(s => ({ name: s.season, value: s.count, fill: s.color })),
      xKey: 'name',
      yKey: 'value',
      xLabel: 'Delivery Quarter',
      yLabel: 'Properties',
      colorByItem: true,
    }),
  },
  {
    keywords: ['cluster comparison', 'compare cluster', 'cluster breakdown', 'which cluster', 'fastest cluster', 'slowest cluster', 'cluster lease'],
    id: 'cluster_comparison',
    title: 'Cluster Comparison — Avg Lease-Up',
    type: 'bar',
    generate: () => ({
      data: clusters.filter(c => c.id < 4).map(c => ({
        name: c.label, leaseUp: c.avgLeaseUp, concession: c.avgConcession, fill: c.color,
      })),
      xKey: 'name',
      yKey: 'leaseUp',
      xLabel: 'Cluster',
      yLabel: 'Avg Lease-Up (months)',
      colorByItem: true,
    }),
  },
  {
    keywords: ['concession', 'concession rate', 'concession by cluster', 'concessions', 'incentive', 'discount'],
    id: 'concession_comparison',
    title: 'Concession Rates by Cluster',
    type: 'bar',
    generate: () => ({
      data: clusters.filter(c => c.id < 4).map(c => ({
        name: c.label, concession: c.avgConcession, fill: c.color,
      })),
      xKey: 'name',
      yKey: 'concession',
      xLabel: 'Cluster',
      yLabel: 'Avg Concession (%)',
      colorByItem: true,
    }),
  },
  {
    keywords: ['rent decline', 'worst', 'worst properties', 'rent drop', 'worst decline', 'rent growth', 'negative rent', 'biggest loss', 'rent decrease', 'lost rent'],
    id: 'rent_decline',
    title: 'Top 10 Worst Rent Declines',
    type: 'horizontal_bar',
    generate: () => ({
      data: worstRentDeclines.slice(0, 10).map(d => ({
        name: d.name.length > 25 ? d.name.slice(0, 25) + '…' : d.name,
        fullName: d.name,
        value: Math.abs(d.decline),
        decline: d.decline,
        fill: Math.abs(d.decline) > 25 ? '#EF4444' : Math.abs(d.decline) > 18 ? '#F97316' : '#F59E0B',
      })),
      xKey: 'value',
      yKey: 'name',
      xLabel: 'Rent Decline (%)',
      colorByItem: true,
    }),
  },
  {
    keywords: ['scatter', 'price vs lease', 'price premium', 'premium vs speed', 'price vs speed', 'premium pricing effect', 'pricing impact'],
    id: 'price_scatter',
    title: 'Price Premium vs Lease-Up Speed',
    type: 'scatter',
    generate: () => ({
      data: scatterData.slice(0, 60),
      xKey: 'pricePremium',
      yKey: 'leaseUpMonths',
      xLabel: 'Price Premium (%)',
      yLabel: 'Lease-Up (months)',
    }),
  },
  {
    keywords: ['trend', 'year', 'yearly', 'over time', 'by year', 'annual', 'timeline', '2008', '2009', '2007', 'crisis', 'historical', 'over the years', 'changed over'],
    id: 'time_trend',
    title: 'Average Lease-Up by Delivery Year',
    type: 'line',
    generate: () => ({
      data: timePatternData,
      xKey: 'year',
      yKey: 'avgLeaseUp',
      xLabel: 'Delivery Year',
      yLabel: 'Avg Lease-Up (months)',
      color: '#6366F1',
    }),
  },
  {
    keywords: ['building age', 'new vs old', 'new vs recent', 'age comparison', 'older buildings', 'newer buildings', 'construction age'],
    id: 'building_age',
    title: 'Properties by Building Age',
    type: 'pie',
    generate: () => ({
      data: buildingAge.map((b, i) => ({
        name: b.category,
        value: b.count,
        fill: i === 0 ? '#6366F1' : '#06B6D4',
      })),
    }),
  },
  {
    keywords: ['market', 'austin', 'akron', 'market comparison', 'markets', 'austin vs', 'compare markets', 'round rock'],
    id: 'market_comparison',
    title: 'Market Comparison',
    type: 'bar',
    generate: () => ({
      data: marketStats.markets.map(m => ({
        name: m.name, properties: m.count, avgLeaseUp: m.avgLeaseUp,
        fill: m.name.includes('Austin') ? '#6366F1' : '#10B981',
      })),
      xKey: 'name',
      yKey: 'avgLeaseUp',
      xLabel: 'Market',
      yLabel: 'Avg Lease-Up (months)',
      colorByItem: true,
    }),
  },
  {
    keywords: ['cluster size', 'cluster distribution', 'cluster pie', 'composition', 'portfolio breakdown', 'how many in each cluster', 'cluster count'],
    id: 'cluster_pie',
    title: 'Portfolio Composition by Cluster',
    type: 'pie',
    generate: () => ({
      data: clusters.map(c => ({ name: c.label, value: c.count, fill: c.color })),
    }),
  },
];

export function detectChartRequest(query) {
  const q = query.toLowerCase();

  let best = null;
  let bestScore = 0;

  for (const chart of chartRegistry) {
    let score = 0;
    for (const kw of chart.keywords) {
      if (q.includes(kw)) {
        score += kw.split(' ').length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = chart;
    }
  }

  if (!best) return null;

  return {
    id: best.id,
    title: best.title,
    type: best.type,
    ...best.generate(),
  };
}
