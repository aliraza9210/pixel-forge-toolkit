import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import ToolGrid from '../components/ToolGrid';
import { TOOLS, CATEGORIES, TOOLS_BY_CATEGORY, searchTools } from '../data/toolsRegistry';

const SUGGESTIONS = ['compress', 'convert', 'pdf', 'resize', 'background'];

const categoryCounts = CATEGORIES.reduce((acc, cat) => {
  acc[cat] = (TOOLS_BY_CATEGORY[cat] || []).length;
  return acc;
}, {});

export default function AllToolsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    let list = query.length > 1 ? searchTools(query) : TOOLS;
    if (activeCategory !== 'All') {
      list = list.filter((t) => t.category === activeCategory);
    }
    return list;
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ background: 'var(--accent-lime-glow)', color: 'var(--accent-lime)', border: '1px solid rgba(163,230,53,0.25)' }}
          >
            Tool Directory
          </span>
          <h1 className="section-heading mb-3">All Tools</h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            {TOOLS.length} tools for images, PDFs, and more — all in one place.
          </p>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search tools by name or format..."
            suggestions={SUGGESTIONS}
          />
        </div>

        {/* Category tabs */}
        <div className="mb-8">
          <CategoryTabs
            categories={CATEGORIES}
            active={activeCategory}
            onChange={(cat) => { setActiveCategory(cat); setQuery(''); }}
            counts={categoryCounts}
          />
        </div>

        {/* Results count */}
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          {query ? ` matching "${query}"` : ''}
        </p>

        {/* Grid */}
        <ToolGrid tools={filtered} />
      </div>
    </div>
  );
}
