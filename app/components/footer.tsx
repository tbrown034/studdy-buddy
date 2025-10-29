import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-6">
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
  );
}
