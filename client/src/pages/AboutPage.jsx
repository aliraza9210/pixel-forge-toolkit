import { motion } from 'framer-motion';
import { Layers, Target, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../data/toolsRegistry';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: 'var(--accent-lime-glow)', color: 'var(--accent-lime)', border: '1px solid rgba(163,230,53,0.25)' }}>
            About
          </span>
          <h1 className="section-heading mb-6">Built for creators who move fast</h1>
          <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            PixelForge started from a simple frustration: the best image and PDF tools were
            scattered across dozens of websites, each with different UIs, different limits, and
            different privacy practices. We set out to build the workspace we always wanted.
          </p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Today, PixelForge brings together {TOOLS.length}+ tools — from basic image resizing
            to AI-powered document understanding — in a single, consistent, privacy-first workspace.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { num: `${TOOLS.length}+`, label: 'Tools available' },
            { num: '24h', label: 'Max file retention' },
            { num: '100%', label: 'Browser-based, no install' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card-depth p-6 text-center"
            >
              <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--accent-lime)' }}>{stat.num}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <h2 className="text-2xl font-bold mb-8">Our values</h2>
        <div className="space-y-5 mb-16">
          {[
            { icon: Target, title: 'Privacy by design', desc: 'We never analyze your file contents. Files are processed in isolated environments and deleted within 24 hours.' },
            { icon: Zap, title: 'Speed above all', desc: 'Every tool is engineered to deliver results in seconds. We measure performance constantly and optimize ruthlessly.' },
            { icon: Users, title: 'Accessible to everyone', desc: 'Core tools are free, work without an account, and require no installation. We believe great tools should be within reach of every creator.' },
            { icon: Layers, title: 'One workspace', desc: 'We believe file tools work best together. PixelForge is designed as an integrated workspace, not a collection of unrelated utilities.' },
          ].map((v) => (
            <div key={v.title} className="card-depth p-6 flex gap-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-lime-glow)', border: '1px solid rgba(163,230,53,0.2)' }}>
                <v.icon className="w-5 h-5" style={{ color: 'var(--accent-lime)' }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center p-10 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-xl font-bold mb-3">Get in touch</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Questions, feedback, or partnership inquiries — we'd love to hear from you.</p>
          <Link to="/contact" className="btn-primary">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
