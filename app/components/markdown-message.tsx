'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import 'highlight.js/styles/github-dark.css';

export function MarkdownMessage({ content, isUser }: { content: string; isUser: boolean }) {
  return (
    <div className={`prose prose-sm sm:prose-base max-w-none ${
      isUser
        ? 'prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-code:text-blue-100'
        : 'dark:prose-invert prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-p:text-zinc-700 dark:prose-p:text-zinc-300'
    }`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;

            if (isInline) {
              return (
                <code
                  className={`${
                    isUser
                      ? 'bg-blue-600/30 text-blue-100 px-1.5 py-0.5 rounded'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                code={String(children).replace(/\n$/, '')}
                language={match?.[1] || 'text'}
                isUser={isUser}
              />
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          p({ children }) {
            return <p className="leading-relaxed mb-3 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="my-3 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-3 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-xl sm:text-2xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg sm:text-xl font-bold mb-2 mt-3 first:mt-0">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base sm:text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className={`border-l-4 pl-4 my-3 italic ${
                isUser
                  ? 'border-blue-300 text-blue-100'
                  : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400'
              }`}>
                {children}
              </blockquote>
            );
          },
          strong({ children }) {
            return <strong className="font-semibold">{children}</strong>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ code, language, isUser }: { code: string; language: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-2 text-xs font-mono ${
        isUser
          ? 'bg-blue-700/40 text-blue-100'
          : 'bg-zinc-800 dark:bg-zinc-900 text-zinc-400'
      }`}>
        <span>{language}</span>
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            isUser
              ? 'hover:bg-blue-600/40 text-blue-100'
              : 'hover:bg-zinc-700 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className={`overflow-x-auto ${
        isUser
          ? 'bg-blue-800/20'
          : 'bg-zinc-900 dark:bg-black'
      }`}>
        <pre className="p-4 text-sm">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
