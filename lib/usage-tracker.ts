// In-memory usage tracking (use database in production)

export type UsageLog = {
  id: string;
  timestamp: Date;
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

export type UsageStats = {
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

class UsageTracker {
  private logs: UsageLog[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  addLog(log: Omit<UsageLog, 'id' | 'timestamp'>) {
    const newLog: UsageLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      ...log,
    };

    this.logs.unshift(newLog);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return newLog;
  }

  getLogs(limit?: number): UsageLog[] {
    return limit ? this.logs.slice(0, limit) : this.logs;
  }

  getStats(): UsageStats {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    const todayLogs = this.logs.filter((log) => log.timestamp >= todayStart);
    const recentLogs = this.logs.filter((log) => log.timestamp >= oneMinuteAgo);

    const successfulRequests = this.logs.filter((log) => log.success).length;
    const failedRequests = this.logs.filter((log) => !log.success).length;

    const totalTokens = this.logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCost = this.logs.reduce((sum, log) => sum + log.cost, 0);

    const tokensToday = todayLogs.reduce((sum, log) => sum + log.totalTokens, 0);
    const costToday = todayLogs.reduce((sum, log) => sum + log.cost, 0);

    return {
      totalRequests: this.logs.length,
      successfulRequests,
      failedRequests,
      totalTokens,
      totalCost,
      averageTokensPerRequest: this.logs.length > 0 ? totalTokens / this.logs.length : 0,
      requestsPerMinute: recentLogs.length,
      costToday,
      tokensToday,
      requestsToday: todayLogs.length,
    };
  }

  getRecentActivity(minutes = 60): { timestamp: string; count: number }[] {
    const now = new Date();
    const activity: Map<string, number> = new Map();

    for (let i = minutes - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      const key = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
      activity.set(key, 0);
    }

    this.logs.forEach((log) => {
      const logTime = new Date(log.timestamp);
      const diff = now.getTime() - logTime.getTime();
      if (diff <= minutes * 60000) {
        const key = `${logTime.getHours()}:${logTime.getMinutes().toString().padStart(2, '0')}`;
        activity.set(key, (activity.get(key) || 0) + 1);
      }
    });

    return Array.from(activity.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .reverse();
  }

  clearLogs() {
    this.logs = [];
  }
}

export const usageTracker = new UsageTracker();
