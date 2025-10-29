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
  // Generate random defaults on component mount
  const getRandomDefaults = (): CodingConfig => {
    const languages = Object.keys(LANGUAGES) as Language[];
    const levels: Level[] = ['beginner', 'intermediate', 'advanced'];
    const sessionTypes: CodingConfig['sessionType'][] = ['lesson', 'flashcards', 'tests'];

    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomSessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];

    // Get random topic for the selected language and level
    const topicsForLevel = LANGUAGES[randomLanguage].topics[randomLevel];
    const availableTopics = topicsForLevel.filter(t => t !== 'Random' && t !== 'General');
    const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];

    return {
      topic: randomTopic,
      language: randomLanguage,
      level: randomLevel,
      sessionType: randomSessionType,
      lessonDuration: 20,
      flashcardCount: 10,
      quizQuestionCount: 10,
    };
  };

  const [sessionStarted, setSessionStarted] = useState(false);
  const [config, setConfig] = useState<CodingConfig>(getRandomDefaults());
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

  const initializeQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const count = config.quizQuestionCount || 10;
      const langInfo = LANGUAGES[config.language];
      const systemPrompt = `You are a quiz generator. Generate exactly ${count} multiple choice questions about ${config.topic} for ${langInfo.label} at the ${config.level} level.

IMPORTANT: Return ONLY valid JSON with no additional text or markdown. The JSON must be an array of objects with this exact structure:
[
  {
    "id": "1",
    "question": "What is...",
    "choices": [
      {"id": "a", "text": "Option A"},
      {"id": "b", "text": "Option B"},
      {"id": "c", "text": "Option C"},
      {"id": "d", "text": "Option D"}
    ],
    "correctAnswer": "a",
    "explanation": "Brief explanation of why this is correct"
  }
]

Make questions appropriate for ${config.level} level. Focus on practical knowledge.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate the quiz questions now.' },
          ],
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
      }

      // Parse the JSON response
      const quizQuestions: QuizQuestion[] = JSON.parse(content.trim());

      setQuizState({
        questions: quizQuestions,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        answeredQuestions: new Set(),
        showFeedback: false,
        isComplete: false
      });
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
      setQuizState(null);
    } finally {
      setLoading(false);
    }
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
    setConfig(getRandomDefaults());
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
                      if (topic === 'Random') {
                        // Pick a random topic from the list (excluding Random itself)
                        const availableTopics = LANGUAGES[config.language].topics[config.level].filter(t => t !== 'Random' && t !== 'General');
                        const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
                        setConfig({ ...config, topic: randomTopic });
                      } else {
                        setConfig({ ...config, topic });
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-mono border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ${
                      config.topic === topic ? 'bg-black dark:bg-white text-white dark:text-black' : ''
                    }`}
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
            <div className="space-y-3">
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
                  Lesson Duration (minutes)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 20, 30].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setConfig({ ...config, lessonDuration: duration as 10 | 20 | 30 })}
                      className={`py-3 px-4 font-mono font-bold border-2 border-black dark:border-white ${
                        config.lessonDuration === duration
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {duration} min
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
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setConfig({ ...config, flashcardCount: count as 5 | 10 | 15 })}
                      className={`py-3 px-4 font-mono font-bold border-2 border-black dark:border-white ${
                        config.flashcardCount === count
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {count} cards
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.sessionType === 'tests' && (
              <div className="border-2 border-black dark:border-white p-4">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 block">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setConfig({ ...config, quizQuestionCount: count as 5 | 10 | 15 })}
                      className={`py-3 px-4 font-mono font-bold border-2 border-black dark:border-white ${
                        config.quizQuestionCount === count
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {count} questions
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
              {/* Navigation Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={resetSession}
                  className="px-4 py-2 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Home
                </button>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  question {quizState.currentQuestionIndex + 1} / {quizState.questions.length}
                </span>
              </div>

              {/* Quiz Question */}
              <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 sm:p-8">
                {/* Question */}
                <div className="mb-6">
                  <p className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                    [question {quizState.currentQuestionIndex + 1}]
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold font-mono leading-tight">
                    {quizState.questions[quizState.currentQuestionIndex].question}
                  </h3>
                </div>

                {/* Answer Choices */}
                <div className="space-y-2">
                  {quizState.questions[quizState.currentQuestionIndex].choices.map((choice) => {
                    const isSelected = quizState.selectedAnswer === choice.id;
                    const isCorrect = choice.id === quizState.questions[quizState.currentQuestionIndex].correctAnswer;
                    const showResult = quizState.showFeedback;

                    return (
                      <button
                        key={choice.id}
                        onClick={() => !quizState.showFeedback && selectQuizAnswer(choice.id)}
                        disabled={quizState.showFeedback}
                        className={`w-full flex items-center gap-4 p-4 border-2 font-mono text-left transition-all ${
                          showResult
                            ? isCorrect
                              ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                              : isSelected
                              ? 'border-zinc-400 dark:border-zinc-600 bg-white dark:bg-black text-zinc-400 dark:text-zinc-600 line-through'
                              : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black opacity-40'
                            : isSelected
                            ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                            : 'border-black dark:border-white bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        } ${!quizState.showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <span className={`font-bold ${showResult && isCorrect ? 'text-lg' : ''}`}>
                          {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : `[${choice.id.toUpperCase()}]`}
                        </span>
                        <span className="flex-1">
                          {choice.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Section */}
                {quizState.showFeedback && (
                  <div className={`mt-6 p-4 border-2 ${
                    quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                      : 'border-black dark:border-white bg-white dark:bg-black'
                  }`}>
                    <p className="text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="text-lg">
                        {quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                          ? '✓'
                          : '✗'}
                      </span>
                      <span className={quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                        ? 'opacity-70'
                        : 'text-zinc-600 dark:text-zinc-400'}>
                        {quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                          ? 'correct'
                          : 'incorrect'}
                      </span>
                    </p>
                    <p className={`font-mono text-sm ${
                      quizState.selectedAnswer === quizState.questions[quizState.currentQuestionIndex].correctAnswer
                        ? 'opacity-90'
                        : ''
                    }`}>
                      {quizState.questions[quizState.currentQuestionIndex].explanation}
                    </p>
                  </div>
                )}

                {/* Submit/Next Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={prevQuizQuestion}
                    disabled={quizState.currentQuestionIndex === 0}
                    className="px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← previous
                  </button>

                  {!quizState.showFeedback ? (
                    <button
                      onClick={submitQuizAnswer}
                      disabled={!quizState.selectedAnswer}
                      className="flex-1 px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      submit answer
                    </button>
                  ) : (
                    <button
                      onClick={nextQuizQuestion}
                      className="flex-1 px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black transition-colors"
                    >
                      {quizState.currentQuestionIndex >= quizState.questions.length - 1 ? 'view results' : 'next →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : quizState && quizState.isComplete ? (
            <div className="space-y-6">
              {/* Navigation Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={resetSession}
                  className="px-4 py-2 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Home
                </button>
              </div>

              {/* Quiz Complete - Results */}
              <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-8 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-4">
                  [quiz complete]
                </p>
                <div className="text-6xl font-bold font-mono mb-4">
                  {Math.round((quizState.questions.filter(q => q.userAnswer === q.correctAnswer).length / quizState.questions.length) * 100)}%
                </div>
                <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                  {quizState.questions.filter(q => q.userAnswer === q.correctAnswer).length} / {quizState.questions.length} correct
                </p>
              </div>

              {/* Review Answers */}
              <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-4">[review]</h4>
                <div className="space-y-3">
                  {quizState.questions.map((q, idx) => {
                    const isCorrect = q.userAnswer === q.correctAnswer;
                    return (
                      <div
                        key={idx}
                        className="p-4 border-2 border-black dark:border-white"
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono font-bold">
                            {isCorrect ? '✓' : '✗'} {idx + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="font-mono font-bold mb-2">{q.question}</p>
                            <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                              your answer: {q.choices.find(c => c.id === q.userAnswer)?.text || 'no answer'}
                            </p>
                            {!isCorrect && (
                              <p className="font-mono text-sm mt-1">
                                correct: {q.choices.find(c => c.id === q.correctAnswer)?.text}
                              </p>
                            )}
                            <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-2">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : flashcardState ? (
            <div className="space-y-6">
              {/* Navigation Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={resetSession}
                  className="px-4 py-2 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Home
                </button>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  card {flashcardState.currentIndex + 1} / {flashcardState.cards.length}
                </span>
              </div>

              {/* Flashcard */}
              <div
                onClick={flipCard}
                className="border-2 border-black dark:border-white bg-white dark:bg-black p-8 sm:p-12 min-h-[400px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
              >
                {!flashcardState.isFlipped ? (
                  <>
                    <div className="mb-6">
                      <p className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                        [question]
                      </p>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-mono leading-tight mb-8">
                      {flashcardState.cards[flashcardState.currentIndex]?.front}
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-mono">
                      click to reveal answer
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                        [answer]
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl font-mono leading-relaxed">
                      {flashcardState.cards[flashcardState.currentIndex]?.back}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-mono mt-8">
                      click to flip back
                    </p>
                  </>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={prevCard}
                  disabled={flashcardState.currentIndex === 0}
                  className="px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← previous
                </button>

                <button
                  onClick={nextCard}
                  disabled={flashcardState.currentIndex >= flashcardState.cards.length - 1}
                  className="flex-1 px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {flashcardState.currentIndex >= flashcardState.cards.length - 1 ? 'finish' : 'next →'}
                </button>
              </div>
            </div>
          ) : lessonState?.isLessonMode && messages.length > 0 ? (
            <div className="space-y-6">
              {/* Navigation Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={resetSession}
                  className="px-4 py-2 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Home
                </button>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  Lesson in progress
                </span>
              </div>

              {/* Lesson Content - Show all messages */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-6 sm:p-8">
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    {msg.role === 'user' && idx > 0 && (
                      <div className="mb-3 pb-3 border-b-2 border-black dark:border-white">
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Your question:
                        </span>
                        <p className="font-mono text-sm mt-1">{msg.content}</p>
                      </div>
                    )}
                    {msg.role === 'assistant' && (
                      <MarkdownMessage content={msg.content} isUser={false} />
                    )}
                  </div>
                ))}
              </div>

              {/* Lesson Actions - Clearer UI */}
              {!loading && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Continue learning</h4>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={async () => {
                        if (loading) return; // Prevent double-clicks
                        const userMessage: Message = { role: 'user', content: 'Can you give me a practical example showing how to use this in a real project?' };
                        const updatedMessages = [...messages, userMessage];
                        setMessages(updatedMessages);
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
                          if (!response.body) throw new Error('No response body');

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
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-3 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      show example
                    </button>
                    <button
                      onClick={async () => {
                        if (loading) return; // Prevent double-clicks
                        const userMessage: Message = { role: 'user', content: 'What should I learn next?' };
                        const updatedMessages = [...messages, userMessage];
                        setMessages(updatedMessages);
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
                          if (!response.body) throw new Error('No response body');

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
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      next lesson →
                    </button>
                  </div>

                  {/* Custom Question Input */}
                  <div className="border-t-2 border-black dark:border-white pt-6">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2 block">
                      or ask your own question
                    </label>
                    <form onSubmit={async (e) => {
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
                        if (!response.body) throw new Error('No response body');

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
                    }} className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., explain like I'm 5"
                        className="flex-1 border-2 border-black dark:border-white bg-white dark:bg-black px-4 py-3 text-sm font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ring-offset-2"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        →
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex gap-2 sm:gap-4 justify-start">
                  <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%] px-3 py-2.5 sm:px-4 sm:py-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white font-mono">
                    <LoadingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 p-4">
                  <div className="font-mono">
                    <div className="font-bold text-sm mb-1 text-red-900 dark:text-red-200">[error]</div>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
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
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black">
                  <span className="text-xs font-mono font-bold">AI</span>
                </div>
              )}

              <div
                className={`group relative max-w-[90%] sm:max-w-[85%] md:max-w-[75%] px-4 py-3 sm:px-5 sm:py-4 border-2 ${
                  msg.role === 'user'
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 border-black dark:border-white'
                }`}
              >
                <MarkdownMessage content={msg.content} isUser={msg.role === 'user'} />
              </div>

              {msg.role === 'user' && (
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black dark:border-white bg-black dark:bg-white">
                  <span className="text-xs font-mono font-bold text-white dark:text-black">U</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 sm:gap-4 justify-start">
              <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black">
                <span className="text-xs font-mono font-bold">AI</span>
              </div>
              <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%] px-3 py-2.5 sm:px-4 sm:py-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white font-mono">
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
