import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
      errs.fullName = 'Full name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid business email';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'You must accept the terms of service';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the form errors before submitting');
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
        toast.success('Confirmation email sent! You can now log in.', { duration: 5000 });
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Sign up error:', err);
      const msg = err.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-950 text-gray-100 dark:bg-gray-950 dark:text-gray-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Background Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-gradient-to-tr from-emerald-600/20 to-blue-500/20 rounded-full blur-3xl opacity-70 animate-float" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl animate-float-delayed" />
      </div>

      {/* Top Navigation Bar Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10 px-2 sm:px-6">
        <Link
          to="/"
          id="signup-back-to-home"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Link>

        <button
          onClick={toggleTheme}
          id="signup-theme-toggle"
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Start predicting cash flow & mitigating vendor delay risks
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 shadow-2xl rounded-2xl p-6 sm:p-8">
          {errors.form && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-start gap-2">
              <span className="font-semibold">Error:</span> {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label 
                htmlFor="signup-fullname" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
                  placeholder="Jane Doe"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-gray-950/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.fullName ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-gray-800 hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-400 font-medium" id="fullname-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="signup-email" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
                  placeholder="jane@company.com"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-gray-950/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.email ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-gray-800 hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium" id="signup-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="signup-password" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
                  placeholder="Min. 6 characters"
                  className={`block w-full pl-10 pr-10 py-2.5 bg-gray-950/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.password ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-gray-800 hover:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-signup-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium" id="signup-password-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="signup-confirm-password" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
                  placeholder="Re-enter password"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-gray-950/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.confirmPassword ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-gray-800 hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400 font-medium" id="confirm-password-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                  }}
                  className="mt-0.5 w-4 h-4 rounded bg-gray-950 border-gray-700 text-blue-600 focus:ring-blue-500/40"
                />
                <span>
                  I agree to the <span className="text-blue-400">Terms of Service</span> and <span className="text-blue-400">Privacy Policy</span>.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-red-400 font-medium" id="terms-error">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="signup-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create CashPredix Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              id="goto-login-link" 
              className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
