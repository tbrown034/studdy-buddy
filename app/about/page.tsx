'use client';

import { Header } from '../components/header';
import { Footer } from '../components/footer';

export default function AboutPage() {
  const techStack = [
    { category: 'Frontend', items: ['React 19.2', 'Next.js 16', 'TypeScript 5.9', 'Tailwind CSS 4.0'] },
    { category: 'Backend', items: ['Next.js API Routes', 'OpenAI API (GPT-4o Mini)', 'Server Components'] },
    { category: 'Deployment', items: ['Vercel', 'Turbopack', 'Edge Runtime'] },
    { category: 'Developer Tools', items: ['pnpm', 'ESLint', 'Geist Fonts', 'Lucide Icons'] }
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <Header />

      <div className="flex-1 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-none">
              about studdy-buddy
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
              a personal project born from frustration with scattered learning resources.
            </p>
          </div>

          {/* Story */}
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Why I Built This
            </h2>
            <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-8">
              <div className="font-mono space-y-4 text-sm sm:text-base">
                <p>
                  learning web development in 2025 is overwhelming. too many tabs open, documentation scattered across dozens of sites, tutorial hell, decision fatigue before you even start coding.
                </p>
                <p>
                  i wanted something simpler. a single place to:
                </p>
                <ul className="list-none space-y-2 pl-4">
                  <li>→ pick your tech stack</li>
                  <li>→ choose your learning style (lessons, flashcards or tests)</li>
                  <li>→ get ai-guided practice</li>
                  <li>→ reference curated docs</li>
                </ul>
                <p>
                  no bloat, no distractions, no bullshit. just structured learning at your own pace.
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  built this for myself. sharing it in case it helps you too.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Built With
            </h2>
            <div className="grid sm:grid-cols-2 gap-px bg-black dark:bg-white border-2 border-black dark:border-white">
              {techStack.map((section) => (
                <div
                  key={section.category}
                  className="bg-white dark:bg-black p-6"
                >
                  <h3 className="font-mono font-bold text-sm mb-3">{section.category}</h3>
                  <ul className="font-mono text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                    {section.items.map((item) => (
                      <li key={item}>→ {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Principles */}
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Design Principles
            </h2>
            <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-8">
              <div className="font-mono space-y-4 text-sm">
                <div className="flex gap-4">
                  <span className="font-bold">KISS</span>
                  <span className="text-zinc-600 dark:text-zinc-400">keep it simple stupid - when in doubt choose the simpler solution</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold">DRY</span>
                  <span className="text-zinc-600 dark:text-zinc-400">don&apos;t repeat yourself - minimal code, maximum impact</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold">Brutalism</span>
                  <span className="text-zinc-600 dark:text-zinc-400">function over form, bold borders, monospace fonts, no fluff</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-bold">Personal</span>
                  <span className="text-zinc-600 dark:text-zinc-400">built for me first, shared second - honest and direct</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              What&apos;s Next (Maybe)
            </h2>
            <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-8">
              <div className="font-mono space-y-4 text-sm">
                <p className="text-zinc-600 dark:text-zinc-400">
                  stretch goals and ideas for future iterations:
                </p>
                <ul className="list-none space-y-3 pl-4">
                  <li className="flex gap-3">
                    <span className="text-zinc-400">□</span>
                    <span>light mode toggle - for those who hate their eyes less</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-400">□</span>
                    <span>progress tracking - save your learning journey</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-400">□</span>
                    <span>custom difficulty curves - adapt to your skill level</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-400">□</span>
                    <span>spaced repetition - actually remember what you learn</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-400">□</span>
                    <span>code playground - test concepts in real-time</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-400">□</span>
                    <span>more tech stacks - expand beyond web dev basics</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-400">□</span>
                    <span>community flashcard decks - share and learn together</span>
                  </li>
                </ul>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-2">
                  no promises, no roadmap, no timelines.
                </p>
              </div>
            </div>
          </div>

          {/* Contribute */}
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Get Involved
            </h2>
            <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-8">
              <div className="font-mono space-y-6">
                <p className="text-sm">
                  this is an open source personal project. if you find it useful, consider contributing.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://github.com/tbrown034/studdy-buddy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    → GitHub Repository
                  </a>
                  <a
                    href="https://trevorthewebdeveloper.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    → About Trevor
                  </a>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  built by{' '}
                  <a
                    href="https://trevorthewebdeveloper.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    trevor brown
                  </a>
                  , learning and building in public.
                </p>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div>
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Version 1.0
            </h2>
            <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-8">
              <div className="font-mono space-y-4 text-sm">
                <p className="text-zinc-600 dark:text-zinc-400">
                  three-day sprint. claude code assisted.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    released: october 2025
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    •
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    mvp status: shipped
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
