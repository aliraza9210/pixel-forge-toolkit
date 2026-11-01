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
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm"
            style={{
              background: isActive ? 'var(--btn-primary-bg)' : 'var(--bg-card)',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${isActive ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
            }}
          >
            {cat}
            {count !== undefined && (
              <span
                className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold font-mono"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.22)' : 'var(--bg-secondary)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
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
