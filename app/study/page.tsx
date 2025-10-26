'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, AlertCircle, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { LoadingDots } from '../components/loading-spinner';
import { MarkdownMessage } from '../components/markdown-message';
import { Header } from '../components/header';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type StudyConfig = {
  topic: string;
  details: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  sessionType: 'lesson' | 'quiz' | 'practice' | 'review';
  duration: 10 | 15 | 30 | 45 | 60;
};

export default function StuddyBuddyPage() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [config, setConfig] = useState<StudyConfig>({
    topic: '',
    details: '',
    level: 'beginner',
    sessionType: 'lesson',
    duration: 15,
  });
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

  const startSession = () => {
    if (!config.topic.trim()) {
      setError('Please enter a study topic');
      return;
    }

    setSessionStarted(true);
    setError(null);

    // Generate initial system message
    const systemPrompt = `You are Studdy Buddy, an expert tutor helping a student learn about "${config.topic}".

Study Session Configuration:
- Topic: ${config.topic}
- Additional Context: ${config.details || 'None provided'}
- Student Level: ${config.level}
- Session Type: ${config.sessionType}
- Duration: ${config.duration} minutes

Your role:
${getSessionTypeInstructions(config.sessionType, config.level, config.duration)}

Keep responses concise and focused. Adapt to the student's level and time constraints.`;

    // Start the lesson
    sendInitialMessage(systemPrompt);
  };

  const getSessionTypeInstructions = (type: string, level: string, duration: number) => {
    switch (type) {
      case 'lesson':
        return `Provide a structured ${duration}-minute lesson on the topic. Start with core concepts and build progressively. Use examples and check for understanding. Adjust complexity for ${level} level.`;
      case 'quiz':
        return `Create a diagnostic quiz with questions appropriate for ${level} level. Ask one question at a time, provide feedback and explain answers. Cover key concepts within ${duration} minutes.`;
      case 'practice':
        return `Guide the student through practice exercises. Provide problems, hints and detailed solutions. Match difficulty to ${level} level and fit within ${duration} minutes.`;
      case 'review':
        return `Help the student review and reinforce their knowledge. Ask what they've learned, identify gaps and provide clarifications. Keep it conversational and within ${duration} minutes.`;
      default:
        return `Provide educational support on the topic for a ${level} level student in a ${duration}-minute session.`;
    }
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
            { role: 'user', content: 'Hello! I\'m ready to start learning.' },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

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
      const systemPrompt = `You are Studdy Buddy teaching "${config.topic}" to a ${config.level} student in a ${config.duration}-minute ${config.sessionType} session.`;

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

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

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
      details: '',
      level: 'beginner',
      sessionType: 'lesson',
      duration: 15,
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
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Start Your Study Session
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Configure your personalized learning experience
              </p>
            </div>

            <div className="space-y-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              {/* Topic Input */}
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2 block">
                  What do you want to learn?
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="Enter a topic (e.g. Spanish verbs, Calculus, World History)"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50"
                  autoFocus
                />
              </div>

              {/* Details Input */}
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2 block">
                  Any specific focus? (Optional)
                </label>
                <textarea
                  value={config.details}
                  onChange={(e) => setConfig({ ...config, details: e.target.value })}
                  placeholder="e.g. I struggle with irregular verbs"
                  rows={2}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Level Selection */}
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2 block">
                    Your level
                  </label>
                  <select
                    value={config.level}
                    onChange={(e) => setConfig({ ...config, level: e.target.value as any })}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Session Type */}
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2 block">
                    Session type
                  </label>
                  <select
                    value={config.sessionType}
                    onChange={(e) => setConfig({ ...config, sessionType: e.target.value as any })}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50"
                  >
                    <option value="lesson">Lesson - Learn new concepts</option>
                    <option value="quiz">Quiz - Test your knowledge</option>
                    <option value="practice">Practice - Work through problems</option>
                    <option value="review">Review - Reinforce learning</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2 block">
                  How long? (minutes)
                </label>
                <select
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) as any })}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50"
                >
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-4 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
              >
                <Sparkles className="h-5 w-5" />
                Start Learning Session
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
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Study Session
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
              <BookOpen className="h-3 w-3" />
              {config.topic}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <TrendingUp className="h-3 w-3" />
              {config.level}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
              <Clock className="h-3 w-3" />
              {config.duration}m {config.sessionType}
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
              placeholder="Ask a question or respond..."
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
