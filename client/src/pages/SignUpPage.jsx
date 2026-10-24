import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/\d/, 'Must contain at least one number'),
  agree: z.boolean().refine((v) => v, 'You must accept the terms'),
});

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const register_user = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { agree: false },
  });

  const password = watch('password', '');
  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 12 ? 3 : 2;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#a3e635'];

  async function onSubmit(data) {
    setLoading(true);
    try {
      await register_user({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created! Welcome to PixelForge.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Sign up failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Free forever — no credit card required</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full name</label>
            <input id="signup-name" type="text" autoComplete="name" className="input-field" placeholder="Jane Smith"
              aria-invalid={!!errors.name} {...register('name')} />
            {errors.name && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input id="signup-email" type="email" autoComplete="email" className="input-field" placeholder="you@example.com"
              aria-invalid={!!errors.email} {...register('email')} />
            {errors.email && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                className="input-field pr-10" placeholder="Min 8 characters"
                aria-invalid={!!errors.password} {...register('password')} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="h-1 flex-1 rounded-full transition-all"
                      style={{ background: strength >= s ? strengthColor[strength] : 'var(--bg-elevated)' }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</p>
              </div>
            )}
            {errors.password && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.password.message}</p>}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3">
            <input id="signup-agree" type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-lime-400" {...register('agree')} />
            <label htmlFor="signup-agree" className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              I agree to the{' '}
              <Link to="/terms" className="underline" style={{ color: 'var(--accent-lime)' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline" style={{ color: 'var(--accent-lime)' }}>Privacy Policy</Link>
            </label>
          </div>
          {errors.agree && <p className="text-xs -mt-3" style={{ color: '#ef4444' }}>{errors.agree.message}</p>}

          <button id="signup-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Creating account…' : <><UserPlus className="w-4 h-4" /> Create account</>}
          </button>
        </form>

        {/* Benefits */}
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {['Access to all core tools', 'No credit card required', 'Files deleted within 24 hours'].map((b) => (
            <div key={b} className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-lime)' }} />
              {b}
            </div>
          ))}
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/signin" className="font-medium" style={{ color: 'var(--accent-lime)' }}>Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
}
