import { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, BarChart, Bar,
} from 'recharts';
import { clusters, umapData } from '../../data/dataset';

function ChartHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">{title}</h3>
      <p className="text-[11px] text-gray-400 mt-0.5 font-normal normal-case tracking-normal">{description}</p>
    </div>
  );
}

function UMAPTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{d.name}</p>
      <p style={{ color: d.color }} className="font-medium">{d.clusterLabel}</p>
      <p className="text-gray-600">Lease-Up: {d.leaseUpMonths}mo</p>
      <p className="text-gray-600">Concession: {d.concession}%</p>
    </div>
  );
}

function ClusterCard({ cluster }) {
  const miniData = [
    { name: 'Lease', value: cluster.avgLeaseUp },
    { name: 'Conc', value: cluster.avgConcession },
    { name: 'Price', value: cluster.avgPriceVsMarket / 5 },
  ];

  return (
    <div className="card text-center">
      <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: cluster.color }}>
        C{cluster.id}
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-0.5">{cluster.label}</p>
      <p className="text-xs text-gray-400 mb-3">{cluster.count} properties</p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Avg Lease-Up</span>
          <span className="font-semibold text-gray-700">{cluster.avgLeaseUp}mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Avg Concession</span>
          <span className="font-semibold text-gray-700">{cluster.avgConcession}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Price vs Market</span>
          <span className="font-semibold text-gray-700">{cluster.avgPriceVsMarket}%</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <ResponsiveContainer width="100%" height={50}>
          <BarChart data={miniData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="value" fill={cluster.color} radius={[3, 3, 0, 0]} barSize={16} fillOpacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ClusterExplorer() {
  const [colorBy, setColorBy] = useState('cluster');
  const [sizeBy, setSizeBy] = useState('leaseUpMonths');

  const radarData = [
    { feature: 'Lease-Up', fullMark: 20 },
    { feature: 'Concession', fullMark: 20 },
    { feature: 'Price Premium', fullMark: 60 },
    { feature: 'Units', fullMark: 400 },
    { feature: 'Rent Growth', fullMark: 10 },
  ].map((item) => {
    const result = { ...item };
    clusters.forEach((c) => {
      if (item.feature === 'Lease-Up') result[`C${c.id}`] = c.avgLeaseUp;
      else if (item.feature === 'Concession') result[`C${c.id}`] = c.avgConcession;
      else if (item.feature === 'Price Premium') result[`C${c.id}`] = c.avgPriceVsMarket;
      else if (item.feature === 'Units') result[`C${c.id}`] = c.avgUnits;
      else if (item.feature === 'Rent Growth') result[`C${c.id}`] = Math.abs(c.avgRentGrowth);
    });
    return result;
  });

  return (
    <div className="page-enter px-8 pb-8 space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">UMAP Cluster Projection</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-400 font-medium">Color by</label>
              <select value={colorBy} onChange={(e) => setColorBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20">
                <option value="cluster">Cluster</option>
                <option value="leaseUp">Lease-Up Speed</option>
                <option value="concession">Concession Rate</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-400 font-medium">Size by</label>
              <select value={sizeBy} onChange={(e) => setSizeBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20">
                <option value="leaseUpMonths">Lease-Up</option>
                <option value="concession">Concession</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              {clusters.filter(c => c.id < 4).map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mb-4">2D projection of all properties using UMAP dimensionality reduction. Each dot is a property, positioned so similar properties cluster together. Use dropdowns to recolor.</p>
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="x" type="number" name="UMAP-1" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'UMAP Dimension 1', position: 'bottom', fontSize: 11, fill: '#9CA3AF', offset: -2 }} />
            <YAxis dataKey="y" type="number" name="UMAP-2" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'UMAP Dimension 2', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip content={<UMAPTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={umapData} fillOpacity={0.7}>
              {umapData.map((entry, i) => {
                let fill = entry.color;
                if (colorBy === 'leaseUp') {
                  const ratio = Math.min(entry.leaseUpMonths / 20, 1);
                  fill = ratio > 0.7 ? '#EF4444' : ratio > 0.4 ? '#F59E0B' : '#10B981';
                } else if (colorBy === 'concession') {
                  const ratio = Math.min(entry.concession / 20, 1);
                  fill = ratio > 0.7 ? '#EF4444' : ratio > 0.4 ? '#F59E0B' : '#06B6D4';
                }
                return <Cell key={i} fill={fill} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {clusters.map((cluster) => (
          <ClusterCard key={cluster.id} cluster={cluster} />
        ))}
      </div>

      <div className="card">
        <ChartHeader
          title="Cluster Comparison — Radar Chart"
          description="Overlay of clusters 0–3 across 5 dimensions: lease-up speed, concession rate, price premium, unit count, and rent growth impact. Larger area = higher values."
        />
        <ResponsiveContainer width="100%" height={380}>
          <RadarChart data={radarData} outerRadius="70%">
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="feature" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} />
            {clusters.filter(c => c.id < 4).map((c) => (
              <Radar key={c.id} name={c.label} dataKey={`C${c.id}`} stroke={c.color} fill={c.color} fillOpacity={0.1} strokeWidth={2} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #E5E7EB' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
