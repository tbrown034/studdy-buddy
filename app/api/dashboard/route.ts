import { NextResponse } from 'next/server';
import { usageTracker } from '@/lib/usage-tracker';

export async function GET() {
  try {
    const stats = usageTracker.getStats();
    const logs = usageTracker.getLogs(100); // Last 100 logs
    const activity = usageTracker.getRecentActivity(60); // Last 60 minutes

    return NextResponse.json({
      stats,
      logs,
      activity,
    });
  } catch (error) {
    console.error('[Dashboard Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
