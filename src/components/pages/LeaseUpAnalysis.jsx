import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { timePatternData, correlationMatrix, buildingAgeComparison, seasonDistribution, leaseUpHistogram } from '../../data/dataset';

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

function TimePatternsTab() {
  return (
    <div className="grid grid-cols-2 gap-5 page-enter">
      <div className="card">
        <ChartHeader
          title="Average Lease-Up by Delivery Year"
          description="X: year the property was delivered · Y: avg months to stabilize. Red bars indicate crisis-era delays (2008–2009)."
        />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timePatternData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Months', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="avgLeaseUp" name="Avg Lease-Up (mo)" radius={[6, 6, 0, 0]} barSize={32}>
              {timePatternData.map((entry, i) => (
                <Cell key={i} fill={entry.avgLeaseUp > 14 ? '#EF4444' : entry.avgLeaseUp > 12 ? '#F59E0B' : '#6366F1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <ChartHeader
          title="Property Count by Delivery Year"
          description="X: delivery year · Y: how many properties were delivered that year. 2008 had the most new supply (42)."
        />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timePatternData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Properties" fill="#06B6D4" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <ChartHeader
          title="Deliveries by Season"
          description="Number of properties delivered per quarter. Q3 (Jul–Sep) leads with 75, likely timed for fall leasing season."
        />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={seasonDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Properties" radius={[6, 6, 0, 0]} barSize={40}>
              {seasonDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <ChartHeader
          title="Lease-Up Distribution Histogram"
          description="X: lease-up duration buckets (months) · Y: property count per bucket. Most properties stabilize between 9–12 months."
        />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={leaseUpHistogram} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Properties" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CorrelationTab() {
  const { features, values } = correlationMatrix;
  const getColor = (val) => {
    if (val === 1) return '#6366F1';
    if (val > 0.4) return '#818CF8';
    if (val > 0.2) return '#A5B4FC';
    if (val > 0) return '#C7D2FE';
    if (val > -0.2) return '#FED7AA';
    if (val > -0.4) return '#FDBA74';
    return '#FB923C';
  };

  return (
    <div className="page-enter">
      <div className="card">
        <ChartHeader
          title="Feature Correlation Matrix"
          description="Pairwise Pearson correlations between key metrics. Blue = positive correlation, orange = negative. Strongest link: Concession ↔ Price Premium (r=0.52)."
        />
        <div className="overflow-x-auto">
          <table className="mx-auto">
            <thead>
              <tr>
                <th className="w-28" />
                {features.map((f) => (
                  <th key={f} className="text-[11px] font-medium text-gray-500 px-2 pb-2 text-center w-24">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((row, ri) => (
                <tr key={row}>
                  <td className="text-[11px] font-medium text-gray-500 pr-3 text-right py-1">{row}</td>
                  {values[ri].map((val, ci) => (
                    <td key={ci} className="p-1">
                      <div
                        className="w-20 h-12 rounded-lg flex items-center justify-center text-xs font-semibold transition-transform hover:scale-105"
                        style={{ backgroundColor: getColor(val), color: Math.abs(val) > 0.3 ? 'white' : '#374151' }}
                      >
                        {val.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {['#FB923C', '#FDBA74', '#FED7AA', '#E5E7EB', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1'].map((c) => (
                <div key={c} className="w-6 h-3 rounded-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">-1.0 → +1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingAgeTab() {
  const data = buildingAgeComparison;

  return (
    <div className="page-enter">
      <div className="card">
        <ChartHeader
          title="Lease-Up by Building Age — Box Plot Comparison"
          description="Side-by-side distribution of lease-up months for New (2010+) vs Recent (2000–09) buildings. Box = Q1–Q3, line = median, whiskers = min/max."
        />
        <div className="flex justify-center gap-16 py-8">
          {data.map((d, idx) => {
            const scale = (v) => ((v - 0) / 30) * 300;
            const minY = scale(d.min);
            const q1Y = scale(d.q1);
            const medY = scale(d.median);
            const q3Y = scale(d.q3);
            const maxY = scale(d.max);
            const colors = ['#6366F1', '#06B6D4'];

            return (
              <div key={d.category} className="flex flex-col items-center">
                <svg width="100" height="320" viewBox="0 0 100 320">
                  <line x1="50" y1={320 - maxY} x2="50" y2={320 - minY} stroke={colors[idx]} strokeWidth="2" />
                  <line x1="30" y1={320 - maxY} x2="70" y2={320 - maxY} stroke={colors[idx]} strokeWidth="2" />
                  <line x1="30" y1={320 - minY} x2="70" y2={320 - minY} stroke={colors[idx]} strokeWidth="2" />
                  <rect x="20" y={320 - q3Y} width="60" height={q3Y - q1Y} fill={colors[idx]} fillOpacity="0.15" stroke={colors[idx]} strokeWidth="2" rx="4" />
                  <line x1="20" y1={320 - medY} x2="80" y2={320 - medY} stroke={colors[idx]} strokeWidth="3" />
                  <text x="88" y={320 - maxY + 4} fontSize="10" fill="#9CA3AF">{d.max}mo</text>
                  <text x="88" y={320 - q3Y + 4} fontSize="10" fill="#9CA3AF">{d.q3}</text>
                  <text x="88" y={320 - medY + 4} fontSize="10" fill={colors[idx]} fontWeight="600">{d.median}</text>
                  <text x="88" y={320 - q1Y + 4} fontSize="10" fill="#9CA3AF">{d.q1}</text>
                  <text x="88" y={320 - minY + 4} fontSize="10" fill="#9CA3AF">{d.min}mo</text>
                </svg>
                <div className="text-center mt-2">
                  <p className="text-sm font-semibold text-gray-900">{d.category}</p>
                  <p className="text-xs text-gray-400">Avg: {d.avg}mo</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const tabList = [
  { id: 'time', label: 'Time Patterns' },
  { id: 'correlation', label: 'Feature Correlations' },
  { id: 'age', label: 'Building Age' },
];

export default function LeaseUpAnalysis() {
  const [activeTab, setActiveTab] = useState('time');

  return (
    <div className="page-enter px-8 pb-8">
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {tabList.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'time' && <TimePatternsTab />}
      {activeTab === 'correlation' && <CorrelationTab />}
      {activeTab === 'age' && <BuildingAgeTab />}
    </div>
  );
}
