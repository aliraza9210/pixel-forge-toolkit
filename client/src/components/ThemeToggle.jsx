import { motion } from 'framer-motion';
import useThemeStore from '../store/themeStore';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {isLight ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
        onClick={toggleTheme}
        className="relative inline-flex items-center cursor-pointer select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400"
        style={{
          width: '58px',
          height: '30px',
          borderRadius: '9999px',
          padding: '3px',
          background: isLight
            ? 'linear-gradient(90deg, #34d399 0%, #38bdf8 52%, #3b82f6 100%)'
            : 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: isLight
            ? '0 0 16px rgba(56, 189, 248, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.45)'
            : '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
          border: isLight
            ? '1px solid rgba(255, 255, 255, 0.35)'
            : '1px solid rgba(255, 255, 255, 0.14)',
        }}
      >
        {/* Clean sliding pure white thumb matching the user's reference screenshot */}
        <motion.div
          animate={{ x: isLight ? 28 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 34,
          }}
          className="rounded-full bg-white"
          style={{
            width: '24px',
            height: '24px',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.12)',
          }}
        />
      </button>
    </div>
  );
}
