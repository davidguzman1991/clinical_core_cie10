type SkeletonProps = {
  lines?: number;
};

export default function Skeleton({ lines = 4 }: SkeletonProps) {
  return (
    <div className="space-y-3" aria-label="Cargando resultados">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
