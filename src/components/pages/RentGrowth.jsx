import { useState, useMemo } from 'react';
import { TrendingDown, AlertTriangle, BarChart3, Search, ArrowUpDown } from 'lucide-react';
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { worstRentDeclines, rentDeclineStats, clusters } from '../../data/dataset';

function ChartHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">{title}</h3>
      <p className="text-[11px] text-gray-400 mt-0.5 font-normal normal-case tracking-normal">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, description }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {description && <p className="text-[11px] text-gray-400 mt-2">{description}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{d.name}</p>
      <p className="text-gray-600">Decline: <span className="font-medium text-danger">{d.decline}%</span></p>
      <p className="text-gray-600">Delivery: <span className="font-medium">{d.deliveryDate}</span></p>
      <p className="text-gray-600">Lease-Up: <span className="font-medium">{d.leaseUpMonths}mo</span></p>
    </div>
  );
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{d.name}</p>
      <p className="text-gray-600">Decline: <span className="font-medium">{d.decline}%</span></p>
      <p className="text-gray-600">Lease-Up: <span className="font-medium">{d.leaseUpMonths}mo</span></p>
    </div>
  );
}

export default function RentGrowth() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('decline');
  const [sortDir, setSortDir] = useState('asc');

  const barColor = (val) => {
    const absVal = Math.abs(val);
    if (absVal > 25) return '#EF4444';
    if (absVal > 18) return '#F97316';
    if (absVal > 12) return '#F59E0B';
    return '#FB923C';
  };

  const sorted = useMemo(() => {
    let data = [...worstRentDeclines];
    if (search) {
      data = data.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    }
    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return data;
  }, [search, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const horizontalBarData = worstRentDeclines.slice(0, 15).map((d) => ({
    ...d, absDecline: Math.abs(d.decline),
  }));

  return (
    <div className="page-enter px-8 pb-8 space-y-6">
      <div className="grid grid-cols-3 gap-5">
        <StatCard icon={TrendingDown} label="Avg Rent Decline" value={`${rentDeclineStats.avgDecline}%`} color="#EF4444" description="Mean first-year rent change across all 104 properties with negative growth." />
        <StatCard icon={AlertTriangle} label="Worst Drop" value={`${rentDeclineStats.worstDrop}%`} color="#F97316" description="Colonial Grand at Ashton Oaks — delivered Oct 2008 during peak financial crisis." />
        <StatCard icon={BarChart3} label="Median Decline" value={`${rentDeclineStats.medianDecline}%`} color="#F59E0B" description="Half of declining properties lost less than 5.7% in first-year rents." />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <ChartHeader
            title="Top 15 Worst Rent Declines"
            description="Y: property name · X: absolute rent decline (%). Color intensity reflects severity — red > 25%, orange > 18%, amber > 12%."
          />
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={horizontalBarData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Decline (%)', position: 'bottom', fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} width={180} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="absDecline" name="Rent Decline (%)" radius={[0, 6, 6, 0]} barSize={18}>
                {horizontalBarData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.decline)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <ChartHeader
            title="Lease-Up Time vs Rent Decline"
            description="X: months to stabilize · Y: first-year rent change (%). Dots colored by cluster — longer lease-ups loosely correlate with steeper declines."
          />
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="leaseUpMonths" type="number" name="Lease-Up" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Lease-Up (months)', position: 'bottom', fontSize: 11, fill: '#9CA3AF', offset: -2 }} />
              <YAxis dataKey="decline" type="number" name="Decline" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'Rent Decline (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip content={<ScatterTooltip />} />
              <ReferenceLine y={0} stroke="#E5E7EB" />
              <Scatter data={worstRentDeclines} fill="#EF4444" fillOpacity={0.7}>
                {worstRentDeclines.map((entry, i) => (
                  <Cell key={i} fill={clusters[entry.cluster]?.color || '#EF4444'} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[13px] font-medium uppercase tracking-wider text-gray-400">Rent Decline Data Table</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search properties..." className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary w-64" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mb-4">Sortable table of all properties with negative first-year rent growth. Click column headers to sort.</p>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 sticky top-0">
                {[
                  { key: 'name', label: 'Property Name' },
                  { key: 'decline', label: 'Rent Decline' },
                  { key: 'deliveryDate', label: 'Delivery Date' },
                  { key: 'leaseUpMonths', label: 'Lease-Up' },
                  { key: 'cluster', label: 'Cluster' },
                ].map((col) => (
                  <th key={col.key} onClick={() => toggleSort(col.key)} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none">
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} className="text-gray-300" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const cluster = clusters[row.cluster];
                return (
                  <tr key={row.name} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-primary/5 transition-colors`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-danger/10 text-danger text-xs font-semibold">{row.decline}%</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.deliveryDate}</td>
                    <td className="px-4 py-3 text-gray-600">{row.leaseUpMonths}mo</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: `${cluster?.color}15`, color: cluster?.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cluster?.color }} />
                        {cluster?.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
