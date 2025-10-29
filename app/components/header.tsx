'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-mono font-bold hover:underline">
          <Image
            src="/icon.svg"
            alt="studdy-buddy icon"
            width={24}
            height={24}
            className="shrink-0"
          />
          studdy-buddy
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 font-mono text-sm">
          <Link
            href="/code"
            className={`hover:underline ${
              isActive('/code')
                ? 'font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            code
          </Link>

          <Link
            href="/docs"
            className={`hover:underline ${
              isActive('/docs')
                ? 'font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            docs
          </Link>
        </nav>
      </div>
    </header>
  );
}
