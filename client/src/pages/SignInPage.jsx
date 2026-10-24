import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Sign in failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div
        className="rounded-2xl p-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your PixelForge account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="signin-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              className="input-field"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="signin-password" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <Link to="/forgot-password" className="text-xs" style={{ color: 'var(--accent-lime)' }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="input-field pr-10"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                }
              </button>
            </div>
            {errors.password && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.password.message}</p>}
          </div>

          <button
            id="signin-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? 'Signing in…' : <><LogIn className="w-4 h-4" /> Sign in</>}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium" style={{ color: 'var(--accent-lime)' }}>
            Create one free
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
