'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type ChartType = 'area' | 'bar' | 'line';

interface DataPoint {
  [key: string]: string | number;
}

interface SeriesConfig {
  dataKey: string;
  name: string;
  color: string;
}

interface AnalyticsChartProps {
  type?: ChartType;
  data: DataPoint[];
  series: SeriesConfig[];
  xAxisKey: string;
  title?: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

const chartColors = {
  grid: 'hsl(var(--border))',
  text: 'hsl(var(--muted-foreground))',
  background: 'hsl(var(--background))',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsChart({
  type = 'area',
  data,
  series,
  xAxisKey,
  title,
  subtitle,
  height = 300,
  showGrid = true,
  showLegend = true,
  className = '',
}: AnalyticsChartProps) {
  const gradientDefs = useMemo(
    () =>
      series.map((s) => (
        <linearGradient key={s.dataKey} id={`gradient-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={s.color} stopOpacity={0} />
        </linearGradient>
      )),
    [series],
  );

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 10, left: 0, bottom: 0 },
    };

    const axisProps = {
      xAxis: (
        <XAxis
          key="xaxis"
          dataKey={xAxisKey}
          tick={{ fontSize: 11, fill: chartColors.text }}
          tickLine={false}
          axisLine={false}
          dy={8}
        />
      ),
      yAxis: (
        <YAxis
          key="yaxis"
          tick={{ fontSize: 11, fill: chartColors.text }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toString()}
          width={45}
        />
      ),
      grid: showGrid ? (
        <CartesianGrid key="grid" strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
      ) : null,
      tooltip: <Tooltip key="tooltip" content={<CustomTooltip />} />,
      legend: showLegend ? (
        <Legend key="legend" verticalAlign="top" height={36} iconType="circle" iconSize={8} />
      ) : null,
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>{gradientDefs}</defs>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={`url(#gradient-${s.dataKey})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps} barGap={2}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            {series.map((s) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, fill: chartColors.background }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
