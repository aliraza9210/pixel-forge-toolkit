import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleSubmit(e) {
    e.preventDefault();
    // Phase 2: wire to backend email service
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--accent-lime-glow)', border: '1px solid rgba(163,230,53,0.3)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--accent-lime)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3">Message sent!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>We'll get back to you within 1–2 business days.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ background: 'var(--accent-lime-glow)', color: 'var(--accent-lime)', border: '1px solid rgba(163,230,53,0.25)' }}>
            Contact
          </span>
          <h1 className="section-heading mb-3">Get in touch</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Have a question, idea, or partnership inquiry? We read every message.</p>
        </motion.div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: Mail, title: 'Email us', desc: 'hello@pixelforge.io', sub: 'We reply within 24h' },
            { icon: MessageSquare, title: 'General support', desc: 'support@pixelforge.io', sub: 'Mon–Fri, 9am–6pm UTC' },
          ].map((c) => (
            <div key={c.title} className="card-depth p-5 flex gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-lime-glow)', border: '1px solid rgba(163,230,53,0.2)' }}>
                <c.icon className="w-4 h-4" style={{ color: 'var(--accent-lime)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{c.title}</h3>
                <p className="text-sm" style={{ color: 'var(--accent-lime)' }}>{c.desc}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-depth p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Name</label>
              <input id="contact-name" type="text" required className="input-field" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input id="contact-email" type="email" required className="input-field" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
            <input id="contact-subject" type="text" required className="input-field" value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
            <textarea id="contact-message" required rows={5} className="input-field resize-none" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." />
          </div>
          <button type="submit" id="contact-submit" className="btn-primary w-full justify-center">
            Send message <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
