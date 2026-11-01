import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TOOLS, IMAGE_CATEGORIES } from '../data/toolsRegistry';

const CATEGORY_CONFIG = {
  'Image Editing': { gradient: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', glow: 'rgba(59,130,246,0.35)', short: 'EDIT', emoji: '✂️' },
  'AI & Smart Tools': { gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', glow: 'rgba(168,85,247,0.35)', short: 'AI', emoji: '🤖' },
  'Photo Effects': { gradient: 'linear-gradient(135deg,#ec4899,#f97316)', glow: 'rgba(236,72,153,0.35)', short: 'FX', emoji: '✨' },
  'Format Conversion': { gradient: 'linear-gradient(135deg,#f59e0b,#eab308)', glow: 'rgba(245,158,11,0.35)', short: 'CVT', emoji: '🔄' },
  'Image Compression': { gradient: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.35)', short: 'ZIP', emoji: '📦' },
  'Photo Resize': { gradient: 'linear-gradient(135deg,#0ea5e9,#2563eb)', glow: 'rgba(14,165,233,0.35)', short: 'RSZ', emoji: '📐' },
  'Social Media': { gradient: 'linear-gradient(135deg,#e1306c,#833ab4)', glow: 'rgba(225,48,108,0.35)', short: 'SOC', emoji: '📱' },
  'Background & Transparency': { gradient: 'linear-gradient(135deg,#a855f7,#0891b2)', glow: 'rgba(168,85,247,0.35)', short: 'BG', emoji: '🪄' },
  'Image Optimization': { gradient: 'linear-gradient(135deg,#fde047,#f59e0b)', glow: 'rgba(253,224,71,0.35)', short: 'OPT', emoji: '⚡' },
};

function Tool3DItem({ tool, catConfig, index }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({ x: dy * -8, y: dx * 8, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, active: false });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.32, ease: 'easeOut' }}
    >
      <Link
        ref={ref}
        to={tool.route}
        id={`img-tool-${tool.id}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'block',
          textDecoration: 'none',
          transform: tilt.active
            ? `perspective(500px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(6px)`
            : 'perspective(500px) rotateX(0) rotateY(0) translateZ(0)',
          transition: tilt.active ? 'transform 0.07s ease' : 'transform 0.4s cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <div
          style={{
            background: tilt.active ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            border: `1px solid ${tilt.active ? catConfig.glow : 'var(--border-subtle)'}`,
            borderRadius: 9,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            backdropFilter: 'blur(6px)',
            boxShadow: tilt.active
              ? `0 8px 24px ${catConfig.glow}`
              : 'var(--shadow-sm)',
            transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                display: 'block',
                lineHeight: 1.3,
                transition: 'color 0.18s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tool.name}
            </span>
            {tool.processingType === 'ai' && (
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#a78bfa',
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.28)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  display: 'inline-block',
                  marginTop: 2,
                }}
              >
                AI
              </span>
            )}
          </div>
          <div
            style={{
              width: 17,
              height: 17,
              borderRadius: '50%',
              background: tilt.active ? catConfig.gradient : 'transparent',
              border: `1.5px solid ${tilt.active ? 'transparent' : 'rgba(255,255,255,0.13)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.18s',
              boxShadow: tilt.active ? `0 0 10px ${catConfig.glow}` : 'none',
            }}
          >
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
              <path d="M2 4h4M4.5 2l2 2-2 2" stroke={tilt.active ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoryColumn({ category, tools, colIndex }) {
  const cfg = CATEGORY_CONFIG[category] || { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,0.3)', short: 'IMG', emoji: '🖼️' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colIndex * 0.06, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      style={{ minWidth: 0 }}
    >
      <div
        style={{
          marginBottom: 11,
          padding: '11px 12px',
          background: 'var(--bg-card)',
          borderRadius: 11,
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: cfg.gradient, borderRadius: '11px 11px 0 0' }} />
        <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 45, background: cfg.glow, filter: 'blur(20px)', borderRadius: '50%', opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.gradient, borderRadius: 5, padding: '2px 7px', fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: 5, boxShadow: `0 2px 8px ${cfg.glow}` }}>
            {cfg.short}
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{category}</h3>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>{tools.length} tools</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tools.map((tool, i) => (
          <Tool3DItem key={tool.id} tool={tool} catConfig={cfg} index={colIndex * 0.2 + i} />
        ))}
      </div>
    </motion.div>
  );
}

