import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import AllToolsPage from './pages/AllToolsPage';
import ImageToolsPage from './pages/ImageToolsPage';
import PdfToolsPage from './pages/PdfToolsPage';
import AiToolsPage from './pages/AiToolsPage';
import ToolWorkspacePage from './pages/ToolWorkspacePage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

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
  );
}
