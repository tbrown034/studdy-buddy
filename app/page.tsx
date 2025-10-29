'use client';

import Link from 'next/link';
import { Header } from './components/header';
import techDocs from '../lib/tech-docs.json';

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <Header />

      <div className="flex-1 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <div className="mb-24">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-wider mb-3 text-zinc-600 dark:text-zinc-400">
                Learning Tool
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-none">
                studdy-buddy
              </h1>
              <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
                AI-powered coding education.
                <br />
                Lessons, flashcards, tests.
              </p>
            </div>

            <Link
              href="/code"
              className="inline-block px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white"
            >
              Start Session →
            </Link>
          </div>

          {/* Tech Stack Grid */}
          <div className="mb-24">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Supported Technologies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-black dark:bg-white border-2 border-black dark:border-white">
              {[
                { name: 'javascript', version: 'es2025+', key: 'javascript' },
                { name: 'typescript', version: '5.9', key: 'typescript' },
                { name: 'python', version: '3.12+', key: 'python' },
                { name: 'react', version: '19.2', key: 'react' },
                { name: 'next.js', version: '16', key: 'nextjs' },
                { name: 'node.js', version: '22+', key: 'nodejs' },
                { name: 'tailwind css', version: '4.0', key: 'tailwind' },
                { name: 'postgres/sql', version: 'latest', key: 'supabase' },
                { name: 'ai/llms', version: 'gpt-4+', key: 'ai' }
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="bg-white dark:bg-black p-6 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex flex-col"
                >
                  <div className="font-mono text-sm mb-3 flex-1">
                    <div className="font-bold mb-1">[{tech.name}]</div>
                    <div className="text-zinc-600 dark:text-zinc-400">{tech.version}</div>
                  </div>
                  <div className="flex gap-2 text-xs font-mono">
                    {techDocs[tech.key] && (
                      <>
                        <a
                          href={techDocs[tech.key].resources[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 dark:text-zinc-400 hover:underline"
                        >
                          official
                        </a>
                        <span className="text-zinc-400">|</span>
                        <Link
                          href="/docs"
                          className="text-zinc-600 dark:text-zinc-400 hover:underline"
                        >
                          guides
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Types */}
          <div className="mb-24">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Session Types
            </h2>
            <div className="space-y-4">
              {[
                {
                  type: 'lesson',
                  desc: 'Structured learning with examples and explanations'
                },
                {
                  type: 'flashcards',
                  desc: 'Spaced repetition study cards for concept retention'
                },
                {
                  type: 'tests',
                  desc: 'Practice quizzes with immediate feedback'
                }
              ].map((item) => (
                <div
                  key={item.type}
                  className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-mono font-bold text-lg">{item.type}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-24">
            <h2 className="text-sm uppercase tracking-wider mb-6 text-zinc-600 dark:text-zinc-400">
              Process
            </h2>
            <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-8">
              <ol className="space-y-4 font-mono">
                <li className="flex gap-4">
                  <span className="font-bold">01.</span>
                  <span>Select language and skill level</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold">02.</span>
                  <span>Choose session type</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold">03.</span>
                  <span>Learn with AI guidance</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Official Documentation
              </h2>
              <Link
                href="/docs"
                className="text-sm font-mono hover:underline"
              >
                view all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-black dark:bg-white border-2 border-black dark:border-white">
              {Object.entries(techDocs).slice(0, 8).map(([key, tech]) => (
                <a
                  key={key}
                  href={tech.resources[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 group"
                >
                  <div className="font-mono">
                    <div className="text-xs font-bold mb-1">[{tech.icon}]</div>
                    <div className="text-sm font-bold mb-1 group-hover:underline">{tech.name}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{tech.version}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black dark:border-white px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="font-mono text-sm">
              <div className="font-bold">studdy-buddy</div>
              <div className="text-zinc-600 dark:text-zinc-400">© 2025</div>
            </div>
            <div className="flex gap-4 font-mono text-sm">
              <Link href="/code" className="hover:underline">
                code
              </Link>
              <Link href="/docs" className="hover:underline">
                docs
              </Link>
              <Link href="/stats" className="hover:underline">
                stats
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
