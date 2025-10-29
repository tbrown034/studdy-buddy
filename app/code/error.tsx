'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Code page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white dark:bg-black px-4">
      <div className="max-w-md w-full border-2 border-black dark:border-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 font-mono">[error]</h2>
        <p className="text-sm mb-6 text-zinc-600 dark:text-zinc-400">
          Something went wrong loading the code session.
        </p>
        <p className="text-xs font-mono mb-6 text-zinc-500 dark:text-zinc-500 break-all">
          {error.message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
          >
            ← home
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black transition-colors"
          >
            try again
          </button>
        </div>
      </div>
    </div>
  );
}
