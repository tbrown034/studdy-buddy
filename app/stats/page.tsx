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
      <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-black">
        <div className="font-mono text-zinc-600 dark:text-zinc-400">[loading...]</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-black">
        <div className="font-mono text-red-600 dark:text-red-400">[error: {error || 'no data'}]</div>
      </div>
    );
  }

  const { stats, logs, activity } = data;
  const successRate = stats.totalRequests > 0
    ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-dvh bg-white dark:bg-black">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div className="mb-8 pb-6 border-b-2 border-black dark:border-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-mono">
            [stats]
          </h1>
          <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
            api usage and request monitoring
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4 mb-8 bg-black dark:bg-white border-2 border-black dark:border-white">
          {/* Total Requests */}
          <div className="bg-white dark:bg-black p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                  total requests
                </p>
                <p className="text-4xl font-bold font-mono text-black dark:text-white mb-2">
                  {stats.totalRequests}
                </p>
                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {stats.requestsToday} today
                </p>
              </div>
              <div className="shrink-0">
                <Activity className="h-6 w-6 text-black dark:text-white" />
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-white dark:bg-black p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                  total cost
                </p>
                <p className="text-4xl font-bold font-mono text-black dark:text-white mb-2">
                  ${stats.totalCost.toFixed(4)}
                </p>
                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  ${stats.costToday.toFixed(4)} today
                </p>
              </div>
              <div className="shrink-0">
                <DollarSign className="h-6 w-6 text-black dark:text-white" />
              </div>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="bg-white dark:bg-black p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                  total tokens
                </p>
                <p className="text-4xl font-bold font-mono text-black dark:text-white mb-2">
                  {stats.totalTokens.toLocaleString()}
                </p>
                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {stats.tokensToday.toLocaleString()} today
                </p>
              </div>
              <div className="shrink-0">
                <Zap className="h-6 w-6 text-black dark:text-white" />
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white dark:bg-black p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                  success rate
                </p>
                <p className="text-4xl font-bold font-mono text-black dark:text-white mb-2">
                  {successRate}%
                </p>
                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {stats.failedRequests} failed
                </p>
              </div>
              <div className="shrink-0">
                <TrendingUp className="h-6 w-6 text-black dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 mb-8">
          <h2 className="font-mono font-bold text-lg mb-6">
            [activity - last hour]
          </h2>
          <div className="flex items-end gap-1 h-32 border-2 border-black dark:border-white p-2">
            {activity.slice(-30).map((item, idx) => {
              const maxCount = Math.max(...activity.map(a => a.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-black dark:bg-white hover:opacity-70 transition-opacity"
                  style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                  title={`${item.timestamp}: ${item.count} requests`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <span>30 min ago</span>
            <span>now</span>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 mb-8">
          <h2 className="font-mono font-bold text-lg mb-6">
            [recent requests]
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b-2 border-black dark:border-white">
                  <th className="text-left text-xs font-bold uppercase tracking-wider pb-3">
                    time
                  </th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider pb-3">
                    status
                  </th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider pb-3">
                    tokens
                  </th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider pb-3">
                    cost
                  </th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider pb-3">
                    ip
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
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
                          ok
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          fail
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-black dark:text-white">
                      {log.totalTokens}
                    </td>
                    <td className="py-3 text-black dark:text-white">
                      ${log.cost.toFixed(6)}
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400 text-xs">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-px sm:grid-cols-3 bg-black dark:bg-white border-2 border-black dark:border-white">
          <div className="bg-white dark:bg-black p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              avg tokens/request
            </p>
            <p className="text-2xl font-bold font-mono text-black dark:text-white">
              {stats.averageTokensPerRequest.toFixed(0)}
            </p>
          </div>
          <div className="bg-white dark:bg-black p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              requests/minute
            </p>
            <p className="text-2xl font-bold font-mono text-black dark:text-white">
              {stats.requestsPerMinute}
            </p>
          </div>
          <div className="bg-white dark:bg-black p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              model
            </p>
            <p className="text-2xl font-bold font-mono text-black dark:text-white">
              gpt-4o-mini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
