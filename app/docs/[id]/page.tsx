import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import Link from 'next/link';
import curatedIndex from '../../../docs/curated/index.json';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

export async function generateStaticParams() {
  return curatedIndex.docs.map((doc) => ({
    id: doc.id,
  }));
}

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = curatedIndex.docs.find(d => d.id === id);

  if (!doc) {
    notFound();
  }

  const filePath = path.join(process.cwd(), 'docs', 'curated', doc.file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const html = await marked.parse(content);

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <Header />

      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-8 font-mono text-sm">
            <Link href="/docs" className="hover:underline text-zinc-600 dark:text-zinc-400">
              docs
            </Link>
            <span className="mx-2 text-zinc-400">/</span>
            <span className="font-bold">{doc.id}</span>
          </div>

          {/* Doc Header */}
          <div className="mb-8 pb-6 border-b-2 border-black dark:border-white">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono font-bold text-lg">[{doc.icon}]</span>
              <h1 className="text-4xl font-bold">{doc.name}</h1>
              <span className="text-lg font-mono text-zinc-600 dark:text-zinc-400">
                {doc.version}
              </span>
            </div>
            <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
              Core concepts - minimal brutalist documentation
            </p>
          </div>

          {/* Markdown Content */}
          <div
            className="prose-brutal"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
