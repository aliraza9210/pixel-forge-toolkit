import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, Shield, Globe, Upload, Cpu, Download,
  Star, CheckCircle, ChevronDown, Image, FileText, Sparkles,
} from 'lucide-react';
import ToolCard from '../components/ToolCard';
import SearchBar from '../components/SearchBar';
import { TOOLS, POPULAR_TOOLS, CATEGORIES, TOOLS_BY_CATEGORY, searchTools } from '../data/toolsRegistry';

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`py-20 px-4 sm:px-6 max-w-7xl mx-auto ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center mb-14">
      {eyebrow && (
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-lime-glow)', color: 'var(--accent-lime)', border: '1px solid rgba(163,230,53,0.25)' }}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="section-heading mb-4">{title}</h2>
      {subtitle && <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => (query.length > 1 ? searchTools(query).slice(0, 6) : []), [query]);

  const SUGGESTIONS = ['compress image', 'merge pdf', 'remove background', 'convert to webp'];
  const POPULAR_CHIPS = POPULAR_TOOLS.slice(0, 6);

  return (
    <div className="relative min-h-[92vh] flex items-center pt-20 overflow-hidden">
      {/* Background ambient glows adapting to active theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[550px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, var(--hero-glow-1) 0%, transparent 68%)', filter: 'blur(70px)' }}
        />
        <div
          className="absolute top-1/3 left-1/5 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(ellipse, var(--hero-glow-2) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        {/* Badge */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              color: 'var(--accent-lime)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {TOOLS.length}+ Production Tools • 100% Free • No Sign-up Required
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="hero-heading mb-6"
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          Every image.{' '}
          <span className="text-gradient-lime">Every document.</span>
          <br />One powerful workspace.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
        >
          Fast, private image optimization, PDF editing, and AI document intelligence
          running directly on native engines without storing your private data.
        </motion.p>

        {/* Search */}
        <motion.div
          className="relative max-w-xl mx-auto mb-8"
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search 35+ tools (e.g. compress image, merge pdf, ai summarizer)..."
            suggestions={SUGGESTIONS}
          />

          {/* Inline search results dropdown */}
          {results.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 text-left"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-lg)' }}
            >
              {results.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.route}
                  onClick={() => setQuery('')}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-all"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <span
                    className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                  >
                    {tool.category}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">{tool.name}</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Popular chips */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-10"
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
        >
          <span className="text-xs self-center font-medium" style={{ color: 'var(--text-muted)' }}>Popular:</span>
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
                e.currentTarget.style.borderColor = tool.color;
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

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap gap-3.5 justify-center mb-12"
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
        >
          <Link to="/tools" className="btn-primary px-7 py-3 text-base shadow-lg">
            Explore All Tools <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/image-tools" className="btn-secondary px-6 py-3 text-base">
            Try Image Tools
          </Link>
        </motion.div>

        {/* Quick Highlights Strip */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 text-left"
          variants={fadeUp} initial="hidden" animate="visible" custom={6}
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {[
            { icon: Zap, label: 'Instant Execution', desc: 'Native Sharp & pdf-lib' },
            { icon: Shield, label: 'Ephemeral Privacy', desc: 'Auto-purged in 60 mins' },
            { icon: Globe, label: '30+ Live Tools', desc: 'No software to install' },
            { icon: Sparkles, label: 'Smart AI Insights', desc: 'Summary, Q&A & Quiz' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="p-3.5 rounded-xl transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-lime)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Popular Tools Section ────────────────────────────────────────────────────
function PopularToolsSection() {
  return (
    <Section id="popular-tools" style={{ paddingTop: 0 }}>
      <SectionHeader
        eyebrow="Most Used"
        title="Popular Tools"
        subtitle="The tools our users reach for most often."
      />
      <div className="grid-tools">
        {POPULAR_TOOLS.map((tool, i) => (
          <motion.div key={tool.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 4}>
            <ToolCard tool={tool} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-10">
        <Link to="/tools" className="btn-secondary">
          View all {TOOLS.length} tools <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}

// ─── Category Sections ────────────────────────────────────────────────────────
const SHOWCASE_CATEGORIES = [
  { key: 'Image Editing', icon: Image, label: 'Image Tools', link: '/image-tools' },
  { key: 'PDF Organization', icon: FileText, label: 'PDF Tools', link: '/pdf-tools' },
  { key: 'PDF Intelligence', icon: Sparkles, label: 'AI Tools', link: '/ai-tools' },
];

function CategoryShowcase() {
  return (
    <Section id="categories">
      <SectionHeader
        eyebrow="Categories"
        title="Tools for every workflow"
        subtitle="Organized by what you need to get done."
      />
      <div className="space-y-16">
        {SHOWCASE_CATEGORIES.map(({ key, icon: Icon, label, link }) => {
          const tools = (TOOLS_BY_CATEGORY[key] || []).slice(0, 4);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-lime-glow)', border: '1px solid rgba(163,230,53,0.2)' }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: 'var(--accent-lime)' }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>{label}</h3>
                </div>
                <Link to={link} className="btn-ghost text-sm hidden sm:flex">
                  See all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid-tools">
                {tools.map((tool, i) => (
                  <motion.div key={tool.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 sm:hidden">
                <Link to={link} className="btn-ghost text-sm">See all {label} <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: Upload, num: '01', title: 'Upload your file', desc: 'Drop or select any image or PDF. We accept all major formats up to 100MB.' },
    { icon: Cpu, num: '02', title: 'Choose & configure', desc: 'Pick your tool, adjust settings. Our smart defaults get it right the first time.' },
    { icon: Download, num: '03', title: 'Download result', desc: 'Processed files are ready in seconds. Download or share — files auto-delete in 24h.' },
  ];
  return (
    <section id="how-it-works" className="py-20" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader eyebrow="Simple Process" title="Three steps to done" subtitle="No account required for most tools. Just upload and go." />
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div key={step.num} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px" style={{ background: 'linear-gradient(90deg, var(--border-medium), transparent)' }} />
              )}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', position: 'relative' }}
              >
                <step.icon className="w-7 h-7" style={{ color: 'var(--accent-lime)' }} />
                <span
                  className="absolute -top-2 -right-2 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent-lime)', color: '#000' }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why PixelForge ───────────────────────────────────────────────────────────
function WhySection() {
  const features = [
    { icon: Shield, title: 'Privacy First', desc: 'Your files are processed in isolated environments and permanently deleted after 24 hours. We never analyze your content.' },
    { icon: Zap, title: 'Built for Speed', desc: 'Optimized processing pipelines deliver results in seconds, not minutes. No waiting in queues.' },
    { icon: Globe, title: 'Works Everywhere', desc: 'A browser is all you need. No installation, no plugins, no OS restrictions. Desktop, tablet, mobile.' },
    { icon: Star, title: 'Professional Quality', desc: 'Enterprise-grade algorithms produce the same output quality you get from expensive desktop software.' },
  ];
  return (
    <Section id="why-pixelforge">
      <SectionHeader eyebrow="Why PixelForge" title="Built for people who care about quality" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
            className="card-depth p-6"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-lime-glow)', border: '1px solid rgba(163,230,53,0.2)' }}>
              <f.icon className="w-5 h-5" style={{ color: 'var(--accent-lime)' }} />
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Pricing CTA ──────────────────────────────────────────────────────────────
function PricingCTA() {
  const free = ['Up to 20MB per file', '5 conversions per hour', 'All core tools', 'No sign-up needed'];
  const pro = ['Up to 500MB per file', 'Unlimited conversions', 'Priority processing', 'Batch operations', 'API access', 'Extended file history'];
  return (
    <section id="pricing-preview" className="py-20" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <SectionHeader eyebrow="Pricing" title="Free to start. Pro when you need more." />
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="card-depth p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>$0 <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/forever</span></p>
            </div>
            <ul className="space-y-3 mb-8">
              {free.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-lime)' }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-secondary w-full justify-center">Get started free</Link>
          </div>
          {/* Pro */}
          <div
            className="card-depth p-8 relative overflow-hidden"
            style={{ borderColor: 'rgba(163,230,53,0.3)', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(163,230,53,0.04) 100%)' }}
          >
            <span className="absolute top-4 right-4 badge-available">Most Popular</span>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>$9 <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/month</span></p>
            </div>
            <ul className="space-y-3 mb-8">
              {pro.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-lime)' }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/pricing" className="btn-primary w-full justify-center">View Pro plans</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Are my files safe?', a: 'Yes. Files are processed in isolated sessions, never shared, and permanently deleted within 24 hours. We process files in memory where possible.' },
  { q: 'Do I need to create an account?', a: 'No. Most tools work without an account. An account unlocks higher limits, batch processing, and file history.' },
  { q: 'What file formats are supported?', a: 'We support all major image formats (JPG, PNG, WebP, GIF, BMP, TIFF, AVIF) and document formats (PDF, DOCX, XLSX, PPTX).' },
  { q: 'Is there an API?', a: 'A REST API is available for Pro and Enterprise accounts, letting you integrate PixelForge tools into your own applications.' },
  { q: 'What are the file size limits?', a: 'Free accounts can process files up to 20MB. Pro accounts support up to 500MB per file and batch uploads.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <Section id="faq">
      <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
      <div className="max-w-2xl mx-auto space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="card-depth overflow-hidden">
            <button
              id={`faq-btn-${i}`}
              className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {faq.q}
              <ChevronDown className="w-4 h-4 shrink-0 transition-transform" style={{ color: 'var(--text-muted)', transform: open === i ? 'rotate(180deg)' : 'none' }} />
            </button>
            {open === i && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-4 text-sm" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}
              >
                <p className="pt-4">{faq.a}</p>
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
      <div className="max-w-3xl mx-auto text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="section-heading mb-4">Ready to forge something great?</h2>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of creators, developers, and teams using PixelForge every day.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/tools" className="btn-primary px-8 py-3 text-base">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="btn-secondary px-8 py-3 text-base">See pricing</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <PopularToolsSection />
      <HowItWorks />
      <CategoryShowcase />
      <WhySection />
      <PricingCTA />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
