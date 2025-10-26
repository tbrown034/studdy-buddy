'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, Sparkles } from 'lucide-react';
import { LoadingDots } from '../components/loading-spinner';
import { MarkdownMessage } from '../components/markdown-message';
import { Header } from '../components/header';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="flex h-[60dvh] flex-col items-center justify-center gap-6 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white">
                <Sparkles className="h-8 w-8 text-white dark:text-zinc-900" />
              </div>
              <div className="max-w-md text-center space-y-2">
                <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                  Start a conversation
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Ask anything or explore study and coding modes
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 sm:gap-4 animate-slide-up ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                  <Bot className="h-4 w-4 text-white dark:text-zinc-900" />
                </div>
              )}

              <div
                className={`group relative max-w-[90%] sm:max-w-[85%] rounded-xl px-4 py-3 sm:px-5 sm:py-4 ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <MarkdownMessage content={msg.content} isUser={msg.role === 'user'} />
              </div>

              {msg.role === 'user' && (
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                  <User className="h-4 w-4 text-white dark:text-zinc-900" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-slide-up">
              <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                <Bot className="h-4 w-4 text-white dark:text-zinc-900" />
              </div>
              <div className="max-w-[90%] sm:max-w-[85%] rounded-xl px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
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
      <div className="sticky bottom-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-4 py-4 sm:px-6 safe-area-inset-bottom">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-white px-4 py-3 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
