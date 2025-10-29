'use client';

import Link from 'next/link';
import { Header } from './components/header';
import { Footer } from './components/footer';
import techDocs from '../lib/tech-docs.json';

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <Header />

      <div className="flex-1 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <div className="mb-24">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-none">
              studdy-buddy
            </h1>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 mb-12">
              {/* Left: Description */}
              <div>
                <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-6">
                  a personal ai study tool for web development.
                  <br />
                  choose your stack, pick your pace.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/code"
                    className="inline-block px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-white hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Start Session →
                  </Link>
                  <Link
                    href="/docs"
                    className="inline-block px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-bold border-2 border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Browse Docs
                  </Link>
                </div>
              </div>

              {/* Right: Process */}
              <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6">
                <h2 className="text-xs uppercase tracking-wider mb-4 text-zinc-600 dark:text-zinc-400">
                  How it works
                </h2>
                <ol className="space-y-3 font-mono text-sm">
                  <li className="flex gap-3">
                    <span className="font-bold text-zinc-400">01</span>
                    <span>Pick your tech and level</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-zinc-400">02</span>
                    <span>Learn through sessions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-zinc-400">03</span>
                    <span>Reference curated docs</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <span className="font-bold text-zinc-400">--</span>
                    <a
                      href="#stack"
                      className="text-zinc-500 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      or just skip to the docs
                    </a>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-24">
            <div className="border-t border-zinc-200 dark:border-zinc-800" />
          </div>

          {/* Stack & Documentation */}
          <div id="stack">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Stack & Documentation
              </h2>
              <Link
                href="/docs"
                className="text-sm font-mono hover:underline text-zinc-600 dark:text-zinc-400"
              >
                view all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-black dark:bg-white border-2 border-black dark:border-white">
              {Object.entries(techDocs).slice(0, 8).map(([key, tech]) => (
                <div
                  key={key}
                  className="p-5 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 flex flex-col"
                >
                  <div className="font-mono mb-3 flex-1">
                    <div className="text-xs font-bold mb-1 text-zinc-400">[{tech.icon}]</div>
                    <div className="text-sm font-bold mb-1">{tech.name}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{tech.version}</div>
                  </div>
                  <div className="flex gap-2 text-xs font-mono">
                    <a
                      href={tech.resources[0].url}
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
                      curated
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
