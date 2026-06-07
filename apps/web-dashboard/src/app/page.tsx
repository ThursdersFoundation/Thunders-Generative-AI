'use client';

import { useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import AnalyticsChart from '@/components/AnalyticsChart';
import { useUIStore } from '@/stores/uiStore';
import clsx from 'clsx';

const MOCK_USAGE_DATA = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    requests: Math.floor(Math.random() * 5000) + 2000,
    tokens: Math.floor(Math.random() * 2000000) + 500000,
  };
});

const MOCK_LATENCY_DATA = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    p50: Math.floor(Math.random() * 80) + 60,
    p95: Math.floor(Math.random() * 200) + 150,
    p99: Math.floor(Math.random() * 400) + 300,
  };
});

const STATS = [
  { label: 'Total Requests', value: '24,591', change: '+12.5%', changeType: 'positive' as const, icon: '📈' },
  { label: 'Active Models', value: '12', change: '+2', changeType: 'positive' as const, icon: '🧠' },
  { label: 'Tokens Used', value: '4.2M', change: '+8.3%', changeType: 'positive' as const, icon: '🔤' },
  { label: 'Avg Latency', value: '89ms', change: '-5.2%', changeType: 'positive' as const, icon: '⚡' },
];

const RECENT_ACTIVITY = [
  { id: '1', action: 'Model gpt-4o completed request', time: '2 min ago', type: 'success' },
  { id: '2', action: 'New API key created: prod-key-***', time: '15 min ago', type: 'info' },
  { id: '3', action: 'Model claude-3-opus rate limit reached', time: '32 min ago', type: 'warning' },
  { id: '4', action: 'Deployment v2.1.0 rolled out', time: '1 hr ago', type: 'info' },
  { id: '5', action: 'Budget alert: 80% of monthly limit', time: '2 hrs ago', type: 'warning' },
  { id: '6', action: 'Model dall-e-3 request failed', time: '3 hrs ago', type: 'error' },
];

export default function DashboardPage() {
  const { sidebarCollapsed } = useUIStore();

  const usageChartData = useMemo(() => MOCK_USAGE_DATA, []);
  const latencyChartData = useMemo(() => MOCK_LATENCY_DATA, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main
        className={clsx(
          'transition-all duration-300 pt-0',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
        <div className="p-4 lg:p-8 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your AI platform activity and performance.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{stat.icon}</span>
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      stat.changeType === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400',
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsChart
              type="area"
              data={usageChartData}
              xAxisKey="date"
              series={[
                { dataKey: 'requests', name: 'Requests', color: 'hsl(var(--primary))' },
              ]}
              title="API Requests"
              subtitle="Last 14 days"
            />
            <AnalyticsChart
              type="line"
              data={latencyChartData}
              xAxisKey="date"
              series={[
                { dataKey: 'p50', name: 'P50', color: '#22c55e' },
                { dataKey: 'p95', name: 'P95', color: '#f59e0b' },
                { dataKey: 'p99', name: 'P99', color: '#ef4444' },
              ]}
              title="Response Latency"
              subtitle="Percentile distribution over 14 days"
            />
          </div>

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Token Usage Bar Chart */}
            <AnalyticsChart
              type="bar"
              data={usageChartData.slice(-7)}
              xAxisKey="date"
              series={[
                { dataKey: 'tokens', name: 'Tokens', color: 'hsl(var(--primary))' },
              ]}
              title="Token Consumption"
              subtitle="Last 7 days"
              height={250}
            />

            {/* Recent Activity */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    <div
                      className={clsx(
                        'mt-1 h-2 w-2 rounded-full flex-shrink-0',
                        activity.type === 'success' && 'bg-emerald-500',
                        activity.type === 'info' && 'bg-blue-500',
                        activity.type === 'warning' && 'bg-amber-500',
                        activity.type === 'error' && 'bg-red-500',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
