import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, Shield, Globe, Upload, Cpu, Download,
  Star, CheckCircle, ChevronDown, Image, FileText, Sparkles,
  Sliders, Lock, ShieldCheck,
} from 'lucide-react';
import ToolCard from '../components/ToolCard';
import SearchBar from '../components/SearchBar';
import ThreeCanvasBackground from '../components/ThreeCanvasBackground';
import Hero3DVisual from '../components/Hero3DVisual';
import CategoryTabs from '../components/CategoryTabs';
import { TOOLS, POPULAR_TOOLS, CATEGORIES, TOOLS_BY_CATEGORY, searchTools } from '../data/toolsRegistry';
import useThemeStore from '../store/themeStore';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Section({ children, className = '', id, style }) {
  return (
    <section id={id} style={style} className={`py-20 px-4 sm:px-6 max-w-7xl mx-auto ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <div className="text-center mb-14">
      {eyebrow && (
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3.5 py-1 rounded-full shadow-sm"
          style={{
            background: isLight ? 'rgba(244, 185, 66, 0.16)' : 'rgba(0, 166, 214, 0.14)',
            color: isLight ? '#B47D06' : '#00A6D6',
            border: isLight ? '1px solid rgba(244, 185, 66, 0.35)' : '1px solid rgba(0, 166, 214, 0.35)',
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="section-heading mb-4">{title}</h2>
      {subtitle && (
        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => (query.length > 1 ? searchTools(query).slice(0, 6) : []), [query]);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const SUGGESTIONS = ['compress image', 'merge pdf', 'remove background', 'convert to webp'];
  const POPULAR_CHIPS = POPULAR_TOOLS.slice(0, 5);

  return (
    <div className="relative min-h-[94vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* 3D WebGL Spatial Particle & Geometric Mesh Canvas */}
      <ThreeCanvasBackground />

      {/* Background ambient lighting glows adapting to active theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, var(--hero-glow-1) 0%, transparent 68%)',
            filter: 'blur(75px)',
          }}
        />
        <div
          className="absolute top-1/3 left-1/5 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, var(--hero-glow-2) 0%, transparent 70%)',
            filter: 'blur(65px)',
          }}
        />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
        {/* Spatial Badge */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              color: isLight ? '#32143D' : '#00A6D6',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: isLight ? '#F4B942' : '#FF2D75' }} />
            Next-Gen Spatial Architecture • 100% Client & Server Security
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          className="hero-heading mb-6"
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          Transform Your Files.{' '}
          <br className="hidden sm:inline" />
          <span className={isLight ? 'text-gradient-aubergine' : 'text-gradient-primary'}>
            Redefine Your Workflow.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
        >
          PixelForge is an intelligent spatial platform for image and PDF processing.
          Compress, convert, enhance, and extract insights with native precision and zero compromise on data privacy.
        </motion.p>

        {/* Primary and Secondary CTAs */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center mb-10"
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
        >
          <Link to="/tools" className="btn-primary px-8 py-3.5 text-base font-semibold shadow-lg">
            Start Creating <ArrowRight className="w-4.5 h-4.5" />
          </Link>
          <a href="#tools-showcase" className="btn-secondary px-7 py-3.5 text-base font-semibold">
            Explore Tools
          </a>
        </motion.div>

        {/* Search Bar with Autocomplete */}
        <motion.div
          className="relative max-w-xl mx-auto mb-6"
          variants={fadeUp} initial="hidden" animate="visible" custom={3.5}
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search tools (e.g. compress image, background removal, split pdf)..."
            suggestions={SUGGESTIONS}
          />

          {/* Search Dropdown */}
          {results.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 text-left shadow-xl"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
              }}
            >
              {results.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.route}
                  onClick={() => setQuery('')}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-all"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <span
                    className="text-xs px-2 py-0.5 rounded font-mono font-semibold"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                  >
                    {tool.category}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{tool.name}</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Popular chips */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-8"
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
        >
          <span className="text-xs self-center font-semibold" style={{ color: 'var(--text-muted)' }}>Quick Access:</span>
          {POPULAR_CHIPS.map((tool) => (
            <Link
              key={tool.id}
              to={tool.route}
              className="text-xs px-3.5 py-1.5 rounded-full transition-all shadow-sm font-medium"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = isLight ? '#32143D' : '#00A6D6';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {tool.name}
            </Link>
          ))}
        </motion.div>

        {/* Premium 3D Spatial Composition with 5 floating tools */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4.5}
          className="my-4 max-w-xl mx-auto"
        >
          <Hero3DVisual />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Spatial Feature Cards Section ───────────────────────────────────────────
function FeatureToolsSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const categories = ['All', 'Image Editing', 'Convert Image', 'Organize PDF', 'PDF Intelligence'];

  const filteredTools = useMemo(() => {
    if (activeCategory === 'All') {
      return POPULAR_TOOLS.slice(0, 8);
    }
    return (TOOLS_BY_CATEGORY[activeCategory] || []).slice(0, 8);
  }, [activeCategory]);

  return (
    <Section id="tools-showcase" style={{ paddingTop: '2rem' }}>
      <SectionHeader
        eyebrow="Interactive Workspace"
        title="Engineered for Precision"
        subtitle="Explore our spatial file processing suite. Every tool runs directly on native high-throughput engines."
      />

      {/* Category Filter Pills */}
      <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <div
          className="inline-flex p-1 rounded-xl"
          style={{
            background: isLight ? '#F4F6F8' : '#111318',
            border: isLight ? '1px solid #D8DDE3' : '1px solid #292D36',
          }}
        >
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                style={{
                  background: active
                    ? (isLight ? '#32143D' : '#00A6D6')
                    : 'transparent',
                  color: active
                    ? '#FFFFFF'
                    : (isLight ? '#77727E' : '#A1A1AA'),
                  boxShadow: active
                    ? (isLight ? '0 2px 10px rgba(50, 20, 61, 0.25)' : '0 2px 12px rgba(0, 166, 214, 0.35)')
                    : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Spatial Feature Cards */}
      <div className="grid-tools">
        {filteredTools.map((tool, i) => (
          <motion.div
            key={tool.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i % 4}
          >
            <ToolCard tool={tool} />
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link to="/tools" className="btn-secondary px-6 py-3 text-sm">
          Browse All {TOOLS.length} Verified Tools <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}

// ─── Spatial Workflow: How It Works ──────────────────────────────────────────
function SpatialWorkflow() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const steps = [
    {
      icon: Upload,
      num: '01',
      title: 'Spatial Upload',
      desc: 'Drag & drop images or PDFs up to 100MB. Binary magic-byte verified with zero client memory leakage.',
    },
    {
      icon: Cpu,
      num: '02',
      title: 'Native Processing',
      desc: 'Hardware-accelerated libvips, Sharp, and PDF-lib apply compression, background extraction, and OCR in milliseconds.',
    },
    {
      icon: Download,
      num: '03',
      title: 'Ephemeral Download',
      desc: 'Retrieve your crystal-clear files immediately. Files automatically purge from server memory after 60 minutes.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Workflow Architecture"
          title="Three Steps to Finished Files"
          subtitle="No complex software installations or hidden subscriptions. Simply drop, customize, and save."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="card-depth p-8 text-center relative group"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: isLight ? 'rgba(50, 20, 61, 0.08)' : 'rgba(0, 166, 214, 0.16)',
                  border: isLight ? '1px solid rgba(50, 20, 61, 0.2)' : '1px solid rgba(0, 166, 214, 0.35)',
                  color: isLight ? '#32143D' : '#00A6D6',
                  position: 'relative',
                }}
              >
                <step.icon className="w-7 h-7" />
                <span
                  className="absolute -top-2.5 -right-2.5 text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  style={{
                    background: isLight ? '#F4B942' : '#FF2D75',
                    color: isLight ? '#24212A' : '#FFFFFF',
                  }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Spatial Security & Trust ────────────────────────────────────────────────
function SecuritySection() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const features = [
    {
      icon: ShieldCheck,
      title: 'Independently Verified Security',
      desc: 'All endpoints audited with strict NoSQL injection guards, rate limits, UUID isolation, and canonical path traversal boundaries.',
    },
    {
      icon: Zap,
      title: 'Ultra-Low Latency Pipelines',
      desc: 'Sharp multi-threading and asynchronous streaming minimize time-to-first-byte across high-res batch conversions.',
    },
    {
      icon: Globe,
      title: 'Zero Plugin Dependency',
      desc: 'Full spatial UI runs universally in any modern browser without external apps, Flash, or browser extension permissions.',
    },
    {
      icon: Lock,
      title: 'Cryptographic Privacy',
      desc: 'Files are processed inside sandboxed runtime boundaries and unlinked automatically. We never train AI models on user files.',
    },
  ];

  return (
    <Section id="security-trust">
      <SectionHeader
        eyebrow="Enterprise Trust"
        title="Engineered for Extreme Privacy & Speed"
        subtitle="PixelForge is built on zero-trust principles: verified file signatures, sandboxed temp stores, and instant disposal."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
            className="card-depth p-6"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: isLight ? 'rgba(73, 32, 82, 0.1)' : 'rgba(0, 166, 214, 0.16)',
                border: isLight ? '1px solid rgba(73, 32, 82, 0.2)' : '1px solid rgba(0, 166, 214, 0.35)',
                color: isLight ? '#492052' : '#00A6D6',
              }}
            >
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
              {f.title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Are my files secure and private?', a: 'Yes. Every uploaded file is processed in memory or ephemeral sandboxes, verified via binary magic bytes, and automatically purged after 60 minutes. No file data is ever retained or sold.' },
  { q: 'Do I need an account to use PixelForge?', a: 'No. All core image and PDF tools are completely free to use without registration. Creating an account gives you higher batch limits and file activity history.' },
  { q: 'What is the maximum file size limit?', a: 'Standard file sizes up to 35MB are supported per conversion, with aggregate batch uploads up to 100MB.' },
  { q: 'How does background removal work?', a: 'PixelForge uses an edge-detecting alpha matte algorithm that protects facial features and hair contours while erasing solid, gradients, or custom-keyed backdrops.' },
  { q: 'Is there a light theme available?', a: 'Yes! PixelForge features two distinct, hand-crafted spatial themes: Jet Black + Cerulean + Neon Rose for Dark Mode, and Ice Silver + Deep Aubergine + Marigold for Light Mode.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <Section id="faq">
      <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" />
      <div className="max-w-2xl mx-auto space-y-3.5">
        {FAQS.map((faq, i) => (
          <div key={i} className="card-depth overflow-hidden">
            <button
              id={`faq-btn-${i}`}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {faq.q}
              <ChevronDown
                className="w-4 h-4 shrink-0 transition-transform duration-200"
                style={{
                  color: 'var(--text-muted)',
                  transform: open === i ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>
            {open === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-4 text-sm"
                style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}
              >
                <p className="pt-3 leading-relaxed">{faq.a}</p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center card-depth p-10 sm:p-14 relative overflow-hidden">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="section-heading mb-4">Start Creating with PixelForge Today</h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Elevate your media and document workflow with next-generation spatial tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/tools" className="btn-primary px-8 py-3.5 text-base font-semibold">
              Start Creating <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="btn-secondary px-7 py-3.5 text-base font-semibold">
              Explore Plans
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeatureToolsSection />
      <SpatialWorkflow />
      <SecuritySection />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
