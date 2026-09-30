export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-9 w-56 animate-pulse rounded bg-neutral-200" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
          <div className="aspect-[16/9] w-full animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-7 w-2/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
