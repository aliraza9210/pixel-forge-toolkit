import ToolCard from './ToolCard';
import { ToolCardSkeleton } from './LoadingSkeleton';

export default function ToolGrid({ tools, loading = false, compact = false, skeletonCount = 8 }) {
  if (loading) {
    return (
      <div className="grid-tools">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        role="status"
        aria-live="polite"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No tools found</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-tools">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} compact={compact} />
      ))}
    </div>
  );
}
