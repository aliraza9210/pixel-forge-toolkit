import { motion } from 'framer-motion';
import { Image } from 'lucide-react';
import ToolGrid from '../components/ToolGrid';
import CategoryTabs from '../components/CategoryTabs';
import { useState } from 'react';
import { TOOLS, IMAGE_CATEGORIES, TOOLS_BY_CATEGORY } from '../data/toolsRegistry';

const IMAGE_TOOLS = TOOLS.filter((t) => IMAGE_CATEGORIES.includes(t.category));
const counts = IMAGE_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = (TOOLS_BY_CATEGORY[cat] || []).length;
  return acc;
}, {});

export default function ImageToolsPage() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? IMAGE_TOOLS : IMAGE_TOOLS.filter((t) => t.category === active);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <Image className="w-5 h-5" style={{ color: '#3b82f6' }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>Image Tools</span>
          </div>
          <h1 className="section-heading mb-3">Image Editing & Conversion</h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            {IMAGE_TOOLS.length} tools to edit, compress, convert, and optimize your images.
          </p>
        </motion.div>
        <div className="mb-8">
          <CategoryTabs categories={IMAGE_CATEGORIES} active={active} onChange={setActive} counts={counts} />
        </div>
        <ToolGrid tools={filtered} />
      </div>
    </div>
  );
}
