import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Zap, Clock, Star, ArrowRight, TrendingUp,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { POPULAR_TOOLS } from '../data/toolsRegistry';
import ToolCard from '../components/ToolCard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const stats = [
    { icon: Zap, label: 'Tools used', value: '—', note: 'Lifetime' },
    { icon: Clock, label: 'Last active', value: 'Just now', note: '' },
    { icon: Star, label: 'Account plan', value: user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free', note: 'Current' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-5 h-5" style={{ color: 'var(--accent-lime)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Dashboard</span>
          </div>
          <h1 className="section-heading">Welcome back, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Here's your workspace at a glance.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-depth p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-lime-glow)', border: '1px solid rgba(163,230,53,0.2)' }}>
                  <stat.icon className="w-4.5 h-4.5" style={{ color: 'var(--accent-lime)' }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>{stat.value}</p>
              {stat.note && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.note}</p>}
            </motion.div>
          ))}
        </div>

        {/* Account info */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="card-depth p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-lime)' }} />
              Account Details
            </h2>
            <dl className="space-y-3">
              {[
                { label: 'Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Plan', value: user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free' },
                { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt style={{ color: 'var(--text-muted)' }}>{label}</dt>
                  <dd className="font-medium truncate max-w-[200px]">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            <Link to="/settings" className="btn-secondary w-full justify-center mt-5 text-sm">
              Edit profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card-depth p-6">
            <h2 className="font-semibold mb-4">Plan & Limits</h2>
            <div className="space-y-4">
              {[
                { label: 'File size limit', free: '20 MB', current: '20 MB' },
                { label: 'Conversions / hour', free: '5', current: '5' },
                { label: 'File retention', free: '24 hours', current: '24 hours' },
                { label: 'Batch processing', free: '✗', current: '✗' },
              ].map(({ label, current }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="font-medium px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{current}</span>
                </div>
              ))}
            </div>
            <Link to="/pricing" className="btn-primary w-full justify-center mt-5 text-sm">
              Upgrade to Pro <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Popular tools */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Popular tools</h2>
            <Link to="/tools" className="btn-ghost text-sm">All tools <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_TOOLS.slice(0, 8).map((tool) => <ToolCard key={tool.id} tool={tool} compact />)}
          </div>
        </div>
      </div>
    </div>
  );
}
