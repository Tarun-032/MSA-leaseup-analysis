import { Clock, BarChart3, AlertTriangle, Zap, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, LineChart, Line,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Legend,
} from 'recharts';
import KPICard from '../KPICard';
import {
  leaseUpHistogram, seasonDistribution, scatterData, clusters,
  marketStats, timePatternData, worstRentDeclines, correlationMatrix,
} from '../../data/dataset';

function ChartHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">{title}</h3>
      <p className="text-[11px] text-gray-400 mt-0.5 font-normal normal-case tracking-normal">{description}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="text-gray-600">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{d.name}</p>
      <p className="text-gray-600">Lease-Up: <span className="font-medium">{d.leaseUpMonths}mo</span></p>
      <p className="text-gray-600">Price Premium: <span className="font-medium">{d.pricePremium}%</span></p>
      <p style={{ color: d.color }} className="font-medium mt-1">{d.clusterLabel}</p>
    </div>
  );
}

const clusterRadarData = [
  'Lease-Up', 'Concession', 'Price Premium', 'Units', 'Rent Impact',
].map((feature) => {
  const row = { feature };
  clusters.filter(c => c.id < 4).forEach((c) => {
    if (feature === 'Lease-Up') row[c.label] = c.avgLeaseUp;
    else if (feature === 'Concession') row[c.label] = c.avgConcession;
    else if (feature === 'Price Premium') row[c.label] = c.avgPriceVsMarket;
    else if (feature === 'Units') row[c.label] = c.avgUnits / 20;
    else if (feature === 'Rent Impact') row[c.label] = Math.abs(c.avgRentGrowth) * 3;
  });
  return row;
});

const concessionVsLeaseUp = clusters.filter(c => c.id < 4).map(c => ({
  name: c.label, concession: c.avgConcession, leaseUp: c.avgLeaseUp,
  color: c.color, count: c.count,
}));

const topPerformers = [
  { name: 'AMLI on 2ND', leaseUp: 5, cluster: 'Fast Lease-Up', color: '#10B981' },
  { name: 'Midtown Commons', leaseUp: 8, cluster: 'Fast Lease-Up', color: '#10B981' },
  { name: 'Camden Lamar Heights', leaseUp: 9, cluster: 'Fast Lease-Up', color: '#10B981' },
  { name: 'Alexan Braker Pointe', leaseUp: 10, cluster: 'Mid Market', color: '#06B6D4' },
  { name: 'Marquis Lakeline Station', leaseUp: 11, cluster: 'Mid Market', color: '#06B6D4' },
];
const bottomPerformers = worstRentDeclines.slice(0, 5);

