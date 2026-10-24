import { Outlet, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(163,230,53,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 mb-8 group"
        aria-label="PixelForge home"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #a3e635, #65a30d)' }}
        >
          <Layers className="w-5 h-5 text-black" />
        </div>
        <span
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          PixelForge
        </span>
      </Link>

      <div className="w-full max-w-md">
        <Outlet />
      </div>

      <p className="mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} PixelForge. All rights reserved.
      </p>
    </div>
  );
}
