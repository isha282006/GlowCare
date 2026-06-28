import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout
import Layout from './components/layout/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/products/InventoryPage';
import ProductFormPage from './pages/products/ProductFormPage';
import RoutineBuilderPage from './pages/RoutineBuilderPage';
import JournalPage from './pages/JournalPage';
import GalleryPage from './pages/GalleryPage';
import WishlistPage from './pages/WishlistPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import SkinReportPage from './pages/SkinReportPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageIngredientsPage from './pages/admin/ManageIngredientsPage';
import ManageCompatibilityPage from './pages/admin/ManageCompatibilityPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xl font-bold">Loading GlowCare... ✨</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isCompleted = user?.onboardingCompleted;

  if (isCompleted) {
    if (location.pathname.startsWith('/onboarding') && location.pathname !== '/onboarding/report') {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    if (!location.pathname.startsWith('/onboarding')) {
      const lastUnfinishedPath = localStorage.getItem('glowcare_onboarding_last_path') || '/onboarding';
      return <Navigate to={lastUnfinishedPath} replace />;
    }
  }

  if (location.pathname.startsWith('/onboarding') && location.pathname !== '/onboarding/report') {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xl font-bold">Loading... ✨</span>
      </div>
    );
  }

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

               {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage step="welcome" /></ProtectedRoute>} />
              <Route path="/onboarding/camera" element={<ProtectedRoute><OnboardingPage step="camera" /></ProtectedRoute>} />
              <Route path="/onboarding/questionnaire" element={<ProtectedRoute><OnboardingPage step="questionnaire" /></ProtectedRoute>} />
              <Route path="/onboarding/report" element={<ProtectedRoute><SkinReportPage /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
              <Route path="/inventory/add" element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>} />
              <Route path="/inventory/edit/:id" element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>} />
              <Route path="/routines" element={<ProtectedRoute><RoutineBuilderPage /></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
              <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/categories" element={<AdminRoute><ManageCategoriesPage /></AdminRoute>} />
              <Route path="/admin/ingredients" element={<AdminRoute><ManageIngredientsPage /></AdminRoute>} />
              <Route path="/admin/compatibility" element={<AdminRoute><ManageCompatibilityPage /></AdminRoute>} />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
