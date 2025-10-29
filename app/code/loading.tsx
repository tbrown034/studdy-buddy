import { LoadingDots } from '../components/loading-spinner';

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex h-16 w-16 items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black">
            <span className="text-xl font-mono font-bold">{ }</span>
          </div>
        </div>
        <div className="font-mono text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          loading session
        </div>
        <LoadingDots />
      </div>
    </div>
  );
}
