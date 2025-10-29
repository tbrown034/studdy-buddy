'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import techDocs from '../../lib/tech-docs.json';
import curatedIndex from '../../docs/curated/index.json';

export default function DocsPage() {
  const [view, setView] = useState<'curated' | 'official'>('curated');

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <Header />

      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Documentation
            </h1>
            <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              {view === 'curated'
                ? 'Minimal brutalist docs - core concepts only'
                : 'Official resources for supported technologies'}
            </p>

            {/* View Toggle */}
            <div className="flex gap-px border-2 border-black dark:border-white w-fit">
              <button
                onClick={() => setView('curated')}
                className={`px-6 py-3 font-mono font-bold ${
                  view === 'curated'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                [curated]
              </button>
              <button
                onClick={() => setView('official')}
                className={`px-6 py-3 font-mono font-bold ${
                  view === 'official'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                [official-links]
              </button>
            </div>
          </div>

          {view === 'curated' ? (
            <div className="space-y-8">
              {curatedIndex.docs.map((doc) => (
                <div key={doc.id} className="border-2 border-black dark:border-white">
                  <div className="border-b-2 border-black dark:border-white p-4 bg-zinc-50 dark:bg-zinc-950">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono font-bold text-sm">[{doc.icon}]</span>
                      <h2 className="text-2xl font-bold">{doc.name}</h2>
                      <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                        {doc.version}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                        Topics Covered
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {doc.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-mono border border-black dark:border-white"
                          >
                            {topic.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/docs/${doc.id}`}
                      className="inline-block px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white"
                    >
                      read docs →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(techDocs).map(([key, tech]) => (
                <div key={key}>
                <div className="mb-4 pb-2 border-b-2 border-black dark:border-white">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono font-bold text-sm">[{tech.icon}]</span>
                    <h2 className="text-2xl font-bold">{tech.name}</h2>
                    <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                      {tech.version}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black dark:bg-white border-2 border-black dark:border-white">
                  {tech.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-6 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 group"
                    >
                      <div className="font-mono">
                        <div className="font-bold mb-2 group-hover:underline">
                          {resource.title}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {resource.description}
                        </div>
                        <div className="text-xs mt-3 opacity-60">
                          {new URL(resource.url).hostname} →
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
