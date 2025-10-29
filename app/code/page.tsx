'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Code2, User, Bot, AlertCircle, BookOpen, TrendingUp, Layers, Zap, CheckSquare, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { LoadingDots } from '../components/loading-spinner';
import { MarkdownMessage } from '../components/markdown-message';
import { Header } from '../components/header';
import { WizardFlow } from '../components/wizard-flow';
import flashcardsData from '../../lib/flashcards.json';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Language = 'javascript' | 'typescript' | 'python' | 'react' | 'llm' | 'general';

type Level = 'beginner' | 'intermediate' | 'advanced';

type CodingConfig = {
  topic: string;
  language: Language;
  level: Level;
  sessionType: 'lesson' | 'flashcards' | 'tests';
  lessonDuration?: 10 | 20 | 30;
  flashcardCount?: 5 | 10 | 15;
  quizQuestionCount?: 5 | 10 | 15;
};

type Flashcard = {
  id: string;
  front: string;
  back: string;
};

type FlashcardState = {
  cards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
};

type QuizQuestion = {
  id: string;
  question: string;
  choices: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
};

type QuizState = {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  answeredQuestions: Set<number>;
  showFeedback: boolean;
  isComplete: boolean;
};

type LessonState = {
  isLessonMode: boolean;
};

const LANGUAGES: Record<Language, {
  label: string;
  description: string;
  icon: string;
  topics: Record<Level, string[]>;
}> = {
  javascript: {
    label: 'JavaScript',
    description: 'Vanilla JS, Node.js, async patterns',
    icon: 'JS',
    topics: {
      beginner: ['Variables & data types', 'Functions basics', 'Arrays & objects', 'DOM basics', 'Event listeners', 'If/else & loops', 'Random'],
      intermediate: ['Async/await', 'Closures', 'Array methods (map/filter)', 'Fetch API', 'ES6+ features', 'Error handling', 'Random'],
      advanced: ['Event loop internals', 'Prototypes & inheritance', 'Memory management', 'Design patterns', 'Performance optimization', 'Module bundlers', 'Random']
    }
  },
  typescript: {
    label: 'TypeScript',
    description: 'Type-safe development',
    icon: 'TS',
    topics: {
      beginner: ['Basic types', 'Interfaces', 'Type annotations', 'Arrays & tuples', 'Enums', 'Functions with types', 'Random'],
      intermediate: ['Generics', 'Union & intersection types', 'Type guards', 'Utility types', 'Mapped types', 'Conditional types', 'Random'],
      advanced: ['Advanced generics', 'Template literal types', 'Discriminated unions', 'Type inference deep dive', 'Module augmentation', 'Declaration merging', 'Random']
    }
  },
  python: {
    label: 'Python',
    description: 'Data science, scripting, backend',
    icon: 'PY',
    topics: {
      beginner: ['Variables & data types', 'Lists & dictionaries', 'Functions', 'If/else & loops', 'File I/O', 'String manipulation', 'Random'],
      intermediate: ['List comprehensions', 'Classes & OOP', 'Decorators', 'Lambda functions', 'Error handling', 'Modules & packages', 'Random'],
      advanced: ['Generators & iterators', 'Context managers', 'Metaclasses', 'Async/await', 'Type hints & mypy', 'Memory optimization', 'Random']
    }
  },
  react: {
    label: 'React/Next.js',
    description: 'React 19, Next.js 16, modern patterns',
    icon: 'RX',
    topics: {
      beginner: ['JSX basics', 'Components & props', 'State with useState', 'Event handling', 'Lists & keys', 'Conditional rendering', 'Random'],
      intermediate: ['useEffect hook', 'Custom hooks', 'Context API', 'Forms & validation', 'React Router', 'API calls', 'Random'],
      advanced: ['Performance optimization', 'Server components', 'Suspense & streaming', 'State management patterns', 'Testing strategies', 'Architecture patterns', 'Random']
    }
  },
  llm: {
    label: 'AI & LLMs',
    description: 'Prompting, APIs, RAG patterns',
    icon: 'AI',
    topics: {
      beginner: ['What are LLMs', 'Basic prompting', 'Using ChatGPT API', 'Temperature & tokens', 'System prompts', 'Prompt templates', 'Random'],
      intermediate: ['Chain of thought', 'Few-shot learning', 'Function calling', 'Embeddings basics', 'Semantic search', 'RAG overview', 'Random'],
      advanced: ['RAG architectures', 'Vector databases', 'Prompt optimization', 'Fine-tuning strategies', 'LangChain deep dive', 'Agent patterns', 'Random']
    }
  },
  general: {
    label: 'General Concepts',
    description: 'Architecture, algorithms, CS fundamentals',
    icon: '{ }',
    topics: {
      beginner: ['Variables & data types', 'Functions & scope', 'Basic algorithms', 'Code organization', 'Debugging basics', 'Git fundamentals', 'General', 'Random'],
      intermediate: ['Data structures', 'Design patterns', 'REST APIs', 'Database basics', 'Testing fundamentals', 'Clean code principles', 'Random'],
      advanced: ['System design', 'Microservices', 'Scalability patterns', 'Caching strategies', 'Security best practices', 'Performance tuning', 'Random']
    }
  }
};

