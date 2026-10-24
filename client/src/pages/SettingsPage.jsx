import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Save, LogOut, Palette } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // Phase 2: call userApi.updateProfile({ name })
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Settings saved');
  }

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    navigate('/');
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5" style={{ color: 'var(--accent-lime)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Settings</span>
          </div>
          <h1 className="section-heading">Account Settings</h1>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  id={`settings-tab-${tab.id}`}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
                  style={{
                    background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: activeTab === tab.id ? '1px solid var(--border-medium)' : '1px solid transparent',
                  }}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all mt-4"
                style={{ color: '#ef4444' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="md:col-span-3 card-depth p-8">
            {activeTab === 'profile' && (
              <div>
                <h2 className="font-semibold text-lg mb-6">Profile Information</h2>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="settings-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full name</label>
                    <input id="settings-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="settings-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <input id="settings-email" type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email changes require verification. Contact support.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account plan</label>
                    <div className="flex items-center gap-3">
                      <span className="badge-available capitalize">{user?.plan || 'free'}</span>
                      <a href="/pricing" className="text-xs underline" style={{ color: 'var(--accent-lime)' }}>Upgrade</a>
                    </div>
                  </div>
                  <button onClick={handleSave} disabled={saving} id="settings-save" className="btn-primary">
                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="font-semibold text-lg mb-6">Interface & Theme</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <p className="text-sm font-semibold">Theme Mode</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        Toggle between Light and Dark interface styles.
                      </p>
                    </div>
                    <ThemeToggle showLabel={true} />
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-sm font-semibold mb-2">Display Preview</p>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                      PixelForge adapts with curated contrast palettes, glassmorphic cards, and soft ambient glows in both dark and light modes.
                    </p>
                    <div className="p-4 rounded-lg flex items-center justify-between" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Active Theme Accent</span>
                      <span className="badge-available">Live Adaptation</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="font-semibold text-lg mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { id: 'notif-processing', label: 'Processing complete', desc: 'Get notified when your file finishes processing.' },
                    { id: 'notif-email', label: 'Email updates', desc: 'Receive product updates and feature announcements.' },
                    { id: 'notif-marketing', label: 'Marketing emails', desc: 'Promotional offers and newsletters.' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                      <input id={item.id} type="checkbox" defaultChecked={item.id !== 'notif-marketing'} className="mt-0.5 w-4 h-4 accent-lime-400" />
                    </div>
                  ))}
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary mt-6">
                  <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save preferences'}
                </button>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h2 className="font-semibold text-lg mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  {[
                    { id: 'privacy-autodelete', label: 'Auto-delete files', desc: 'Automatically delete processed files within 24 hours.', default: true },
                    { id: 'privacy-analytics', label: 'Usage analytics', desc: 'Allow anonymous usage data to help improve PixelForge.', default: true },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                      <input id={item.id} type="checkbox" defaultChecked={item.default} className="mt-0.5 w-4 h-4 accent-lime-400" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-5 rounded-xl" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <h3 className="font-medium text-sm mb-1" style={{ color: '#ef4444' }}>Danger Zone</h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Permanently delete your account and all associated data. This cannot be undone.</p>
                  <button className="text-xs px-4 py-2 rounded-lg border font-medium" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }}>
                    Delete my account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
