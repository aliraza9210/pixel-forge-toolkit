import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Giant 404 */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[8rem] font-black leading-none"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: 'var(--bg-elevated)',
              letterSpacing: '-0.05em',
              userSelect: 'none',
            }}
          >
            404
          </span>
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <Search className="w-14 h-14" style={{ color: 'var(--accent-lime)', opacity: 0.8 }} />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to something useful.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <Link to="/tools" className="btn-secondary">
            Browse tools
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
