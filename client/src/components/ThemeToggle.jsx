import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
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
        className="relative inline-flex items-center justify-between cursor-pointer select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          width: '64px',
          height: '32px',
          borderRadius: '9999px',
          padding: '4px',
          background: isLight
            ? 'linear-gradient(135deg, #F4F6F8 0%, #E8EEF2 100%)'
            : 'linear-gradient(135deg, #111318 0%, #191D25 100%)',
          boxShadow: isLight
            ? '0 2px 10px rgba(50, 20, 61, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
            : '0 2px 12px rgba(0, 166, 214, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.08)',
          border: isLight
            ? '1px solid #D8DDE3'
            : '1px solid #292D36',
        }}
      >
        {/* Subtle background icons inside track */}
        <div className="absolute inset-0 px-2 flex items-center justify-between pointer-events-none">
          <Moon
            className="w-3.5 h-3.5 transition-opacity duration-200"
            style={{
              color: isLight ? '#77727E' : '#00A6D6',
              opacity: isLight ? 0.35 : 0.9,
            }}
          />
          <Sun
            className="w-3.5 h-3.5 transition-opacity duration-200"
            style={{
              color: isLight ? '#F4B942' : '#A1A1AA',
              opacity: isLight ? 0.95 : 0.35,
            }}
          />
        </div>

        {/* Sliding 3D spatial thumb */}
        <motion.div
          animate={{ x: isLight ? 32 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 550,
            damping: 32,
          }}
          className="relative z-10 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{
            width: '24px',
            height: '24px',
            background: isLight
              ? 'linear-gradient(135deg, #FFFFFF 0%, #F4B942 120%)'
              : 'linear-gradient(135deg, #00A6D6 0%, #007BA7 100%)',
            boxShadow: isLight
              ? '0 3px 8px rgba(50, 20, 61, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
              : '0 3px 10px rgba(0, 166, 214, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          }}
        >
          {isLight ? (
            <div className="w-2 h-2 rounded-full bg-[#32143D]" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#FF2D75]" />
          )}
        </motion.div>
      </button>
    </div>
  );
}
