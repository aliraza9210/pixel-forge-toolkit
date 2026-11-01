import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Image as ImageIcon,
  Zap,
  ShieldCheck,
  Scissors,
  Maximize2,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function Hero3DVisual() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 180, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl mx-auto py-10 select-none perspective-1400"
    >
      {/* Dynamic Ambient Backlight Glow */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl pointer-events-none transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(244, 185, 66, 0.28) 0%, rgba(73, 32, 82, 0.16) 50%, transparent 72%)'
            : 'radial-gradient(circle, rgba(0, 166, 214, 0.25) 0%, rgba(255, 45, 117, 0.18) 50%, transparent 72%)',
          transform: 'scale(1.25)',
        }}
      />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
        }}
        className="relative w-full min-h-[460px] sm:min-h-[490px] flex items-center justify-center"
      >
        {/* ─── CARD 1: Core Centerpiece — Image Processing Workspace (Z: 20px) ─── */}
        <motion.div
          style={{ transform: 'translateZ(20px)' }}
          className="w-full max-w-lg rounded-2xl p-6 transition-all duration-300"
          style={{
            background: isLight
              ? 'rgba(255, 255, 255, 0.92)'
              : 'linear-gradient(145deg, rgba(25, 29, 37, 0.88), rgba(17, 19, 24, 0.94))',
            backdropFilter: 'blur(20px)',
            border: isLight
              ? '1px solid #D8DDE3'
              : '1px solid rgba(0, 166, 214, 0.35)',
            boxShadow: isLight
              ? '0 20px 50px rgba(50, 20, 61, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              : '0 25px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 30px rgba(0, 166, 214, 0.15)',
          }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between pb-3.5 border-b"
            style={{ borderColor: isLight ? '#E8EEF2' : '#292D36' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: isLight ? '#32143D' : '#FF2D75' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: isLight ? '#F4B942' : '#00A6D6' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: isLight ? '#77727E' : '#292D36' }} />
              <span className="text-xs font-mono ml-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                pixelforge.spatial/workspace
              </span>
            </div>
            <span
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
              style={{
                background: isLight ? 'rgba(244, 185, 66, 0.18)' : 'rgba(0, 166, 214, 0.15)',
                color: isLight ? '#B47D06' : '#00A6D6',
                border: isLight ? '1px solid rgba(244, 185, 66, 0.35)' : '1px solid rgba(0, 166, 214, 0.35)',
              }}
            >
              <Zap className="w-3 h-3" /> Native Multi-Thread
            </span>
          </div>

          {/* Center Visual Canvas Area */}
          <div
            className="my-5 rounded-xl p-4 transition-all duration-300"
            style={{
              background: isLight ? '#F4F6F8' : '#111318',
              border: isLight ? '1px solid #D8DDE3' : '1px solid #292D36',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: isLight ? 'rgba(50, 20, 61, 0.1)' : 'rgba(0, 166, 214, 0.18)',
                    color: isLight ? '#32143D' : '#00A6D6',
                    border: isLight ? '1px solid rgba(50, 20, 61, 0.2)' : '1px solid rgba(0, 166, 214, 0.35)',
                  }}
                >
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Spatial Image Processing
                  </h4>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Lossless Sharp Pipeline • WebP / AVIF • Zero Quality Loss
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-md"
                style={{
                  background: isLight ? 'rgba(73, 32, 82, 0.1)' : 'rgba(255, 45, 117, 0.15)',
                  color: isLight ? '#492052' : '#FF2D75',
                  border: isLight ? '1px solid rgba(73, 32, 82, 0.2)' : '1px solid rgba(255, 45, 117, 0.3)',
                }}
              >
                Auto-Optimized
              </span>
            </div>

            {/* Simulated Live Progress Meter */}
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>Processing Matrix</span>
                <span style={{ color: isLight ? '#32143D' : '#00A6D6' }}>100% Verified</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: isLight ? '#E8EEF2' : '#191D25' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: isLight
                      ? 'linear-gradient(90deg, #32143D 0%, #492052 50%, #F4B942 100%)'
                      : 'linear-gradient(90deg, #007BA7 0%, #00A6D6 50%, #FF2D75 100%)',
                  }}
                  animate={{
                    width: ['30%', '95%', '70%', '100%'],
                  }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 rounded-lg" style={{ background: isLight ? '#F4F6F8' : '#111318' }}>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Speed</p>
              <p className="text-xs font-bold font-mono" style={{ color: isLight ? '#32143D' : '#00A6D6' }}>0.24s Avg</p>
            </div>
            <div className="p-2 rounded-lg" style={{ background: isLight ? '#F4F6F8' : '#111318' }}>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Security</p>
              <p className="text-xs font-bold font-mono" style={{ color: isLight ? '#B47D06' : '#FF2D75' }}>Isolated</p>
            </div>
            <div className="p-2 rounded-lg" style={{ background: isLight ? '#F4F6F8' : '#111318' }}>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Privacy</p>
              <p className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>Zero-Log</p>
            </div>
          </div>
        </motion.div>

        {/* ─── CARD 2: Floating Top-Right — Background Removal (Z: 55px) ─── */}
        <motion.div
          style={{ transform: 'translateZ(55px)' }}
          animate={{
            y: [-6, 6, -6],
            rotate: [2, -2, 2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-6 -right-2 sm:-right-8 p-3.5 rounded-xl hidden sm:flex items-center gap-3 transition-all duration-300"
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(25, 29, 37, 0.92)',
            backdropFilter: 'blur(16px)',
            border: isLight ? '1px solid #D8DDE3' : '1px solid rgba(255, 45, 117, 0.4)',
            boxShadow: isLight
              ? '0 12px 30px rgba(50, 20, 61, 0.12)'
              : '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 45, 117, 0.2)',
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: isLight ? 'rgba(73, 32, 82, 0.12)' : 'rgba(255, 45, 117, 0.2)',
              color: isLight ? '#492052' : '#FF2D75',
            }}
          >
            <Scissors className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Background Removal</span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                style={{
                  background: isLight ? 'rgba(244, 185, 66, 0.2)' : 'rgba(255, 45, 117, 0.18)',
                  color: isLight ? '#B47D06' : '#FF2D75',
                }}
              >
                AI Matte
              </span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Transparent Alpha PNG</p>
          </div>
        </motion.div>

        {/* ─── CARD 3: Floating Top-Left — Image Compression (Z: 45px) ─── */}
        <motion.div
          style={{ transform: 'translateZ(45px)' }}
          animate={{
            y: [5, -7, 5],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-4 -left-2 sm:-left-8 p-3.5 rounded-xl hidden sm:flex items-center gap-3 transition-all duration-300"
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(25, 29, 37, 0.92)',
            backdropFilter: 'blur(16px)',
            border: isLight ? '1px solid #D8DDE3' : '1px solid rgba(0, 166, 214, 0.4)',
            boxShadow: isLight
              ? '0 12px 30px rgba(50, 20, 61, 0.12)'
              : '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 166, 214, 0.2)',
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: isLight ? 'rgba(50, 20, 61, 0.1)' : 'rgba(0, 166, 214, 0.2)',
              color: isLight ? '#32143D' : '#00A6D6',
            }}
          >
            <Maximize2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Image Compression</span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                style={{
                  background: isLight ? 'rgba(50, 20, 61, 0.12)' : 'rgba(0, 166, 214, 0.18)',
                  color: isLight ? '#32143D' : '#00A6D6',
                }}
              >
                -82%
              </span>
            </div>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>4.8 MB → 860 KB</p>
          </div>
        </motion.div>

        {/* ─── CARD 4: Floating Bottom-Left — Image Enhancement (Z: 60px) ─── */}
        <motion.div
          style={{ transform: 'translateZ(60px)' }}
          animate={{
            y: [-5, 7, -5],
            rotate: [1.5, -1.5, 1.5],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-6 -left-2 sm:-left-6 p-3 rounded-xl hidden sm:flex items-center gap-2.5 transition-all duration-300"
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(25, 29, 37, 0.92)',
            backdropFilter: 'blur(16px)',
            border: isLight ? '1px solid #D8DDE3' : '1px solid rgba(0, 166, 214, 0.35)',
            boxShadow: isLight
              ? '0 12px 28px rgba(50, 20, 61, 0.1)'
              : '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 166, 214, 0.18)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: isLight ? 'rgba(244, 185, 66, 0.18)' : 'rgba(0, 166, 214, 0.2)',
              color: isLight ? '#B47D06' : '#00A6D6',
            }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Image Enhancement</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dynamic HDR Contrast</p>
          </div>
        </motion.div>

        {/* ─── CARD 5: Floating Bottom-Right — PDF Conversion (Z: 50px) ─── */}
        <motion.div
          style={{ transform: 'translateZ(50px)' }}
          animate={{
            y: [6, -6, 6],
            rotate: [-1.8, 1.8, -1.8],
          }}
          transition={{
            duration: 5.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-5 -right-2 sm:-right-6 p-3 rounded-xl hidden sm:flex items-center gap-2.5 transition-all duration-300"
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(25, 29, 37, 0.92)',
            backdropFilter: 'blur(16px)',
            border: isLight ? '1px solid #D8DDE3' : '1px solid rgba(255, 45, 117, 0.35)',
            boxShadow: isLight
              ? '0 12px 28px rgba(50, 20, 61, 0.1)'
              : '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 45, 117, 0.18)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: isLight ? 'rgba(73, 32, 82, 0.12)' : 'rgba(255, 45, 117, 0.2)',
              color: isLight ? '#492052' : '#FF2D75',
            }}
          >
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>PDF Conversion</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Multi-Page Vector to 300 DPI</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
