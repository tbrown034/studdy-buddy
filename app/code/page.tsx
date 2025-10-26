'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Code2, User, Bot, AlertCircle, BookOpen, Clock, TrendingUp, Layers } from 'lucide-react';
import { LoadingDots } from '../components/loading-spinner';
import { MarkdownMessage } from '../components/markdown-message';
import { Header } from '../components/header';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type TechStack = 'nextjs-ts' | 'nextjs-js' | 'react-ts' | 'react-js' | 'python' | 'node-ts' | 'node-js';

type CodingConfig = {
  topic: string;
  sessionType: 'lesson' | 'debug' | 'build' | 'review';
  techStack: TechStack;
};

const TECH_STACKS: Record<TechStack, { label: string; context: string }> = {
  'nextjs-ts': {
    label: 'Next.js + TypeScript',
    context: 'Next.js 16 with Turbopack, App Router, React 19.2, TypeScript 5.9, Server Actions and Tailwind CSS v4'
  },
  'nextjs-js': {
    label: 'Next.js + JavaScript',
    context: 'Next.js 16 with Turbopack, App Router, React 19.2, modern JavaScript and Tailwind CSS v4'
  },
  'react-ts': {
    label: 'React + TypeScript',
    context: 'React 19.2 with TypeScript 5.9, Hooks, Server Components and modern best practices'
  },
  'react-js': {
    label: 'React + JavaScript',
    context: 'React 19.2 with modern JavaScript, Hooks and functional components'
  },
  'python': {
    label: 'Python',
    context: 'Python 3.12+ with modern syntax, type hints and best practices'
  },
  'node-ts': {
    label: 'Node.js + TypeScript',
    context: 'Node.js with TypeScript 5.9, ES modules and modern async patterns'
  },
  'node-js': {
    label: 'Node.js + JavaScript',
    context: 'Node.js with modern JavaScript, ES modules and async/await'
  }
};

export default function StuddyBuddyCodingPage() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [config, setConfig] = useState<CodingConfig>({
    topic: '',
    sessionType: 'lesson',
    techStack: 'nextjs-ts',
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const buildSystemPrompt = () => {
    const stackInfo = TECH_STACKS[config.techStack];
    const sessionInstructions = getSessionTypeInstructions(config.sessionType);

    return `You are an expert coding instructor specializing in modern web development.

**Session Context:**
Topic: ${config.topic}
Session Type: ${config.sessionType}
Tech Stack: ${stackInfo.context}

**Your Approach:**
${sessionInstructions}

**Important Guidelines:**
- Use the latest 2025 features and best practices
- Write clean, well-commented code examples
- Include type annotations when using TypeScript
- Use functional components and modern patterns
- Explain concepts clearly with practical examples
- Format all code in markdown code blocks with language tags
- Be concise and adaptive - gauge complexity from user responses

Let's begin!`;
  };

  const getSessionTypeInstructions = (type: string) => {
    switch (type) {
      case 'lesson':
        return `Teach the coding topic systematically. Start with core concepts, provide clear code examples and highlight best practices.`;
      case 'debug':
        return `Help debug code issues. Ask to see the code and errors, identify root causes, explain the fix and suggest prevention strategies.`;
      case 'build':
        return `Guide step-by-step project building. Understand requirements, design architecture and implement features incrementally with explanations.`;
      case 'review':
        return `Review code and provide constructive feedback. Analyze structure, identify improvements and teach best practices through examples.`;
      default:
        return 'Provide expert coding instruction and support';
    }
  };

  const startSession = () => {
    if (!config.topic.trim()) {
      setError('Please enter a coding topic');
      return;
    }

    setSessionStarted(true);
    setError(null);
    sendInitialMessage(buildSystemPrompt());
  };

  const sendInitialMessage = async (systemPrompt: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Hi! I\'m ready to start this coding session.' },
          ],
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages([data.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const systemPrompt = buildSystemPrompt();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            userMessage,
          ],
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setMessages([]);
    setConfig({
      topic: '',
      sessionType: 'lesson',
      techStack: 'nextjs-ts',
    });
    setError(null);
  };

  if (!sessionStarted) {
    return (
      <div className="flex min-h-dvh flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
        <Header />

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 text-center">
              <div className="inline-flex rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-4 mb-4">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Start Your Coding Session
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Configure your personalized coding learning experience
              </p>
            </div>

            <div className="space-y-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
              {/* Main Topic Input */}
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2 block">
                  What do you want to code?
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="e.g. Build a todo app, Learn React hooks, Debug my API, Review my code"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-base text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Session Type - Clear visual cards */}
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3 block">
                  How can I help?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'lesson', label: 'Learn', desc: 'Teach me concepts', icon: BookOpen },
                    { value: 'debug', label: 'Debug', desc: 'Fix my code', icon: AlertCircle },
                    { value: 'build', label: 'Build', desc: 'Create step-by-step', icon: Code2 },
                    { value: 'review', label: 'Review', desc: 'Improve my code', icon: TrendingUp },
                  ].map(({ value, label, desc, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setConfig({ ...config, sessionType: value as any })}
                      className={`relative px-4 py-4 rounded-xl text-left transition-all ${
                        config.sessionType === value
                          ? 'bg-blue-500 text-white shadow-lg scale-[1.02]'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-2 ${
                        config.sessionType === value ? 'text-white' : 'text-blue-500'
                      }`} />
                      <div className="font-semibold text-base">{label}</div>
                      <div className={`text-xs mt-0.5 ${
                        config.sessionType === value ? 'text-blue-100' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Stack Dropdown */}
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2 block">
                  Tech stack
                </label>
                <select
                  value={config.techStack}
                  onChange={(e) => setConfig({ ...config, techStack: e.target.value as TechStack })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-base text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {(Object.keys(TECH_STACKS) as TechStack[]).map((stack) => (
                    <option key={stack} value={stack}>
                      {TECH_STACKS[stack].label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                  {TECH_STACKS[config.techStack].context}
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={startSession}
                disabled={!config.topic.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg disabled:hover:shadow-none"
              >
                <Code2 className="h-5 w-5" />
                Start Coding Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <Header />

      {/* Session Info Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-500" />
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Coding Session
              </h2>
            </div>
            <button
              onClick={resetSession}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              New Session
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Code2 className="h-3 w-3" />
              {config.topic}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {TECH_STACKS[config.techStack].label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
              {config.sessionType.charAt(0).toUpperCase() + config.sessionType.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 sm:gap-4 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div
                className={`group relative max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 shadow-sm'
                }`}
              >
                <MarkdownMessage content={msg.content} isUser={msg.role === 'user'} />
              </div>

              {msg.role === 'user' && (
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
                  <User className="h-5 w-5 text-white dark:text-zinc-900" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 sm:gap-4 justify-start">
              <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <LoadingDots />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 sm:gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3 sm:p-4">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-200">
                  Error
                </p>
                <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1 overflow-wrap-anywhere">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-4 safe-area-inset-bottom">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or share your code..."
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-xl bg-blue-500 px-4 py-2.5 sm:px-5 sm:py-3 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
