import clsx from 'clsx';

export default function CategoryTabs({ categories, active, onChange, counts = {} }) {
  return (
    <div
      className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide"
      role="tablist"
      aria-label="Filter by category"
    >
      {['All', ...categories].map((cat) => {
        const isActive = active === cat;
        const count = cat === 'All'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[cat];
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{
              background: isActive ? 'var(--accent-lime)' : 'var(--bg-card)',
              color: isActive ? '#0a0a0b' : 'var(--text-secondary)',
              border: `1px solid ${isActive ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
            }}
          >
            {cat}
            {count !== undefined && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: isActive ? 'rgba(0,0,0,0.2)' : 'var(--bg-elevated)',
                  color: isActive ? '#0a0a0b' : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
