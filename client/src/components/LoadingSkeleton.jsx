import clsx from 'clsx';

export default function LoadingSkeleton({ className = '', count = 1, ...props }) {
  const items = Array.from({ length: count });
  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={clsx('rounded-lg animate-pulse', className)}
          style={{ background: 'var(--bg-elevated)', ...props.style }}
          role="status"
          aria-label="Loading..."
        />
      ))}
    </>
  );
}

export function ToolCardSkeleton() {
  return (
    <div
      className="rounded-xl p-5 animate-pulse"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
        <div className="w-16 h-4 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
      </div>
      <div className="w-28 h-4 rounded mb-2" style={{ background: 'var(--bg-elevated)' }} />
      <div className="w-full h-3 rounded mb-1" style={{ background: 'var(--bg-elevated)' }} />
      <div className="w-4/5 h-3 rounded" style={{ background: 'var(--bg-elevated)' }} />
    </div>
  );
}
