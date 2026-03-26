'use client';

import { cn } from '@/lib/utils';

// ============ BAR CHART ============
export function BarChart({
  data,
  height = 120,
  color = '#059669',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-medium">
            {d.value > 0 ? d.value : ''}
          </span>
          <div className="w-full relative rounded-t-lg overflow-hidden bg-white/5" style={{ height: height - 30 }}>
            <div
              className="chart-bar absolute bottom-0 left-0 right-0 rounded-t-lg transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: color,
                opacity: 0.8,
                animationDelay: `${i * 80}ms`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 truncate max-w-full">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============ DONUT CHART ============
export function DonutChart({
  segments,
  size = 120,
  strokeWidth = 14,
  children,
}: {
  segments: { value: number; color: string; label?: string }[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const segLength = (seg.value / total) * circumference;
          const gap = 3;
          const dashArray = `${Math.max(segLength - gap, 0)} ${circumference - segLength + gap}`;
          const dashOffset = -offset;
          offset += segLength;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// ============ SPARKLINE ============
export function Sparkline({
  data,
  width = 120,
  height = 40,
  color = '#059669',
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
          r="3"
          fill={color}
          className="animate-pulse-glow"
        />
      )}
    </svg>
  );
}

// ============ PROGRESS BAR ============
export function ProgressBar({
  value,
  max = 100,
  color = '#059669',
  height = 6,
  label,
  showValue,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  label?: string;
  showValue?: boolean;
}) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-bold text-white">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-white/5"
        style={{ height }}
      >
        <div
          className="progress-fill rounded-full transition-all"
          style={{ width: `${percent}%`, height, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ============ MINI STAT ============
export function MiniStat({
  label,
  value,
  trend,
  trendUp,
  icon,
  color = '#059669',
  sparkData,
  delay = 0,
}: {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  color?: string;
  sparkData?: number[];
  delay?: number;
}) {
  return (
    <div
      className="stat-glow bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, color }}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && <div style={{ color }}>{icon}</div>}
        {sparkData && (
          <Sparkline data={sparkData} width={60} height={24} color={color} />
        )}
      </div>
      <div className="text-2xl font-bold text-white animate-count-up" style={{ animationDelay: `${delay + 200}ms` }}>
        {value}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-slate-500">{label}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold',
              trendUp ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