const IMG_TOOLS_BY_CAT = IMAGE_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = TOOLS.filter((t) => t.category === cat);
  return acc;
}, {});

const TOTAL_IMG = Object.values(IMG_TOOLS_BY_CAT).flat().length;
const AI_COUNT = Object.values(IMG_TOOLS_BY_CAT).flat().filter((t) => t.processingType === 'ai').length;

export default function ImageToolsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCats = activeFilter === 'All' ? IMAGE_CATEGORIES : IMAGE_CATEGORIES.filter((c) => c === activeFilter);
  const colCount = Math.min(filteredCats.length, 9);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glows */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.05) 0%,transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '50%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.04) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.22)', borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', display: 'inline-block', boxShadow: '0 0 7px #3b82f6' }} />
              Image Suite
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.9rem,3.8vw,3rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 10px' }}>
            <span style={{ color: 'var(--text-primary)' }}>
              Every Image Tool.
            </span>
            {' '}
            <span className="text-gradient-primary">
              One Platform.
            </span>
          </h1>

          <p style={{ fontSize: 14.5, color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.6, margin: '0 0 20px' }}>
            {TOTAL_IMG}+ tools across {IMAGE_CATEGORIES.length} categories — edit, compress, convert, resize, and apply AI effects. All free, no sign-up.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Image Tools', value: `${TOTAL_IMG}+` },
              { label: 'Categories', value: IMAGE_CATEGORIES.length },
              { label: 'AI Powered', value: AI_COUNT },
              { label: 'Cost', value: 'Free' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '7px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 9, backdropFilter: 'blur(6px)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filter Pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.36 }} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          {['All', ...IMAGE_CATEGORIES].map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                id={`img-filter-${cat.replace(/[\s&]+/g, '-').toLowerCase()}`}
                onClick={() => setActiveFilter(cat)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 18,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                  background: isActive ? (cfg ? cfg.gradient : 'linear-gradient(135deg,#3b82f6,#a855f7)') : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : 'rgba(148,163,184,0.88)',
                  boxShadow: isActive ? (cfg ? `0 3px 16px ${cfg.glow}` : '0 3px 16px rgba(59,130,246,0.3)') : 'none',
                  transition: 'all 0.18s',
                  letterSpacing: '0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {cfg?.emoji && <span style={{ fontSize: 11 }}>{cfg.emoji}</span>}
                {cat}
                {cat !== 'All' && (
                  <span style={{ fontSize: 9.5, opacity: 0.72, marginLeft: 2 }}>
                    {IMG_TOOLS_BY_CAT[cat]?.length || 0}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* 3D Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: activeFilter === 'All'
              ? 'repeat(auto-fit, minmax(145px, 1fr))'
              : '1fr',
            gap: 12,
            alignItems: 'start',
          }}
        >
          {filteredCats.map((cat, i) => (
            <CategoryColumn key={cat} category={cat} tools={IMG_TOOLS_BY_CAT[cat] || []} colIndex={i} />
          ))}
        </div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          style={{ marginTop: 52, padding: '26px 34px', background: 'linear-gradient(135deg,rgba(59,130,246,0.07) 0%,rgba(168,85,247,0.07) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18, backdropFilter: 'blur(10px)' }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em', marginBottom: 4 }}>Need PDF tools too?</div>
            <p style={{ fontSize: 13.5, color: 'rgba(148,163,184,0.78)', margin: 0 }}>Explore our complete PDF suite — merge, split, convert, sign, and AI-powered tools.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/pdf-tools" style={{ padding: '10px 24px', borderRadius: 11, background: 'linear-gradient(135deg,#ef4444,#a855f7)', color: '#fff', fontWeight: 700, fontSize: 13.5, textDecoration: 'none', boxShadow: '0 4px 18px rgba(239,68,68,0.32)', transition: 'transform 0.2s,box-shadow 0.2s', display: 'inline-block' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(239,68,68,0.42)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(239,68,68,0.32)'; }}>
              PDF Tools →
            </Link>
            <Link to="/tools" style={{ padding: '10px 24px', borderRadius: 11, background: 'rgba(255,255,255,0.07)', color: '#f8fafc', fontWeight: 600, fontSize: 13.5, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s', display: 'inline-block' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}>
              All Tools
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
