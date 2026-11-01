import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, RefreshCw, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back to PixelForge!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Sign in failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div
        className="rounded-2xl p-7 sm:p-9 shadow-xl relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: isLight
            ? '0 16px 40px rgba(50, 20, 61, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            : '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="mb-7">
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome Back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Enter your credentials to access your spatial workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="signin-email"
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                className="input-field pl-10"
                placeholder="developer@pixelforge.io"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: isLight ? '#ef4444' : '#FF2D75' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="signin-password"
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="input-field pl-10 pr-11"
                placeholder="••••••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: isLight ? '#ef4444' : '#FF2D75' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In to Workspace
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t text-center text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <Link
            to="/signup"
            className="font-bold transition-colors underline"
            style={{ color: isLight ? '#32143D' : '#00A6D6' }}
          >
            Create an Account
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
