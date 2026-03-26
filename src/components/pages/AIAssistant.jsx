import { useState, useRef, useEffect, Fragment } from 'react';
import {
  Send, Sparkles, RotateCcw, Building2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, ScatterChart, Scatter, LineChart, Line,
} from 'recharts';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const QUICK_PROMPTS = [
  'Which cluster leases fastest and why?',
  'What are the worst rent declines?',
  'How does delivery season affect lease-up?',
  'Compare Austin vs Akron markets',
  'How did 2008 crisis impact lease-ups?',
  'What drives high concession rates?',
  'Tell me about the premium pricing cluster',
  'How do new vs recent buildings compare?',
];

/* ── Chart tooltip ──────────────────────────────── */
const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white px-2.5 py-1.5 rounded-lg shadow-lg border border-gray-100 text-[11px]">
      <p className="font-semibold text-gray-800">{d.name || d.range || d.bucket || d.fullName || ''}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-gray-500">
          {p.name}: <span className="font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ── Shared chart renderer ──────────────────────── */
function renderChart(chart, height = 200) {
  if (!chart?.data?.length) return null;

  switch (chart.type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chart.data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={0} angle={chart.data.length > 7 ? -25 : 0} textAnchor={chart.data.length > 7 ? 'end' : 'middle'} height={chart.data.length > 7 ? 45 : 25} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTip />} />
            <Bar dataKey={chart.yKey} name={chart.yLabel || chart.yKey} radius={[4, 4, 0, 0]} barSize={chart.data.length > 8 ? 16 : 28}>
              {chart.colorByItem
                ? chart.data.map((e, i) => <Cell key={i} fill={e.fill || '#6366F1'} />)
                : chart.data.map((_, i) => <Cell key={i} fill={chart.color || '#6366F1'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    case 'horizontal_bar':
      return (
        <ResponsiveContainer width="100%" height={Math.max(180, chart.data.length * 28)}>
          <BarChart data={chart.data} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
            <XAxis type="number" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={chart.yKey} tick={{ fontSize: 8, fill: '#6B7280' }} axisLine={false} tickLine={false} width={130} />
            <Tooltip content={<ChartTip />} />
            <Bar dataKey={chart.xKey} name={chart.xLabel || ''} radius={[0, 4, 4, 0]} barSize={16}>
              {chart.data.map((e, i) => <Cell key={i} fill={e.fill || '#EF4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={chart.data} cx="50%" cy="50%" outerRadius={height * 0.34} innerRadius={height * 0.16} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 9 }}>
              {chart.data.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Tooltip content={<ChartTip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey={chart.xKey} type="number" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: chart.xLabel, position: 'bottom', fontSize: 9, fill: '#9CA3AF', offset: -3 }} />
            <YAxis dataKey={chart.yKey} type="number" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTip />} />
            <Scatter data={chart.data} fill="#6366F1" fillOpacity={0.6}>
              {chart.data.map((e, i) => <Cell key={i} fill={e.color || '#6366F1'} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chart.data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTip />} />
            <Line type="monotone" dataKey={chart.yKey} stroke={chart.color || '#6366F1'} strokeWidth={2} dot={{ r: 3, fill: chart.color || '#6366F1' }} name={chart.yLabel} />
          </LineChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
}

/* ── Chat message ──────────────────────────────── */
function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parsed = line.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      return <p key={i} className={i > 0 ? 'mt-1.5' : ''} dangerouslySetInnerHTML={{ __html: parsed }} />;
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles size={14} className="text-primary" />
        </div>
      )}
      <div className="max-w-[75%]">
        {message.chart && (
          <div className="mb-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{message.chart.title}</p>
            {renderChart(message.chart, 200)}
          </div>
        )}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-md'
        }`}>
          {renderContent(message.content)}
        </div>
        <p className={`text-[10px] text-gray-300 mt-1 ${isUser ? 'text-right' : ''}`}>{formatTime(message.id)}</p>
      </div>
    </div>
  );
}

/* ── Skeleton loader ───────────────────────────── */
function SkeletonLoader() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-primary/40" />
      </div>
      <div className="flex-1 space-y-2.5 pt-2 max-w-[60%]">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-4/5 rounded-full" />
        <div className="skeleton h-3 w-3/5 rounded-full" />
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────── */
export default function AIAssistant({ messages, isLoading, sendMessage, clearMessages }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen">
      {/* Header — only in chat state */}
      {hasMessages && (
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-3 border-b border-gray-100 bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">LeaseUp AI</span>
            <span className="text-[11px] text-gray-400 ml-1">Real estate analytics specialist</span>
          </div>
          <button onClick={clearMessages} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <RotateCcw size={12} /> New conversation
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* ── Empty state ── */
          <div
            className="flex flex-col items-center px-8 pt-16 pb-8"
            style={{ minHeight: '100%', background: 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, rgba(6,182,212,0.02) 35%, transparent 65%)' }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6">
              <Building2 size={30} className="text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">How can we assist you today?</h1>
            <p className="text-sm text-gray-400 mb-12 max-w-lg text-center leading-relaxed">
              Ask anything about real estate analytics, lease-up trends, rent growth, clusters,
              or market performance. Relevant charts from the dashboard will appear inline.
            </p>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-2.5 max-w-xl w-full">
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="group text-left px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-primary/25 hover:shadow-md transition-all duration-200 text-[13px] text-gray-600 hover:text-gray-900"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Chat messages ── */
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <SkeletonLoader />}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about real estate, lease-up trends, rent growth..."
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 transition-all flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
