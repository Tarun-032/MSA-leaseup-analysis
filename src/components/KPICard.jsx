import { useEffect, useState } from 'react';

export default function KPICard({ icon: Icon, label, value, suffix, trend, trendLabel, color, accentColor }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 800;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = numericValue / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        current = numericValue;
        clearInterval(timer);
      }
      setDisplayValue(
        numericValue % 1 !== 0 ? current.toFixed(1) : Math.round(current)
      );
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const isPositive = trend > 0;
  const trendColor = isPositive ? 'text-success bg-success/10' : 'text-danger bg-danger/10';

  return (
    <div className="card relative overflow-hidden group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${trendColor}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-[32px] font-bold text-gray-900 leading-none kpi-animate">
        {displayValue}
        {suffix && <span className="text-lg font-medium text-gray-400 ml-1">{suffix}</span>}
      </p>
      {trendLabel && (
        <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>
      )}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
        style={{ backgroundColor: accentColor || color }}
      />
    </div>
  );
}
