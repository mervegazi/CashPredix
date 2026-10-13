import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatAuthError } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Loader2, 
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updatePassword, user, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
      await updatePassword(newPassword);
      toast.success('Password updated successfully! Redirecting to dashboard...');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Password change error:', err);
      const friendlyMsg = formatAuthError(err);
      toast.error(friendlyMsg);
      setErrors((prev) => ({ ...prev, form: friendlyMsg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
        <span className="text-sm text-slate-500 dark:text-gray-400">Verifying session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 dark:from-blue-600/20 dark:to-indigo-500/20 rounded-full blur-3xl opacity-70 animate-float" />
      </div>

      <div className="absolute top-6 left-6 max-w-7xl mx-auto z-10">
        <Link
          to="/dashboard"
          id="back-to-dashboard-btn"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/60 py-2 px-3 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-gray-700/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Set Your New Password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            {user?.email 
              ? `Enter a new password for ${user.email}` 
              : 'Enter a new password to complete the account recovery process'}
          </p>
        </div>

        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-slate-200 dark:border-gray-800/80 shadow-xl dark:shadow-2xl rounded-2xl p-6 sm:p-8 transition-colors">
          {errors.form && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-500/40 dark:text-red-300 text-sm">
              {errors.form}
            </div>
          )}

          {!user && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                If you arrived here without an active recovery link, please request a new reset link from the{' '}
                <Link to="/login" className="underline font-bold text-amber-900 dark:text-amber-200">
                  Login Page
                </Link>
                .
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label 
                htmlFor="new-password" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
                  }}
                  placeholder="At least 6 characters"
                  className={`block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-gray-950/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.newPassword ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-slate-300 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-change-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="new-password-error">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="confirm-new-password" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Re-enter your new password"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.confirmPassword ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-slate-300 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-700'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500 font-medium" id="confirm-new-password-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              id="save-new-password-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md shadow-blue-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save New Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