export default function StuddyBuddyCodingPage() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [config, setConfig] = useState<CodingConfig>({
    topic: '',
    language: 'javascript',
    level: 'beginner',
    sessionType: 'lesson',
    lessonDuration: 20,
    flashcardCount: 10,
    quizQuestionCount: 10,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardState, setFlashcardState] = useState<FlashcardState | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [lessonState, setLessonState] = useState<LessonState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const initializeFlashcards = () => {
    const allCards = (flashcardsData as Record<Language, Flashcard[]>)[config.language] || [];
    const count = config.flashcardCount || 10;
    const cards = allCards.slice(0, Math.min(count, allCards.length));
    setFlashcardState({
      cards,
      currentIndex: 0,
      isFlipped: false
    });
    setMessages([]);
  };

  const flipCard = () => {
    if (flashcardState) {
      setFlashcardState({ ...flashcardState, isFlipped: !flashcardState.isFlipped });
    }
  };

  const nextCard = () => {
    if (flashcardState && flashcardState.currentIndex < flashcardState.cards.length - 1) {
      setFlashcardState({
        ...flashcardState,
        currentIndex: flashcardState.currentIndex + 1,
        isFlipped: false
      });
    }
  };

  const prevCard = () => {
    if (flashcardState && flashcardState.currentIndex > 0) {
      setFlashcardState({
        ...flashcardState,
        currentIndex: flashcardState.currentIndex - 1,
        isFlipped: false
      });
    }
  };

  const initializeQuiz = () => {
    // Note: Quiz questions would come from an external source
    const langQuestions: QuizQuestion[] = [];
    const count = config.quizQuestionCount || 10;
    const shuffled = [...langQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, langQuestions.length));

    const quizQuestions: QuizQuestion[] = selected.map((q) => ({
      ...q,
      userAnswer: undefined
    }));

    setQuizState({
      questions: quizQuestions,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      answeredQuestions: new Set(),
      showFeedback: false,
      isComplete: false
    });
    setMessages([]);
  };

  const selectQuizAnswer = (choiceId: string) => {
    if (!quizState) return;
    setQuizState({ ...quizState, selectedAnswer: choiceId });
  };

  const submitQuizAnswer = () => {
    if (!quizState || !quizState.selectedAnswer) return;

    const currentQ = quizState.questions[quizState.currentQuestionIndex];

    const updatedQuestions = [...quizState.questions];
    updatedQuestions[quizState.currentQuestionIndex] = {
      ...currentQ,
      userAnswer: quizState.selectedAnswer
    };

    const newAnsweredQuestions = new Set(quizState.answeredQuestions);
    newAnsweredQuestions.add(quizState.currentQuestionIndex);

    setQuizState({
      ...quizState,
      questions: updatedQuestions,
      answeredQuestions: newAnsweredQuestions,
      showFeedback: true
    });
  };

  const nextQuizQuestion = () => {
    if (!quizState) return;

    if (quizState.currentQuestionIndex >= quizState.questions.length - 1) {
      setQuizState({ ...quizState, isComplete: true });
    } else {
      setQuizState({
        ...quizState,
        currentQuestionIndex: quizState.currentQuestionIndex + 1,
        selectedAnswer: null,
        showFeedback: false
      });
    }
  };

  const prevQuizQuestion = () => {
    if (!quizState || quizState.currentQuestionIndex === 0) return;

    setQuizState({
      ...quizState,
      currentQuestionIndex: quizState.currentQuestionIndex - 1,
      selectedAnswer: null,
      showFeedback: false
    });
  };

  const buildSystemPrompt = () => {
    const langInfo = LANGUAGES[config.language];
    const sessionInstructions = getSessionTypeInstructions(config.sessionType);

    return `You are an expert coding instructor specializing in ${langInfo.label}.

**Session Context:**
Topic: ${config.topic}
Language: ${langInfo.label} (${langInfo.description})
Level: ${config.level}
Session Type: ${config.sessionType}

**Your Approach:**
${sessionInstructions}

**Important Guidelines:**
- Adapt complexity to ${config.level} level
- Use latest 2025 best practices and features
- Write clean, well-commented code examples
- Explain concepts clearly with practical examples
- Format all code in markdown code blocks with language tags
- Be concise and adaptive - gauge complexity from user responses
- Focus on practical, real-world applications

Let's begin!`;
  };

  const getSessionTypeInstructions = (type: string) => {
    switch (type) {
      case 'lesson':
        return `You are teaching a structured ${config.lessonDuration || 20}-minute coding lesson. Use this EXACT format for your response:

# ${config.topic}

## Tags
\`tag1\` \`tag2\` \`tag3\`

## Overview
[2-3 sentence overview of what we'll learn and why it matters]

## Key Concepts

### Concept 1: [Name]
[Clear explanation with practical context]

\`\`\`${config.language}
// Clear, well-commented code example
\`\`\`

### Concept 2: [Name]
[Clear explanation with practical context]

\`\`\`${config.language}
// Clear, well-commented code example
\`\`\`

### Concept 3: [Name]
[Clear explanation with practical context]

\`\`\`${config.language}
// Clear, well-commented code example
\`\`\`

## Common Patterns
[Real-world use cases and best practices]

## Things to Remember
- Key point 1
- Key point 2
- Key point 3

## Try It Yourself
[A simple challenge or exercise to practice]

Keep explanations clear and concise. Focus on understanding over memorization. Use modern ${LANGUAGES[config.language].label} best practices from 2025.`;
      case 'flashcards':
        return `You are generating flashcards for study. Create exactly ${config.flashcardCount || 10} flashcards about ${config.topic}. Each flashcard should have a clear front (question/concept) and back (answer/explanation). Format them clearly numbered. Keep each card concise and focused on one concept.`;
      case 'tests':
        return `Create a practice test with exactly ${config.quizQuestionCount || 10} questions to assess knowledge. Ask multiple choice or short answer questions, provide immediate feedback and explain correct answers. Focus on testing understanding of core concepts.`;
      default:
        return 'Provide expert coding instruction focused on learning and understanding';
    }
  };

  const startSession = () => {
    if (!config.topic.trim()) {
      setError('Please enter a coding topic');
      return;
    }

    setSessionStarted(true);
    setError(null);

    if (config.sessionType === 'flashcards') {
      initializeFlashcards();
    } else if (config.sessionType === 'tests') {
      initializeQuiz();
    } else if (config.sessionType === 'lesson') {
      setLessonState({ isLessonMode: true });
      sendInitialMessage(buildSystemPrompt());
    } else {
      sendInitialMessage(buildSystemPrompt());
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
            { role: 'user', content: 'Hi! I\'m ready to start this coding session.' },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      setMessages([{ role: 'assistant', content: '' }]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        content += chunk;

        setMessages([{ role: 'assistant', content }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
      setMessages([]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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
            ...updatedMessages,
          ],
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      setMessages([...updatedMessages, { role: 'assistant', content: '' }]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        content += chunk;

        setMessages([...updatedMessages, { role: 'assistant', content }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages(updatedMessages);
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
      language: 'javascript',
      level: 'beginner',
      sessionType: 'lesson',
      lessonDuration: 20,
      flashcardCount: 10,
      quizQuestionCount: 10,
    });
    setError(null);
    setFlashcardState(null);
    setQuizState(null);
    setLessonState(null);
  };

  if (!sessionStarted) {
    const wizardSteps = [
      {
        title: 'What do you want to learn?',
        description: 'Choose your language or tech area first',
        canProgress: config.topic.trim().length > 0,
        content: (
          <div className="space-y-6">
            {/* Language Selection First */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 block">
                Language or tech area
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-black dark:bg-white">
                {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setConfig({ ...config, language: lang })}
                    className={`p-4 text-left font-mono ${
                      config.language === lang
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">
                      [{LANGUAGES[lang].icon}]
                    </div>
                    <div className="font-bold text-sm">{LANGUAGES[lang].label}</div>
                    <div className={`text-xs mt-0.5 ${
                      config.language === lang ? 'opacity-70' : 'text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {LANGUAGES[lang].description.split(',')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2 block">
                Your experience level
              </label>
              <div className="grid grid-cols-3 gap-px bg-black dark:bg-white">
                {(['beginner', 'intermediate', 'advanced'] as Level[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setConfig({ ...config, level: lvl })}
                    className={`p-3 text-center font-mono ${
                      config.level === lvl
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="font-bold text-sm">{lvl}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Popular Topics Based on Language AND Level */}
            <div>
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-2">
                popular topics:
              </p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES[config.language].topics[config.level].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      if (topic === 'Random' || topic === 'General') {
                        setConfig({ ...config, topic: '' });
                      } else {
                        setConfig({ ...config, topic });
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-mono border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    {topic.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Input */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2 block">
                Or enter your own topic
              </label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                placeholder={`e.g. ${LANGUAGES[config.language].topics[config.level][0]}`}
                className="w-full border-2 border-black dark:border-white bg-white dark:bg-black px-4 py-3 text-base font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ring-offset-2"
              />
            </div>
          </div>
        )
      },
      {
        title: 'How can I help you learn?',
        description: 'Choose your learning approach and customize it',
        canProgress: true,
        content: (
          <div className="space-y-6">
            {/* Session Type Selection */}
            <div className="space-y-px">
              {[
                { value: 'lesson', label: 'lesson', desc: 'Structured learning with examples' },
                { value: 'flashcards', label: 'flashcards', desc: 'Spaced repetition study cards' },
                { value: 'tests', label: 'tests', desc: 'Practice quizzes with feedback' }
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setConfig({ ...config, sessionType: value as CodingConfig['sessionType'] })}
                  className={`w-full p-4 text-left font-mono border-2 ${
                    config.sessionType === value
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-black border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="font-bold">[{label}]</div>
                    <div className={`text-sm ${
                      config.sessionType === value ? 'opacity-70' : 'text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Dynamic Options based on Session Type */}
            {config.sessionType === 'lesson' && (
              <div className="border-2 border-black dark:border-white p-4">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 block">
                  Lesson Duration
                </label>
                <div className="grid grid-cols-3 gap-px bg-black dark:bg-white">
                  {[10, 20, 30].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setConfig({ ...config, lessonDuration: duration as 10 | 20 | 30 })}
                      className={`py-3 px-4 font-mono font-bold ${
                        config.lessonDuration === duration
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.sessionType === 'flashcards' && (
              <div className="border-2 border-black dark:border-white p-4">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 block">
                  Number of Flashcards
                </label>
                <div className="grid grid-cols-3 gap-px bg-black dark:bg-white">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setConfig({ ...config, flashcardCount: count as 5 | 10 | 15 })}
                      className={`py-3 px-4 font-mono font-bold ${
                        config.flashcardCount === count
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.sessionType === 'tests' && (
              <div className="border-2 border-black dark:border-white p-4">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 block">
                  Number of Quiz Questions
                </label>
                <div className="grid grid-cols-3 gap-px bg-black dark:bg-white">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setConfig({ ...config, quizQuestionCount: count as 5 | 10 | 15 })}
                      className={`py-3 px-4 font-mono font-bold ${
                        config.quizQuestionCount === count
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {count}q
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }
    ];

    return (
      <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
        <Header />

        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Code Session Setup
              </h2>
              <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                Configure your personalized learning session
              </p>
            </div>

            {error && (
              <div className="border-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 p-4 mb-6">
                <div className="font-mono">
                  <div className="font-bold text-sm mb-1">[error]</div>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <WizardFlow
              steps={wizardSteps}
              onComplete={startSession}
              completionButtonText="Start Learning"
              reviewStep={{
                title: 'Review',
                description: 'Review your session settings and see how the AI will be instructed',
                getPrompt: buildSystemPrompt,
                getSummary: () => [
                  { label: 'Goal', value: config.topic, icon: Code2 },
                  { label: 'Language', value: LANGUAGES[config.language].label, icon: Layers },
                  { label: 'Level', value: config.level.charAt(0).toUpperCase() + config.level.slice(1), icon: TrendingUp },
                  { label: 'Session Type', value: config.sessionType.charAt(0).toUpperCase() + config.sessionType.slice(1), icon: BookOpen }
                ]
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <Header />

      {/* Session Info Bar */}
      <div className="border-b-2 border-black dark:border-white bg-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold font-mono">
              [active-session]
            </h2>
            <button
              onClick={resetSession}
              className="text-sm px-4 py-2 border-2 border-black dark:border-white font-mono hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              end
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2 py-1 border border-black dark:border-white">
              {config.topic}
            </span>
            <span className="px-2 py-1 border border-black dark:border-white">
              {LANGUAGES[config.language].label}
            </span>
            <span className="px-2 py-1 border border-black dark:border-white">
              {config.sessionType}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {quizState && !quizState.isComplete ? (
            <div className="space-y-6">
              {/* Quiz Progress Bar */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Practice Test
                  </h3>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-green-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {quizState.questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        quizState.answeredQuestions.has(idx)
                          ? 'bg-green-500'
                          : idx === quizState.currentQuestionIndex
                          ? 'bg-blue-500'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Scantron-style Quiz Question */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
                {/* Question Number Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-emerald-600 text-white font-bold text-xl shadow-lg">
                    {quizState.currentQuestionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
                      {quizState.questions[quizState.currentQuestionIndex].question}
                    </h3>
                  </div>
                </div>

                {/* Scantron Answer Bubbles */}
                <div className="space-y-3">
                  {quizState.questions[quizState.currentQuestionIndex].choices.map((choice) => {
                    const isSelected = quizState.selectedAnswer === choice.id;
                    const isCorrect = choice.id === quizState.questions[quizState.currentQuestionIndex].correctAnswer;
                    const showResult = quizState.showFeedback;

                    return (
                      <button
                        key={choice.id}
                        onClick={() => !quizState.showFeedback && selectQuizAnswer(choice.id)}
                        disabled={quizState.showFeedback}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-50 dark:bg-green-950/20 border-2 border-green-500'
                              : isSelected
                              ? 'bg-red-50 dark:bg-red-950/20 border-2 border-red-500'
                              : 'border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                            : isSelected
                            ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950/20 shadow-md scale-[1.02]'
                            : 'border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20'
                        } ${!quizState.showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {/* Scantron Bubble */}
                        <div className="shrink-0 relative">
                          <div className={`w-12 h-12 rounded-full border-3 flex items-center justify-center font-bold text-lg transition-all ${
                            showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-500 text-white'
                                : isSelected
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-zinc-300 dark:border-zinc-600 text-zinc-400'
                              : isSelected
                              ? 'border-green-500 bg-green-500 text-white shadow-lg'
                              : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 group-hover:border-green-500'
                          }`}>
                            {choice.id.toUpperCase()}
                          </div>
                          {showResult && isCorrect && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckSquare className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Choice Text */}
                        <div className="flex-1 text-left">
                          <p className={`text-base sm:text-lg ${
                            showResult
                              ? isCorrect
                                ? 'text-green-900 dark:text-green-100 font-semibold'
                                : isSelected
                                ? 'text-red-900 dark:text-red-100'
                                : 'text-zinc-600 dark:text-zinc-400'
                              : isSelected
                              ? 'text-green-900 dark:text-green-100 font-semibold'
                              : 'text-zinc-900 dark:text-zinc-50'
                          }`}>
                            {choice.text}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Section */}
                {quizState.showFeedback && (
                  <div className={`mt-6 p-4 rounded-xl ${
                    quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900'
                      : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                        ? 'Correct!'
                        : 'Incorrect'}
                    </h4>
                    <p className={`text-sm ${
                      quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {quizState.questions[quizState.currentQuestionIndex].explanation}
                    </p>
                  </div>
                )}

                {/* Submit/Next Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={prevQuizQuestion}
                    disabled={quizState.currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </button>

                  {!quizState.showFeedback ? (
                    <button
                      onClick={submitQuizAnswer}
                      disabled={!quizState.selectedAnswer}
                      className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={nextQuizQuestion}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                    >
                      {quizState.currentQuestionIndex >= quizState.questions.length - 1 ? 'View Results' : 'Next Question'}
                      {quizState.currentQuestionIndex < quizState.questions.length - 1 && <ChevronRight className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : quizState && quizState.isComplete ? (
            <div className="space-y-6">
              {/* Quiz Complete - Results */}
              <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                    <CheckSquare className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Quiz Complete!</h3>
                  <p className="text-green-100 text-lg">
                    You answered {quizState.questions.filter(q => q.userAnswer === q.correctAnswer).length} out of {quizState.questions.length} questions correctly
                  </p>
                  <div className="mt-4">
                    <div className="text-5xl font-bold">
                      {Math.round((quizState.questions.filter(q => q.userAnswer === q.correctAnswer).length / quizState.questions.length) * 100)}%
                    </div>
                    <p className="text-green-100 text-sm">Overall Score</p>
                  </div>
                </div>
              </div>

              {/* Review Answers */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Review Your Answers</h4>
                <div className="space-y-4">
                  {quizState.questions.map((q, idx) => {
                    const isCorrect = q.userAnswer === q.correctAnswer;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          isCorrect
                            ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900'
                            : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            isCorrect ? 'bg-green-500' : 'bg-red-500'
                          } text-white font-bold text-sm`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{q.question}</p>
                            <p className={`text-sm ${
                              isCorrect
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                            }`}>
                              Your answer: {q.choices.find(c => c.id === q.userAnswer)?.text || 'No answer'}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Correct answer: {q.choices.find(c => c.id === q.correctAnswer)?.text}
                              </p>
                            )}
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetSession}
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                >
                  New Session
                </button>
              </div>
            </div>
          ) : flashcardState ? (
            <div className="space-y-6">
              {/* Flashcard Progress */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Flashcard Study Session
                  </h3>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Card {flashcardState.currentIndex + 1} of {flashcardState.cards.length}
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-purple-500 to-pink-600 transition-all duration-500"
                    style={{ width: `${((flashcardState.currentIndex + 1) / flashcardState.cards.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flip Card */}
              <div className="perspective-1000">
                <div
                  className={`relative w-full transition-transform duration-700 transform-style-3d cursor-pointer ${
                    flashcardState.isFlipped ? 'rotate-y-180' : ''
                  }`}
                  onClick={flipCard}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front of Card */}
                  <div className={`backface-hidden ${flashcardState.isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl p-8 sm:p-12 shadow-2xl min-h-[400px] flex flex-col items-center justify-center text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                          <Zap className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm font-medium text-purple-100 uppercase tracking-wider">Question</p>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-8">
                        {flashcardState.cards[flashcardState.currentIndex]?.front}
                      </h2>
                      <p className="text-purple-100 text-sm flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Click to reveal answer
                      </p>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 ${flashcardState.isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 sm:p-12 shadow-2xl min-h-[400px] flex flex-col items-center justify-center text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                          <CheckSquare className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Answer</p>
                      </div>
                      <p className="text-xl sm:text-2xl text-white leading-relaxed">
                        {flashcardState.cards[flashcardState.currentIndex]?.back}
                      </p>
                      <p className="text-blue-100 text-sm flex items-center gap-2 mt-8">
                        <RotateCcw className="h-4 w-4" />
                        Click to flip back
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevCard}
                  disabled={flashcardState.currentIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>

                <button
                  onClick={nextCard}
                  disabled={flashcardState.currentIndex >= flashcardState.cards.length - 1}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {flashcardState.currentIndex >= flashcardState.cards.length - 1 ? 'Complete' : 'Next'}
                  {flashcardState.currentIndex < flashcardState.cards.length - 1 && <ChevronRight className="h-5 w-5" />}
                </button>

                {flashcardState.currentIndex >= flashcardState.cards.length - 1 && (
                  <button
                    onClick={resetSession}
                    className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all shadow-lg"
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          ) : lessonState?.isLessonMode && messages.length > 0 ? (
            <div className="space-y-6">
              {/* Lesson Content */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
                <MarkdownMessage content={messages[messages.length - 1].content} isUser={false} />
              </div>

              {/* Lesson Actions */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Continue Learning</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => {
                      setInput('Can you explain this in more detail?');
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100 font-semibold hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all text-left"
                  >
                    <div className="text-sm">Learn More</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">Dive deeper into this topic</div>
                  </button>
                  <button
                    onClick={() => {
                      setInput('What should I learn next?');
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-900 dark:text-green-100 font-semibold hover:bg-green-100 dark:hover:bg-green-950/40 transition-all text-left"
                  >
                    <div className="text-sm">Next Lesson</div>
                    <div className="text-xs text-green-700 dark:text-green-300 mt-0.5">Move to the next topic</div>
                  </button>
                </div>

                {/* Q&A Input */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
                    Ask a specific question
                  </label>
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="e.g., How does this work in production?"
                      className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="flex items-center justify-center rounded-xl bg-blue-500 px-5 py-3 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Previous messages if any */}
              {messages.slice(0, -1).map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 sm:gap-4 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600">
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
                  <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <LoadingDots />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 sm:gap-4 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600">
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
              <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600">
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
            </>
          )}
        </div>
      </div>

      {/* Input - Hidden during quiz, flashcard and lesson modes */}
      {!quizState && !flashcardState && !lessonState?.isLessonMode && (
        <div className="sticky bottom-0 border-t-2 border-black dark:border-white bg-white dark:bg-black px-3 py-3 sm:px-4 sm:py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ask a question..."
              className="flex-1 border-2 border-black dark:border-white bg-white dark:bg-black px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ring-offset-2"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 sm:px-5 sm:py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white dark:disabled:hover:bg-white dark:disabled:hover:text-black"
            >
              →
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
}
