import { Outlet, Link } from 'react-router-dom';
import { Layers, Sparkles, ShieldCheck, Zap, ArrowLeft, Scissors, Maximize2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import useThemeStore from '../store/themeStore';

export default function AuthLayout() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row transition-colors duration-300"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ─── LEFT PANE: Spatial Brand Showcase ─── */}
      <div
        className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: isLight
            ? 'linear-gradient(145deg, #F4F6F8 0%, #E8EEF2 100%)'
            : 'linear-gradient(145deg, #111318 0%, #09090B 100%)',
          borderRight: isLight ? '1px solid #D8DDE3' : '1px solid #292D36',
        }}
      >
        {/* Ambient Backlight Glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-50"
          style={{
            background: isLight
              ? 'radial-gradient(circle, rgba(244, 185, 66, 0.35) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0, 166, 214, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-40"
          style={{
            background: isLight
              ? 'radial-gradient(circle, rgba(73, 32, 82, 0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 45, 117, 0.25) 0%, transparent 70%)',
          }}
        />

        {/* Top Header */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="PixelForge home"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md"
              style={{
                background: isLight
                  ? 'linear-gradient(135deg, #32143D, #492052)'
                  : 'linear-gradient(135deg, #00A6D6, #007BA7)',
                color: '#FFFFFF',
              }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span
                className="text-xl font-bold tracking-tight block leading-none"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                PixelForge
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
                Spatial Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Center Spatial Composition: Floating Processing Cards */}
        <div className="my-10 lg:my-14 relative z-10 perspective-1000">
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3"
              style={{
                background: isLight ? 'rgba(244, 185, 66, 0.2)' : 'rgba(0, 166, 214, 0.16)',
                color: isLight ? '#B47D06' : '#00A6D6',
                border: isLight ? '1px solid rgba(244, 185, 66, 0.35)' : '1px solid rgba(0, 166, 214, 0.35)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Creative Architecture
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Transform Your Files with Spatial Precision.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
              Next-generation media processing with spatial clarity, native performance, and zero compromise on data privacy.
            </p>
          </div>

          {/* Interactive Layered 3D Cards */}
          <div className="space-y-3 max-w-md">
            {/* Floating Card 1: Image Compression */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="p-3.5 rounded-xl flex items-center justify-between shadow-md"
              style={{
                background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(25, 29, 37, 0.85)',
                border: isLight ? '1px solid #D8DDE3' : '1px solid rgba(0, 166, 214, 0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isLight ? 'rgba(50, 20, 61, 0.1)' : 'rgba(0, 166, 214, 0.18)',
                    color: isLight ? '#32143D' : '#00A6D6',
                  }}
                >
                  <Maximize2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Lossless Compression</h4>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Smart AVIF & WebP encoding</p>
                </div>
              </div>
              <span
                className="text-[11px] font-bold font-mono px-2 py-0.5 rounded"
                style={{
                  background: isLight ? 'rgba(244, 185, 66, 0.2)' : 'rgba(0, 166, 214, 0.15)',
                  color: isLight ? '#B47D06' : '#00A6D6',
                }}
              >
                -82% Size
              </span>
            </motion.div>

            {/* Floating Card 2: Background Removal */}
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="p-3.5 rounded-xl flex items-center justify-between shadow-md"
              style={{
                background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(25, 29, 37, 0.85)',
                border: isLight ? '1px solid #D8DDE3' : '1px solid rgba(255, 45, 117, 0.35)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isLight ? 'rgba(73, 32, 82, 0.1)' : 'rgba(255, 45, 117, 0.18)',
                    color: isLight ? '#492052' : '#FF2D75',
                  }}
                >
                  <Scissors className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>AI Background Removal</h4>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Face & hair contour preservation</p>
                </div>
              </div>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded"
                style={{
                  background: isLight ? 'rgba(73, 32, 82, 0.12)' : 'rgba(255, 45, 117, 0.15)',
                  color: isLight ? '#492052' : '#FF2D75',
                }}
              >
                Alpha PNG
              </span>
            </motion.div>

            {/* Floating Card 3: Encrypted PDF Engine */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="p-3.5 rounded-xl flex items-center justify-between shadow-md"
              style={{
                background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(25, 29, 37, 0.85)',
                border: isLight ? '1px solid #D8DDE3' : '1px solid rgba(0, 166, 214, 0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isLight ? 'rgba(50, 20, 61, 0.1)' : 'rgba(0, 166, 214, 0.15)',
                    color: isLight ? '#32143D' : '#00A6D6',
                  }}
                >
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Universal PDF Conversion</h4>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Merge, split, protect & OCR extract</p>
                </div>
              </div>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
                style={{
                  background: isLight ? 'rgba(50, 20, 61, 0.08)' : 'rgba(0, 166, 214, 0.12)',
                  color: isLight ? '#32143D' : '#00A6D6',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Isolated
              </span>
            </motion.div>
          </div>
        </div>

        {/* Footer Brand Statement */}
        <div className="relative z-10 pt-4 border-t" style={{ borderColor: isLight ? '#D8DDE3' : '#292D36' }}>
          <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: isLight ? '#F4B942' : '#00A6D6' }} />
            Zero permanent retention. All processed buffers purged automatically.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANE: Authentication Form ─── */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-between items-center relative">
        {/* Top bar with back link and theme toggle */}
        <div className="w-full max-w-md flex items-center justify-between pb-8">
          <Link
            to="/"
            className="btn-ghost text-xs flex items-center gap-1.5 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md my-auto">
          <Outlet />
        </div>

        {/* Footer note */}
        <div className="w-full max-w-md pt-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} PixelForge. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
