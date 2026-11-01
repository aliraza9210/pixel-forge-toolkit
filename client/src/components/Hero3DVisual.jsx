import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, FileText, Image as ImageIcon, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function Hero3DVisual() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);

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
      className="relative w-full max-w-lg mx-auto py-8 select-none"
      style={{ perspective: 1400 }}
    >
      {/* Ambient Backlight Glow */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #a3e635 0%, #38bdf8 50%, transparent 70%)',
          transform: 'scale(1.2)',
        }}
      />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
        }}
        className="relative rounded-2xl p-6 card-depth border border-white/15 bg-gradient-to-br from-white/10 via-black/40 to-black/80 backdrop-blur-xl shadow-2xl"
      >
        {/* Header bar of 3D card */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-lime-500/80" />
            <span className="text-xs font-mono text-muted ml-2">pixelforge-engine.v2</span>
          </div>
          <span className="text-[11px] font-semibold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20 flex items-center gap-1">
            <Zap className="w-3 h-3" /> 60 FPS Native
          </span>
        </div>

        {/* Center 3D Workspace Representation */}
        <div className="my-6 relative rounded-xl overflow-hidden p-5 bg-black/40 border border-white/10" style={{ transform: 'translateZ(35px)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Ultra-HD Image Optimization</p>
                <p className="text-[11px] text-muted">Lossless WebP • Chroma 4:4:4 • Multi-thread</p>
              </div>
            </div>
            <span className="text-xs font-bold text-lime-400 bg-lime-400/15 px-2.5 py-1 rounded-md">
              -68% Size
            </span>
          </div>

          {/* Progress / Waveform animation bar */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-lime-400 via-sky-400 to-indigo-500 rounded-full"
              animate={{
                width: ['25%', '92%', '65%', '100%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* Floating 3D Orbit Badges */}
        <motion.div
          style={{ transform: 'translateZ(55px)' }}
          className="absolute -top-4 -left-6 px-3.5 py-2 rounded-xl bg-black/80 border border-lime-400/40 shadow-xl flex items-center gap-2"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        >
          <Sparkles className="w-4 h-4 text-lime-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">AI Edge Detection</span>
        </motion.div>

        <motion.div
          style={{ transform: 'translateZ(65px)' }}
          className="absolute -bottom-4 -right-4 px-3.5 py-2 rounded-xl bg-black/80 border border-sky-400/40 shadow-xl flex items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
        >
          <FileText className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-white">PDF Vector Engine</span>
        </motion.div>

        <motion.div
          style={{ transform: 'translateZ(45px)' }}
          className="absolute top-1/2 -right-6 px-3 py-1.5 rounded-lg bg-black/80 border border-violet-400/40 shadow-xl flex items-center gap-1.5"
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[11px] font-medium text-white/90">Zero Data Storage</span>
        </motion.div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 text-[11px] text-muted" style={{ transform: 'translateZ(20px)' }}>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-sky-400" /> WebAssembly + Sharp 0.35
          </span>
          <span className="text-lime-400/80 font-mono">114+ Tools Ready</span>
        </div>
      </motion.div>
    </div>
  );
}

