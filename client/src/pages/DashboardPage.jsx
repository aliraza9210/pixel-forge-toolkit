import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Image as ImageIcon,
  FileText,
  Sparkles,
  FolderOpen,
  Settings as SettingsIcon,
  LogOut,
  Zap,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Download,
  Trash2,
  File,
  Layers,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { POPULAR_TOOLS } from '../data/toolsRegistry';
import ToolCard from '../components/ToolCard';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [recentFiles, setRecentFiles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load actual recent files from session storage or localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pixelforge-recent-files');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentFiles(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('pixelforge-recent-files');
    setRecentFiles([]);
    toast.success('Recent file history cleared');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, isTab: true },
    { id: 'image-tools', label: 'Image Tools', icon: ImageIcon, route: '/image-tools' },
    { id: 'pdf-tools', label: 'PDF Tools', icon: FileText, route: '/pdf-tools' },
    { id: 'ai-tools', label: 'AI Tools', icon: Sparkles, route: '/ai-tools' },
    { id: 'my-files', label: 'My Files', icon: FolderOpen, isTab: true, badge: recentFiles.length },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, route: '/settings' },
  ];

  return (
    <div
      className="min-h-screen pt-20 pb-16 transition-colors duration-300"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-secondary text-xs flex items-center gap-2 py-2 px-3"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Workspace Navigation</span>
          </button>
          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            Plan: {user?.plan ? user.plan.toUpperCase() : 'FREE'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── SIDEBAR ─── */}
          <aside
            className={`lg:w-64 shrink-0 ${
              sidebarOpen ? 'block mb-6' : 'hidden lg:block'
            }`}
          >
            <div
              className="panel-spatial p-4 sticky top-24 space-y-6"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {/* User Profile Snippet */}
              <div className="p-3.5 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                  style={{
                    background: isLight ? '#32143D' : '#00A6D6',
                    color: '#FFFFFF',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user?.name || 'Verified User'}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {user?.email || 'user@pixelforge.io'}
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.isTab && activeTab === item.id;

                  if (item.isTab) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left"
                        style={{
                          background: isActive
                            ? (isLight ? '#32143D' : '#00A6D6')
                            : 'transparent',
                          color: isActive
                            ? '#FFFFFF'
                            : 'var(--text-secondary)',
                          boxShadow: isActive
                            ? (isLight ? '0 4px 14px rgba(50, 20, 61, 0.25)' : '0 4px 16px rgba(0, 166, 214, 0.35)')
                            : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
                            style={{
                              background: isActive
                                ? 'rgba(255, 255, 255, 0.25)'
                                : (isLight ? '#E8EEF2' : '#292D36'),
                              color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.route}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left"
                  style={{ color: isLight ? '#ef4444' : '#FF2D75' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = isLight ? '#fee2e2' : 'rgba(255, 45, 117, 0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ─── MAIN CONTENT AREA ─── */}
          <main className="flex-1 min-w-0">
            {/* Header Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{
                      background: isLight ? 'rgba(50, 20, 61, 0.08)' : 'rgba(0, 166, 214, 0.14)',
                      color: isLight ? '#32143D' : '#00A6D6',
                      border: isLight ? '1px solid rgba(50, 20, 61, 0.2)' : '1px solid rgba(0, 166, 214, 0.35)',
                    }}
                  >
                    Spatial Workspace
                  </span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      background: isLight ? 'rgba(244, 185, 66, 0.18)' : 'rgba(255, 45, 117, 0.14)',
                      color: isLight ? '#B47D06' : '#FF2D75',
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Session
                  </span>
                </div>
              </div>
              <h1 className="section-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Creator'}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Your media pipeline and security controls are active.
              </p>
            </motion.div>

            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Real Statistics Panels */}
                <div className="grid sm:grid-cols-3 gap-5">
                  {/* Card 1: Account Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="card-depth p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Account Plan
                      </span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: isLight ? 'rgba(50, 20, 61, 0.08)' : 'rgba(0, 166, 214, 0.15)',
                          color: isLight ? '#32143D' : '#00A6D6',
                        }}
                      >
                        <Zap className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold capitalize" style={{ color: 'var(--text-primary)' }}>
                      {user?.plan || 'Free Tier'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Single & Batch Operations Active
                    </p>
                  </motion.div>

                  {/* Card 2: Member Since */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-depth p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Member Since
                      </span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: isLight ? 'rgba(73, 32, 82, 0.08)' : 'rgba(255, 45, 117, 0.15)',
                          color: isLight ? '#492052' : '#FF2D75',
                        }}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Active Member'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Continuous Security Updates
                    </p>
                  </motion.div>

                  {/* Card 3: Storage & Privacy Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card-depth p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Privacy Engine
                      </span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: isLight ? 'rgba(244, 185, 66, 0.18)' : 'rgba(0, 166, 214, 0.15)',
                          color: isLight ? '#B47D06' : '#00A6D6',
                        }}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      Ephemeral
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Buffers purged every 60m
                    </p>
                  </motion.div>
                </div>

                {/* Account Details & Plan Limits */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Account Information */}
                  <div className="panel-spatial p-6">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: isLight ? '#32143D' : '#00A6D6' }} />
                      Account Profile
                    </h3>
                    <dl className="space-y-3.5">
                      {[
                        { label: 'Name', value: user?.name },
                        { label: 'Email', value: user?.email },
                        { label: 'Role', value: user?.role || 'Standard User' },
                        { label: 'Two-Factor / Rate Shield', value: 'Active (3 req/min limit on auth)' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center text-xs py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                          <dt style={{ color: 'var(--text-muted)' }}>{label}</dt>
                          <dd className="font-semibold truncate max-w-[220px]" style={{ color: 'var(--text-primary)' }}>
                            {value || '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <Link to="/settings" className="btn-secondary w-full justify-center mt-5 text-xs font-semibold">
                      Manage Profile & Security <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Production Limits */}
                  <div className="panel-spatial p-6">
                    <h3 className="font-bold text-base mb-4">Pipeline Limits & Quotas</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Single File Upload Limit', current: '35 MB' },
                        { label: 'Batch Processing Quota', current: '100 MB aggregate' },
                        { label: 'Buffer Lifecycle Retention', current: '60 Minutes (Auto-purge)' },
                        { label: 'Sharp Max Pixels Safety', current: '100 Million Pixels' },
                      ].map(({ label, current }) => (
                        <div key={label} className="flex justify-between items-center text-xs py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                          <span
                            className="font-mono font-bold px-2 py-0.5 rounded"
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                          >
                            {current}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Link to="/pricing" className="btn-primary w-full justify-center mt-5 text-xs font-semibold">
                      View Tier Options <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Popular Production Tools */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      Quick Access Tools
                    </h3>
                    <Link to="/tools" className="btn-ghost text-xs font-semibold">
                      Explore All Tools <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid-tools">
                    {POPULAR_TOOLS.slice(0, 4).map((tool) => (
                      <ToolCard key={tool.id} tool={tool} compact={false} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: My Files */}
            {activeTab === 'my-files' && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      Session Processed Files
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Real files processed in your current browser session. Files on server auto-expire in 60 minutes.
                    </p>
                  </div>
                  {recentFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="btn-ghost text-xs flex items-center gap-1.5 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear History
                    </button>
                  )}
                </div>

                {recentFiles.length === 0 ? (
                  <div className="panel-spatial p-12 text-center">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      No processed files yet
                    </h4>
                    <p className="text-xs max-w-sm mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
                      Whenever you process an image or PDF in any tool, your ready download links and file metrics will appear here.
                    </p>
                    <Link to="/tools" className="btn-primary text-xs">
                      Try a Processing Tool <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentFiles.map((file, i) => (
                      <div
                        key={i}
                        className="panel-spatial p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: isLight ? 'rgba(50, 20, 61, 0.08)' : 'rgba(0, 166, 214, 0.15)',
                              color: isLight ? '#32143D' : '#00A6D6',
                            }}
                          >
                            <File className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                              {file.filename || file.name}
                            </p>
                            <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {file.toolName ? `${file.toolName} • ` : ''}
                              {file.size || 'Processed'} • {file.time || 'Recent'}
                            </p>
                          </div>
                        </div>

                        {file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            download={file.filename}
                            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 self-start sm:self-auto"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
