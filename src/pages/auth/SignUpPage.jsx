import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatAuthError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sun, 
  Moon, 
  ChevronLeft
} from 'lucide-react';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid corporate email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'You must accept the Terms of Service and Privacy Policy.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please check the missing or invalid fields in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await signUp(email, password, fullName);
      toast.success('Registration successful! Welcome to CashPredix.');
      
      // If Supabase auto-confirms or returns active session:
      if (data?.session) {
        navigate('/dashboard', { replace: true });
      } else {
        toast.success('Verification email sent! Please check your inbox.', { duration: 5000 });
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Sign up error:', err);
      const friendlyMsg = formatAuthError(err);
      toast.error(friendlyMsg);
      setErrors((prev) => ({ ...prev, form: friendlyMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 dark:from-emerald-600/20 dark:to-blue-500/20 rounded-full blur-3xl opacity-70 animate-float" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-2xl animate-float-delayed" />
      </div>

      {/* Top Navigation Bar Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10 px-2 sm:px-6">
        <Link
          to="/"
          id="signup-back-to-home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/60 py-2 px-3 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-gray-700/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={toggleTheme}
          id="signup-theme-toggle"
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Forecast cashflow dynamics and mitigate vendor liquidity risk
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-slate-200 dark:border-gray-800/80 shadow-xl dark:shadow-2xl rounded-2xl p-6 sm:p-8 transition-colors">
          {errors.form && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-500/40 dark:text-red-300 text-sm flex items-start gap-2">
              <span className="font-semibold">Notice:</span> {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label 
                htmlFor="signup-fullname" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="signup-fullname"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                  }}
                  placeholder="e.g. Sarah Jenkins"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.fullName ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-slate-300 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="fullname-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="signup-email" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
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
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="signup-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="signup-password" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="At least 6 characters"
                  className={`block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-gray-950/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.password ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-slate-300 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-signup-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="signup-password-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="signup-confirm-password" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Re-enter your password"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.confirmPassword ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-slate-300 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="confirm-password-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-gray-300 cursor-pointer">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                  }}
                  className="mt-0.5 w-4 h-4 rounded bg-white dark:bg-gray-950 border-slate-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500/40"
                />
                <span>
                  I have read and agree to the <span className="text-blue-600 dark:text-blue-400 font-semibold">Terms of Service</span> and <span className="text-blue-600 dark:text-blue-400 font-semibold">Privacy Policy</span>.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-red-500 font-medium" id="terms-error">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="signup-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md shadow-blue-600/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              id="goto-login-link" 
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
