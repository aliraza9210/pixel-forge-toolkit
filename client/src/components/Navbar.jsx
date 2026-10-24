import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Menu, X, Image, FileText, Sparkles,
  Tag, User, LogOut, Settings, LayoutDashboard, ChevronDown,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { label: 'Image Tools', to: '/image-tools', icon: Image },
  { label: 'PDF Tools', to: '/pdf-tools', icon: FileText },
  { label: 'AI Tools', to: '/ai-tools', icon: Sparkles },
  { label: 'Pricing', to: '/pricing', icon: Tag },
];

function NavItem({ link }) {
  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        `btn-ghost text-sm ${isActive ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]' : ''}`
      }
    >
      {link.label}
    </NavLink>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id="user-menu-btn"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#a3e635,#65a30d)', color: '#000' }}
        >
          {user.name[0].toUpperCase()}
        </div>
        <span className="max-w-[100px] truncate hidden sm:block">{user.name}</span>
        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 z-50 rounded-xl overflow-hidden"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-lg)',
              }}
              role="menu"
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
              {[
                { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                { icon: Settings, label: 'Settings', to: '/settings' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                  role="menuitem"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => { setOpen(false); onLogout(); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors"
                  style={{ color: '#ef4444' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Sign out failed');
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="PixelForge home"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a3e635, #65a30d)' }}
          >
            <Layers className="w-4.5 h-4.5 text-black" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            PixelForge
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} link={link} />
          ))}
        </div>

        {/* Desktop auth & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/signin" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            id="mobile-menu-btn"
            className="btn-ghost p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="md:hidden px-4 pb-4"
            style={{
              background: 'var(--nav-bg)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex flex-col gap-1 pt-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {isAuthenticated && user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm justify-center">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="btn-ghost text-sm justify-center">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm justify-center">Sign In</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm justify-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
