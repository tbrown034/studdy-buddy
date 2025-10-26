import { LoadingSpinner } from './components/loading-spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size={40} />
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}
