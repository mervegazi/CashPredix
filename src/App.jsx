import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';

// Dashboard Layout & Sub-pages
import DashboardLayout from './layouts/DashboardLayout';
import WelcomeDashboard from './pages/dashboard/WelcomeDashboard';
import CompanyVendorPlaceholder from './pages/dashboard/CompanyVendorPlaceholder';
import CashflowPredictsPlaceholder from './pages/dashboard/CashflowPredictsPlaceholder';
import ProfilePage from './pages/dashboard/ProfilePage';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

function ThemedToaster() {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: isDark
          ? {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(51, 65, 85, 0.7)',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            }
          : {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
            },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: isDark ? '#0f172a' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: isDark ? '#0f172a' : '#ffffff',
          },
        },
      }}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedToaster />
        <BrowserRouter basename="/CashPredix">
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public-only Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignUpPage />
                </PublicOnlyRoute>
              }
            />

            {/* Change Password / Reset Password routes */}
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/reset-password" element={<ChangePasswordPage />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<WelcomeDashboard />} />
              <Route path="company-vendor" element={<CompanyVendorPlaceholder />} />
              <Route path="cashflow-predicts" element={<CashflowPredictsPlaceholder />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
