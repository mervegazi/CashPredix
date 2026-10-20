import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, formatAuthError } from '../../contexts/AuthContext';
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

  const { signIn, signInDemo, signInAsAuthorized, resetPassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      toast.success('Successfully signed in! Welcome back.');
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const friendlyMsg = formatAuthError(err);
      toast.error(friendlyMsg);
      setErrors((prev) => ({ ...prev, form: friendlyMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInDemo();
      toast.success('Signed in with Demo Executive account (Synthetic View)!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Demo login error:', err);
      const friendlyMsg = formatAuthError(err);
      toast.error(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorizedLogin = (targetEmail) => {
    setIsSubmitting(true);
    try {
      const res = signInAsAuthorized(targetEmail);
      toast.success(`Signed in as ${res.user.user_metadata.full_name}! Full Enterprise Portfolio Unlocked.`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(`Sign in notice: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter your email address in the field above to receive a reset link.');
      setErrors((prev) => ({ ...prev, email: 'Enter your email here to receive a password reset link.' }));
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(email);
      toast.success('Password reset link sent to your email address!');
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      toast.error(friendlyMsg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-gradient-to-tr from-blue-400/20 to-emerald-400/20 dark:from-blue-600/20 dark:to-emerald-500/20 rounded-full blur-3xl opacity-70 animate-float" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-2xl animate-float-delayed" />
      </div>

      {/* Top Navigation Bar Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10 px-2 sm:px-6">
        <Link
          to="/"
          id="back-to-home-link"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/60 py-2 px-3 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-gray-700/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={toggleTheme}
          id="login-theme-toggle"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-gray-900/80 dark:hover:bg-gray-800 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white border border-slate-200 dark:border-gray-800 transition-all shadow-sm"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400">
              CashPredix
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            AI-driven incoming cashflow forecasting and customer credit risk scoring
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-slate-200 dark:border-gray-800/80 shadow-xl dark:shadow-2xl rounded-2xl p-6 sm:p-8 transition-colors">
          {errors.form && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-500/40 dark:text-red-300 text-sm flex items-start gap-2">
              <span className="font-semibold">Notice:</span> {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
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
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.email ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-slate-300 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-password-button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  {isResetting ? 'Sending link...' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
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
                  className={`block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-gray-950/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.password ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-slate-300 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-login-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="password-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300 cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-white dark:bg-gray-950 border-slate-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500/40"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md shadow-blue-600/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
              <div className="w-full border-t border-slate-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-3 text-slate-500 dark:text-gray-400 font-medium">Or explore instantly</span>
            </div>
          </div>

          {/* Quick Instant Portfolios Section */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
                Authorized Enterprise Portfolios:
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2.5">
                Direct access to 4 canonical companies with 280 corporate accounts including <strong>JPMorgan Chase</strong> and <strong>Bank of America</strong>.
              </p>
              
              <div className="space-y-2">
                <button
                  type="button"
                  id="merve-login-button"
                  onClick={() => handleAuthorizedLogin('gaziimervee@gmail.com')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between py-2 px-3.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-sm shadow-blue-600/30 active:scale-[0.99] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>Sign in as Merve (gaziimervee@gmail.com)</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    JPMorgan & BofA
                  </span>
                </button>

                <button
                  type="button"
                  id="sarah-login-button"
                  onClick={() => handleAuthorizedLogin('sarah.zelikovitz@csi.cuny.edu')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between py-2 px-3.5 rounded-lg text-xs font-semibold text-blue-900 dark:text-blue-200 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Sign in as Prof. Sarah Zelikovitz</span>
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    Reviewer
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              id="demo-login-button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-gray-800/80 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 transition-all"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Quick Demo Executive Sign In (Synthetic Anonymized)</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-gray-400">
            Don't have a CashPredix account?{' '}
            <Link 
              to="/signup" 
              id="goto-signup-link" 
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
