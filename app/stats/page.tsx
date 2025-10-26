'use client';

import { useState, useEffect } from 'react';
import { Activity, DollarSign, Zap, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Header } from '../components/header';

type UsageLog = {
  id: string;
  timestamp: string;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  ip: string;
  success: boolean;
  error?: string;
};

type UsageStats = {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalCost: number;
  averageTokensPerRequest: number;
  requestsPerMinute: number;
  costToday: number;
  tokensToday: number;
  requestsToday: number;
};

type DashboardData = {
  stats: UsageStats;
  logs: UsageLog[];
  activity: { timestamp: string; count: number }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch data');
      const dashboardData = await res.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-600 dark:text-zinc-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-red-600 dark:text-red-400">{error || 'No data available'}</div>
      </div>
    );
  }

  const { stats, logs, activity } = data;
  const successRate = stats.totalRequests > 0
    ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            API usage and request monitoring
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Requests */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Requests</p>
                <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                  {stats.totalRequests}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {stats.requestsToday} today
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Cost</p>
                <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                  ${stats.totalCost.toFixed(4)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  ${stats.costToday.toFixed(4)} today
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Tokens</p>
                <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                  {stats.totalTokens.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {stats.tokensToday.toLocaleString()} today
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Success Rate</p>
                <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                  {successRate}%
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {stats.failedRequests} failed
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-8">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
            Activity (Last Hour)
          </h2>
          <div className="flex items-end gap-1 h-32">
            {activity.slice(-30).map((item, idx) => {
              const maxCount = Math.max(...activity.map(a => a.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                  style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                  title={`${item.timestamp}: ${item.count} requests`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>30 min ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
            Recent Requests
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 pb-3">
                    Time
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 pb-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 pb-3">
                    Tokens
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 pb-3">
                    Cost
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 pb-3">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="text-sm">
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-zinc-900 dark:text-zinc-50 font-mono">
                      {log.totalTokens}
                    </td>
                    <td className="py-3 text-zinc-900 dark:text-zinc-50 font-mono">
                      ${log.cost.toFixed(6)}
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Avg Tokens/Request</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
              {stats.averageTokensPerRequest.toFixed(0)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Requests/Minute</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
              {stats.requestsPerMinute}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Model</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
              gpt-4o-mini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
