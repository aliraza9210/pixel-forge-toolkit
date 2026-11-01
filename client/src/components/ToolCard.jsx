import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import TiltCard from './TiltCard';

const STATUS_BADGE = {
  available: <span className="badge-available">Live</span>,
  'coming-soon': <span className="badge-coming-soon">Soon</span>,
};

const TYPE_BADGE = {
  ai: <span className="badge-ai">AI</span>,
};

function ToolIcon({ iconName, color }) {
  const Icon = Icons[iconName] || Icons.Wrench;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
  );
}

export default function ToolCard({ tool, compact = false }) {
  return (
    <TiltCard maxTilt={8} scale={1.025}>
      <Link
        to={tool.route}
        id={`tool-card-${tool.id}`}
        className="block card-depth h-full p-5 group relative overflow-hidden transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
        aria-label={`Open ${tool.name} tool`}
        tabIndex={0}
      >
        {/* Top row with 3D popout */}
        <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(24px)' }}>
          <ToolIcon iconName={tool.icon} color={tool.color || '#a3e635'} />
          <div className="flex items-center gap-1.5">
            {tool.processingType === 'ai' && TYPE_BADGE.ai}
            {STATUS_BADGE[tool.implementationStatus] || null}
          </div>
        </div>

        {/* Content with 3D popout */}
        <div style={{ transform: 'translateZ(16px)' }}>
          <h3
            className="font-semibold text-sm mb-1.5 group-hover:text-[var(--accent-lime)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {tool.name}
          </h3>
          {!compact && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {tool.description}
            </p>
          )}
        </div>

        {/* Formats with 3D popout */}
        {!compact && tool.inputFormats.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3" style={{ transform: 'translateZ(12px)' }}>
            {tool.inputFormats.slice(0, 4).map((fmt) => (
              <span
                key={fmt}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md uppercase font-mono"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  letterSpacing: '0.04em',
                }}
              >
                {fmt}
              </span>
            ))}
            {tool.inputFormats.length > 4 && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md font-mono"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                +{tool.inputFormats.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Hover Arrow with 3D popout */}
        <div
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0"
          style={{ transform: 'translateZ(20px)' }}
        >
          <ArrowRight className="w-4 h-4" style={{ color: tool.color || 'var(--accent-lime)' }} />
        </div>
      </Link>
    </TiltCard>
  );
}
