import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { usageTracker } from '@/lib/usage-tracker';

// Configuration constants
const CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 2000, // Max tokens per response (better quality responses)
  MAX_CONTEXT_MESSAGES: 25, // Keep last 25 messages max (better context)
  MAX_MESSAGE_LENGTH: 3000, // Max chars per message (more flexible)
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 50, // 50 requests per minute (more forgiving)
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

    // Call OpenAI with streaming enabled
    const stream = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: truncatedMessages,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: 0.7,
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let promptTokens = 0;
    let completionTokens = 0;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              completionTokens += 1; // Rough estimate
              controller.enqueue(encoder.encode(content));
            }
          }

          // Estimate tokens (rough approximation)
          promptTokens = Math.ceil(
            truncatedMessages.reduce((acc, msg) => acc + msg.content.length, 0) / 4
          );

          // Calculate cost
          const cost = (promptTokens * 0.00015) / 1000 + (completionTokens * 0.0006) / 1000;

          // Track usage
          usageTracker.addLog({
            endpoint: '/api/chat',
            model: CONFIG.MODEL,
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            cost,
            ip: rateLimitKey,
            success: true,
          });

          // Log usage for monitoring
          console.log('[API Usage]', {
            timestamp: new Date().toISOString(),
            model: CONFIG.MODEL,
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            estimatedCost: cost.toFixed(6),
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
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
