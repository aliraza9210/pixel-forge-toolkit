import { motion } from 'framer-motion';
import { Sparkles, Brain, ScanText, Scissors } from 'lucide-react';
import ToolGrid from '../components/ToolGrid';
import { TOOLS } from '../data/toolsRegistry';

const AI_TOOLS = TOOLS.filter((t) => t.processingType === 'ai');

const AI_FEATURES = [
  { icon: Brain, title: 'AI Summarization', desc: 'Instantly distill long PDFs into concise summaries using language models.' },
  { icon: ScanText, title: 'OCR Recognition', desc: 'Extract machine-readable text from scanned documents and images.' },
  { icon: Scissors, title: 'Background Removal', desc: 'AI-powered subject isolation — no manual masking required.' },
];

export default function AiToolsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#a78bfa' }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>AI-Powered</span>
          </div>
          <h1 className="section-heading mb-3">AI-Powered Tools</h1>
          <p className="text-base max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Intelligent tools that go beyond simple processing — AI that understands your content.
          </p>
        </motion.div>

        {/* AI feature highlight */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {AI_FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card-depth p-6"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <f.icon className="w-4.5 h-4.5" style={{ color: '#a78bfa' }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm">{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Available AI Tools</h2>
        <ToolGrid tools={AI_TOOLS} />
      </div>
    </div>
  );
}
