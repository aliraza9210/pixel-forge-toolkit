import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, RefreshCw, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/\d/, 'Must contain at least one number'),
  agree: z.boolean().refine((v) => v, 'You must accept the terms of service'),
});

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const register_user = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { agree: false },
  });

  const password = watch('password', '');
  const strength =
    password.length === 0
      ? 0
      : password.length < 8
      ? 1
      : /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 12
      ? 3
      : 2;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = isLight
    ? ['', '#ef4444', '#f59e0b', '#32143D']
    : ['', '#ef4444', '#f59e0b', '#00A6D6'];

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
            Create Your Account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Join PixelForge for high-throughput batch operations and storage.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="signup-name"
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Full Name
            </label>
            <div className="relative">
              <User
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                className="input-field pl-10"
                placeholder="Alex Morgan"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs mt-1 font-medium" style={{ color: isLight ? '#ef4444' : '#FF2D75' }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="signup-email"
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
                id="signup-email"
                type="email"
                autoComplete="email"
                className="input-field pl-10"
                placeholder="alex@example.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1 font-medium" style={{ color: isLight ? '#ef4444' : '#FF2D75' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="input-field pl-10 pr-11"
                placeholder="Min 8 characters with numbers"
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
            {/* Strength meter */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1.5 mb-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: strength >= s ? strengthColor[strength] : 'var(--bg-secondary)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-semibold" style={{ color: strengthColor[strength] }}>
                  Strength: {strengthLabel[strength]}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-xs mt-1 font-medium" style={{ color: isLight ? '#ef4444' : '#FF2D75' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                className="mt-0.5 rounded cursor-pointer accent-[var(--accent-electric)]"
                {...register('agree')}
              />
              <span style={{ color: 'var(--text-muted)' }}>
                I agree to the{' '}
                <Link to="/terms" className="underline font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agree && (
              <p className="text-xs mt-1 font-medium" style={{ color: isLight ? '#ef4444' : '#FF2D75' }}>
                {errors.agree.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create PixelForge Account
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-7 pt-5 border-t text-center text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link
            to="/signin"
            className="font-bold transition-colors underline"
            style={{ color: isLight ? '#32143D' : '#00A6D6' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
