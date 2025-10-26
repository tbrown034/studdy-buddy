import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { usageTracker } from '@/lib/usage-tracker';

// Configuration constants
const CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 1000, // Max tokens per response
  MAX_CONTEXT_MESSAGES: 20, // Keep last 20 messages max
  MAX_MESSAGE_LENGTH: 2000, // Max chars per message
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 20, // 20 requests per minute
  TIMEOUT_MS: 30000, // 30 second timeout
} as const;

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(req: Request): string {
  // Use IP address or fallback to a generic key
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + CONFIG.RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: CONFIG.MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return {
    allowed: true,
    remaining: CONFIG.MAX_REQUESTS_PER_WINDOW - record.count,
  };
}

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function validateMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages)) return false;
  if (messages.length === 0) return false;
  if (messages.length > CONFIG.MAX_CONTEXT_MESSAGES) return false;

  return messages.every((msg) => {
    if (!msg || typeof msg !== 'object') return false;
    if (!('role' in msg) || !('content' in msg)) return false;
    if (typeof msg.content !== 'string') return false;
    if (msg.content.length > CONFIG.MAX_MESSAGE_LENGTH) return false;
    if (!['user', 'assistant', 'system'].includes(msg.role)) return false;
    return true;
  });
}

function truncateContext(messages: ChatMessage[]): ChatMessage[] {
  // Keep system message if present and last N messages
  const systemMessages = messages.filter((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');
  const recentMessages = nonSystemMessages.slice(-CONFIG.MAX_CONTEXT_MESSAGES);
  return [...systemMessages, ...recentMessages];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: CONFIG.TIMEOUT_MS,
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(req);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const { messages } = body;

    if (!validateMessages(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format or message too long.' },
        { status: 400 }
      );
    }

    // Truncate context to prevent unbounded growth
    const truncatedMessages = truncateContext(messages);

    // Call OpenAI with safeguards
    const completion = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: truncatedMessages,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: 0.7,
      stream: false,
    });

    const responseMessage = completion.choices[0].message;
    const usage = completion.usage;

    // Calculate cost
    const cost = usage?.total_tokens
      ? (usage.prompt_tokens * 0.00015) / 1000 + (usage.completion_tokens * 0.0006) / 1000
      : 0;

    // Track usage
    usageTracker.addLog({
      endpoint: '/api/chat',
      model: CONFIG.MODEL,
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
      cost,
      ip: rateLimitKey,
      success: true,
    });

    // Log usage for monitoring
    console.log('[API Usage]', {
      timestamp: new Date().toISOString(),
      model: CONFIG.MODEL,
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      estimatedCost: cost.toFixed(6),
    });

    return NextResponse.json(
      { message: responseMessage },
      {
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Track failed request
    usageTracker.addLog({
      endpoint: '/api/chat',
      model: CONFIG.MODEL,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      ip: getRateLimitKey(req),
      success: false,
      error: errorMessage,
    });

    console.error('[API Error]', {
      timestamp: new Date().toISOString(),
      error: errorMessage,
    });

    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process chat request.' },
      { status: 500 }
    );
  }
}
