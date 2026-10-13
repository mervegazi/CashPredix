import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  Sun,
  Moon,
  ChevronLeft
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { signIn, signInDemo, resetPassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      toast.success('Successfully logged in! Welcome back.');
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Failed to sign in. Please check your credentials.';
      toast.error(msg);
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInDemo();
      toast.success('Signed in with Demo Executive account!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Demo login error:', err);
      // Fallback: If demo creation failed on network/supabase, provide feedback
      toast.error(err.message || 'Could not connect with demo user. You can register a new account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter your email above to receive a password reset link');
      setErrors((prev) => ({ ...prev, email: 'Enter your email here to reset password' }));
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(email);
      toast.success('Password reset link sent to your email inbox!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-950 text-gray-100 dark:bg-gray-950 dark:text-gray-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-gradient-to-tr from-blue-600/20 to-emerald-500/20 rounded-full blur-3xl opacity-70 animate-float" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-2xl animate-float-delayed" />
      </div>

      {/* Top Navigation Bar Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10 px-2 sm:px-6">
        <Link
          to="/"
          id="back-to-home-link"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Link>

        <button
          onClick={toggleTheme}
          id="login-theme-toggle"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          className="p-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-all shadow-sm"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              CashPredix
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            AI-driven cash flow predictions and vendor behavioral risk scoring
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 shadow-2xl rounded-2xl p-6 sm:p-8">
          {errors.form && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-start gap-2">
              <span className="font-semibold">Error:</span> {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="name@company.com"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-gray-950/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.email ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-gray-800 hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-password-button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  {isResetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••••••"
                  className={`block w-full pl-10 pr-10 py-2.5 bg-gray-950/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.password ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-gray-800 hover:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-login-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium" id="password-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-blue-600 focus:ring-blue-500/40 focus:ring-offset-gray-900"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-3 text-gray-400 font-medium">Or explore instantly</span>
            </div>
          </div>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            id="demo-login-button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Instant Demo Executive Access</span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have a CashPredix account?{' '}
            <Link 
              to="/signup" 
              id="goto-signup-link" 
              className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
