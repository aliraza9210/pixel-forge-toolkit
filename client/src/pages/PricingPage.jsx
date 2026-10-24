import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Zap, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', period: '/forever',
    description: 'Perfect for occasional use.',
    cta: 'Get started', ctaLink: '/signup', ctaStyle: 'btn-secondary',
    features: [
      'All core image & PDF tools',
      'Up to 20MB per file',
      '5 conversions per hour',
      '24-hour file retention',
      'No registration required',
    ],
    notIncluded: ['Batch processing', 'API access', 'Priority processing'],
  },
  {
    id: 'pro', name: 'Pro', price: '$9', period: '/month',
    description: 'For power users and creators.',
    cta: 'Start Pro trial', ctaLink: '/signup?plan=pro', ctaStyle: 'btn-primary',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Up to 500MB per file',
      'Unlimited conversions',
      'Priority processing queue',
      'Batch operations',
      '7-day file history',
      'API access (1K calls/mo)',
      'Email support',
    ],
    notIncluded: ['Custom branding', 'Dedicated infrastructure'],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '',
    description: 'For teams and organizations.',
    cta: 'Contact sales', ctaLink: '/contact', ctaStyle: 'btn-secondary',
    features: [
      'Everything in Pro',
      'Unlimited file size',
      'Unlimited API calls',
      'Custom branding & white-label',
      'Dedicated processing servers',
      'SLA guarantee',
      'SSO & team management',
      'Priority phone support',
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ background: 'var(--accent-lime-glow)', color: 'var(--accent-lime)', border: '1px solid rgba(163,230,53,0.25)' }}>
            Pricing
          </span>
          <h1 className="section-heading mb-4">Simple, transparent pricing</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Start free. Upgrade only when you need more power. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card-depth p-8 relative"
              style={plan.badge ? { borderColor: 'rgba(163,230,53,0.35)', background: 'linear-gradient(160deg, var(--bg-card) 0%, rgba(163,230,53,0.035) 100%)' } : {}}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-available text-xs px-3 py-1">{plan.badge}</span>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>{plan.price}</span>
                  {plan.period && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
              </div>

              <Link to={plan.ctaLink} className={`${plan.ctaStyle} w-full justify-center mb-8`}>
                {plan.cta} {plan.ctaStyle === 'btn-primary' && <ArrowRight className="w-4 h-4" />}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-lime)' }} />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-4 h-4 mt-0.5 shrink-0 text-center">—</span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="mt-16 text-center p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <Zap className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--accent-lime)' }} />
          <h3 className="font-bold text-lg mb-2">All plans include core tools</h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Every user — free or paid — gets full access to all image and PDF tools.
            Pro unlocks higher limits and batch capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