export default function Overview() {
  const kpis = [
    { icon: Clock, label: 'Avg Lease-Up', value: 12.8, suffix: 'mo', trend: -3.2, trendLabel: 'vs. prior period', color: '#6366F1' },
    { icon: BarChart3, label: 'Median Lease-Up', value: 12, suffix: 'mo', trend: 1.5, trendLabel: 'Stable trend', color: '#8B5CF6' },
    { icon: AlertTriangle, label: 'Negative Rent Growth', value: 104, suffix: '', trend: -42, trendLabel: '42% of properties', color: '#EF4444', accentColor: '#F97316' },
    { icon: Zap, label: 'Fast Lease-Ups ≤6mo', value: 31, suffix: '', trend: 12, trendLabel: '12% of portfolio', color: '#10B981' },
  ];

  return (
    <div className="page-enter space-y-5 px-8 pb-8">
      {/* Row 1: KPIs */}
      <div className="grid grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Row 2: Yearly Trend + Fastest Lease-Ups */}
      <div className="grid grid-cols-3 gap-5">
        <div className="card col-span-2">
          <ChartHeader
            title="Average Lease-Up by Delivery Year"
            description="X: property delivery year (2003–2013) · Y: avg months to reach stabilized occupancy. Dashed line = property count."
          />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timePatternData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[8, 20]} label={{ value: 'Months', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={12.8} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: 'Avg 12.8', position: 'right', fontSize: 10, fill: '#9CA3AF' }} />
              <Area type="monotone" dataKey="avgLeaseUp" fill="url(#lineGrad)" stroke="none" />
              <Line type="monotone" dataKey="avgLeaseUp" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }} name="Avg Lease-Up (mo)" activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Property Count" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-success" />
            <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">Fastest Lease-Ups</h3>
          </div>
          <p className="text-[11px] text-gray-400 mb-4">Top 5 properties that reached stabilized occupancy fastest.</p>
          <div className="space-y-3">
            {topPerformers.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-success/10 text-success text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.cluster}</p>
                </div>
                <span className="text-sm font-bold text-success">{p.leaseUp}mo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Lease-Up Distribution + Delivery Season + Worst Rent Declines */}
      <div className="grid grid-cols-3 gap-5">
        <div className="card">
          <ChartHeader
            title="Lease-Up Distribution"
            description="X: lease-up duration buckets (months) · Y: number of properties in each range. Peak at 9–12 months."
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={leaseUpHistogram} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine x="9-12" stroke="#6366F1" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'Peak', position: 'top', fontSize: 10, fill: '#6366F1' }} />
              <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} fill="url(#areaGrad)" name="Properties" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <ChartHeader
            title="Delivery Season"
            description="Number of properties delivered per quarter. Q3 (Jul–Sep) has the most deliveries at 75."
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={seasonDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Properties" radius={[8, 8, 0, 0]} barSize={36}>
                {seasonDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-danger" />
            <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">Worst Rent Declines</h3>
          </div>
          <p className="text-[11px] text-gray-400 mb-4">Properties with the steepest first-year rent drops, mostly 2008 crisis deliveries.</p>
          <div className="space-y-3">
            {bottomPerformers.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-danger/10 text-danger text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.deliveryDate} · {p.leaseUpMonths}mo lease-up</p>
                </div>
                <span className="text-sm font-bold text-danger">{p.decline}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Cluster Radar + Price Premium Scatter */}
      <div className="grid grid-cols-5 gap-5">
        <div className="card col-span-2">
          <ChartHeader
            title="Cluster DNA — Multi-Metric Comparison"
            description="Radar overlay of all 4 clusters across lease-up speed, concession rate, price premium, unit count, and rent impact."
          />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={clusterRadarData} outerRadius="65%">
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="feature" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              {clusters.filter(c => c.id < 4).map((c) => (
                <Radar key={c.id} name={c.label} dataKey={c.label} stroke={c.color} fill={c.color} fillOpacity={0.08} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #E5E7EB' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card col-span-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">Price Premium vs Lease-Up Speed</h3>
            <div className="flex items-center gap-3">
              {clusters.filter(c => c.id < 4).map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mb-4">X: how much above market rent (%) · Y: months to stabilize. Higher premiums tend toward slower lease-ups.</p>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="pricePremium" type="number" name="Price Premium" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Price Premium (%)', position: 'bottom', fontSize: 11, fill: '#9CA3AF', offset: -2 }} />
              <YAxis dataKey="leaseUpMonths" type="number" name="Lease-Up" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Lease-Up (months)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9CA3AF', offset: 10 }} />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="#6366F1">
                {scatterData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.7} />)}
              </Scatter>
              <ReferenceLine segment={[{ x: -5, y: 16 }, { x: 65, y: 10 }]} stroke="#9CA3AF" strokeDasharray="6 4" strokeWidth={1.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 5: Concession Scatter + Portfolio Composition + Market Comparison */}
      <div className="grid grid-cols-3 gap-5">
        <div className="card">
          <ChartHeader
            title="Concession vs Lease-Up Speed"
            description="X: avg concession rate (%) · Y: avg lease-up months per cluster. Bubble size = property count."
          />
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, left: -5, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="concession" type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Concession (%)', position: 'bottom', fontSize: 10, fill: '#9CA3AF', offset: -2 }} />
              <YAxis dataKey="leaseUp" type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Lease-Up (mo)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9CA3AF', offset: 10 }} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
                    <p className="font-semibold" style={{ color: d.color }}>{d.name}</p>
                    <p className="text-gray-600">{d.count} props · {d.concession}% concession · {d.leaseUp}mo</p>
                  </div>
                );
              }} />
              <Scatter data={concessionVsLeaseUp} fill="#6366F1">
                {concessionVsLeaseUp.map((e, i) => <Cell key={i} fill={e.color} r={Math.sqrt(e.count) * 2.5} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <ChartHeader
            title="Portfolio Composition"
            description="Breakdown of 249 properties across 4 K-Means clusters by count."
          />
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={clusters.filter(c => c.id < 4)} cx="50%" cy="50%" outerRadius={60} innerRadius={32} paddingAngle={3} dataKey="count" nameKey="label">
                {clusters.filter(c => c.id < 4).map((c) => <Cell key={c.id} fill={c.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {clusters.filter(c => c.id < 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-gray-600">{c.label}</span>
                </div>
                <span className="font-semibold text-gray-900">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <ChartHeader
            title="Market Comparison"
            description="Austin dominates with 247 properties. Akron has only 2 but leases up 38% faster on average."
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            {marketStats.markets.map((m, i) => (
              <div key={m.name} className="p-2.5 rounded-xl" style={{ backgroundColor: i === 0 ? '#6366F110' : '#10B98110' }}>
                <p className="text-[10px] font-medium text-gray-500">{m.name}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{m.count} <span className="text-xs font-normal text-gray-400">props</span></p>
                <p className="text-[11px] text-gray-500">Avg: {m.avgLeaseUp}mo</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={marketStats.markets.map((m, i) => ({ name: m.name.split(' ')[0], leaseUp: m.avgLeaseUp, fill: i === 0 ? '#6366F1' : '#10B981' }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 16]} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="leaseUp" name="Avg Lease-Up (mo)" radius={[6, 6, 0, 0]} barSize={32}>
                {marketStats.markets.map((_, i) => <Cell key={i} fill={i === 0 ? '#6366F1' : '#10B981'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 6: Correlation Heatmap (full width) */}
      <div className="card">
        <ChartHeader
          title="Feature Correlation Matrix"
          description="Pairwise Pearson correlations between key property metrics. Blue = positive, orange = negative. Strongest: Concession ↔ Price Premium (0.52)."
        />
        <div className="overflow-x-auto">
          <table className="mx-auto" style={{ maxWidth: 500 }}>
            <thead>
              <tr>
                <th className="w-20" />
                {correlationMatrix.features.map(f => (
                  <th key={f} className="text-[10px] font-medium text-gray-400 px-1.5 pb-2 text-center">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.features.map((row, ri) => (
                <tr key={row}>
                  <td className="text-[10px] font-medium text-gray-500 pr-2 text-right py-0.5">{row}</td>
                  {correlationMatrix.values[ri].map((val, ci) => {
                    const abs = Math.abs(val);
                    let bg = '#F3F4F6';
                    if (val === 1) bg = '#6366F1';
                    else if (val > 0.3) bg = '#818CF8';
                    else if (val > 0) bg = '#C7D2FE';
                    else if (val > -0.3) bg = '#FED7AA';
                    else bg = '#FB923C';
                    return (
                      <td key={ci} className="p-0.5">
                        <div className="w-full h-9 rounded-md flex items-center justify-center text-[10px] font-semibold" style={{ backgroundColor: bg, color: abs > 0.3 ? 'white' : '#374151' }}>
                          {val.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
