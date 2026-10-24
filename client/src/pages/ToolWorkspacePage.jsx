import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowLeft, Clock, Zap, Shield, AlertCircle } from 'lucide-react';
import { getToolById, TOOLS } from '../data/toolsRegistry';
import ToolCard from '../components/ToolCard';
import ToolWorkspaceRunner from '../components/ToolWorkspaceRunner';

export default function ToolWorkspacePage() {
  const { toolId } = useParams();
  const tool = getToolById(toolId);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-6xl mb-4">🔧</p>
          <h1 className="text-2xl font-bold mb-3">Tool not found</h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>This tool doesn't exist or has been moved.</p>
          <Link to="/tools" className="btn-primary">Browse all tools</Link>
        </div>
      </div>
    );
  }

  const Icon = Icons[tool.icon] || Icons.Wrench;
  const isComingSoon = tool.implementationStatus === 'coming-soon';

  // Related tools — same category, exclude self
  const related = TOOLS.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow */}
      <div
        className="fixed top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${tool.color}10 0%, transparent 70%)`, filter: 'blur(60px)' }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        {/* Back */}
        <Link to="/tools" className="btn-ghost mb-8 inline-flex text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-5 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${tool.color}18`, border: `1px solid ${tool.color}30` }}
            >
              <Icon className="w-8 h-8" style={{ color: tool.color }} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{tool.name}</h1>
                {tool.processingType === 'ai' && <span className="badge-ai">AI</span>}
                {isComingSoon ? <span className="badge-coming-soon">Coming Soon</span> : <span className="badge-available">Live</span>}
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>{tool.description}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Category: <span style={{ color: 'var(--text-secondary)' }}>{tool.category}</span>
              </p>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Zap, label: `${tool.processingType === 'client' ? 'Browser-side' : 'Server-side'} processing` },
              { icon: Shield, label: 'Files auto-deleted in 24h' },
              { icon: Clock, label: 'Processes in seconds' },
            ].map(({ icon: MetaIcon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                <MetaIcon className="w-3 h-3" style={{ color: 'var(--accent-lime)' }} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Workspace Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 sm:p-8 mb-10"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            minHeight: '320px',
          }}
        >
          {isComingSoon ? (
            <div className="text-center py-8">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: `${tool.color}12`, border: `1px solid ${tool.color}25` }}
              >
                <AlertCircle className="w-9 h-9" style={{ color: tool.color }} />
              </div>
              <h2 className="text-xl font-bold mb-3">Coming Soon</h2>
              <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                <strong>{tool.name}</strong> is currently in active development. We're working hard to bring
                you a best-in-class experience. Sign up to be notified when it launches.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/signup" className="btn-primary">Notify me when live</Link>
                <Link to="/tools" className="btn-secondary">Browse available tools</Link>
              </div>
            </div>
          ) : (
            <ToolWorkspaceRunner tool={tool} />
          )}
        </motion.div>

        {/* Supported formats */}
        {(tool.inputFormats.length > 0 || tool.outputFormats.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-5 mb-12">
            {tool.inputFormats.length > 0 && (
              <div className="card-depth p-5">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>ACCEPTS</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.inputFormats.map((f) => (
                    <span key={f} className="text-xs font-mono px-2.5 py-1 rounded-md uppercase"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >{f}</span>
                  ))}
                </div>
              </div>
            )}
            {tool.outputFormats.length > 0 && (
              <div className="card-depth p-5">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>OUTPUTS</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.outputFormats.map((f) => (
                    <span key={f} className="text-xs font-mono px-2.5 py-1 rounded-md uppercase"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(163,230,53,0.2)', color: 'var(--accent-lime)' }}
                    >{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related tools */}
        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-5">Related tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((t) => <ToolCard key={t.id} tool={t} compact />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
