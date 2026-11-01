import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowRight, Sparkles } from 'lucide-react';
import TiltCard from './TiltCard';
import useThemeStore from '../store/themeStore';

const STATUS_BADGE = {
  available: <span className="badge-available">Live</span>,
  'coming-soon': <span className="badge-coming-soon">Soon</span>,
};

const TYPE_BADGE = {
  ai: <span className="badge-ai">AI</span>,
};

function ToolIcon({ iconName, isLight }) {
  const Icon = Icons[iconName] || Icons.Wrench;
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm"
      style={{
        background: isLight
          ? 'linear-gradient(135deg, rgba(50, 20, 61, 0.08), rgba(244, 185, 66, 0.14))'
          : 'linear-gradient(135deg, rgba(0, 166, 214, 0.16), rgba(255, 45, 117, 0.12))',
        border: isLight
          ? '1px solid rgba(50, 20, 61, 0.18)'
          : '1px solid rgba(0, 166, 214, 0.35)',
        color: isLight ? '#32143D' : '#00A6D6',
      }}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
}

export default function ToolCard({ tool, compact = false }) {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <TiltCard maxTilt={8} scale={1.025}>
      <Link
        to={tool.route}
        id={`tool-card-${tool.id}`}
        className="block card-depth h-full p-5 sm:p-6 group relative overflow-hidden transition-all duration-300 flex flex-col justify-between"
        style={{
          transformStyle: 'preserve-3d',
          background: isLight
            ? 'linear-gradient(145deg, #FFFFFF 0%, #FAFBFD 100%)'
            : 'linear-gradient(145deg, #191D25 0%, #13161C 100%)',
          borderColor: isLight ? '#D8DDE3' : '#292D36',
        }}
        aria-label={`Open ${tool.name} tool`}
        tabIndex={0}
      >
        {/* Subtle Ambient Radial Highlight on Hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: isLight
              ? 'radial-gradient(circle at top right, rgba(244, 185, 66, 0.15), transparent 70%)'
              : 'radial-gradient(circle at top right, rgba(0, 166, 214, 0.16), rgba(255, 45, 117, 0.1) 70%, transparent 100%)',
          }}
        />

        {/* Top row with 3D popout */}
        <div>
          <div className="flex items-start justify-between mb-3.5" style={{ transform: 'translateZ(24px)' }}>
            <ToolIcon iconName={tool.icon} isLight={isLight} />
            <div className="flex items-center gap-1.5">
              {tool.processingType === 'ai' && TYPE_BADGE.ai}
              {STATUS_BADGE[tool.implementationStatus] || null}
            </div>
          </div>

          {/* Content with 3D popout */}
          <div style={{ transform: 'translateZ(18px)' }}>
            <h3
              className="font-bold text-base mb-1.5 transition-colors group-hover:text-[var(--accent-electric)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {tool.name}
            </h3>
            {!compact && (
              <p
                className="text-xs leading-relaxed line-clamp-2 mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {tool.description}
              </p>
            )}
          </div>

          {/* Formats Badges */}
          {!compact && tool.inputFormats && tool.inputFormats.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 mb-4" style={{ transform: 'translateZ(14px)' }}>
              {tool.inputFormats.slice(0, 4).map((fmt) => (
                <span
                  key={fmt}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono"
                  style={{
                    background: isLight ? '#F4F6F8' : '#111318',
                    color: isLight ? '#492052' : '#C4C8D1',
                    border: isLight ? '1px solid #D8DDE3' : '1px solid #292D36',
                  }}
                >
                  {fmt}
                </span>
              ))}
              {tool.inputFormats.length > 4 && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: isLight ? '#F4F6F8' : '#111318',
                    color: 'var(--text-muted)',
                    border: isLight ? '1px solid #D8DDE3' : '1px solid #292D36',
                  }}
                >
                  +{tool.inputFormats.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button Footer with 3D Popout */}
        <div
          className="pt-3 border-t flex items-center justify-between text-xs font-semibold transition-colors duration-200 mt-2"
          style={{
            borderColor: isLight ? '#E8EEF2' : '#292D36',
            transform: 'translateZ(20px)',
            color: isLight ? '#32143D' : '#00A6D6',
          }}
        >
          <span className="flex items-center gap-1 group-hover:underline">
            Launch Tool
          </span>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:translate-x-1"
            style={{
              background: isLight ? 'rgba(50, 20, 61, 0.08)' : 'rgba(0, 166, 214, 0.15)',
              color: isLight ? '#32143D' : '#00A6D6',
            }}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
