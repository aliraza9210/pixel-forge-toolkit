import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loaded pages for optimal bundle splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AllToolsPage = lazy(() => import('./pages/AllToolsPage'));
const ImageToolsPage = lazy(() => import('./pages/ImageToolsPage'));
const PdfToolsPage = lazy(() => import('./pages/PdfToolsPage'));
const AiToolsPage = lazy(() => import('./pages/AiToolsPage'));
const ToolWorkspacePage = lazy(() => import('./pages/ToolWorkspacePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent-lime)', borderTopColor: 'transparent' }}
        />
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      useAuthStore.getState().setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [checkAuth]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth Layout (no navbar/footer) */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Main Layout */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/tools" element={<AllToolsPage />} />
          <Route path="/image-tools" element={<ImageToolsPage />} />
          <Route path="/pdf-tools" element={<PdfToolsPage />} />
          <Route path="/ai-tools" element={<AiToolsPage />} />
          <Route path="/tools/:toolId" element={<ToolWorkspacePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
