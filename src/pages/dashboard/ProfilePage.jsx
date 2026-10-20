import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
  LogOut,
  Fingerprint,
  Building,
  Save,
  Check
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updatePassword, updateProfile, signOut } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Extract initial names from metadata or email
  const getInitialNames = () => {
    const meta = user?.user_metadata || {};
    if (meta.first_name || meta.last_name) {
      return {
        firstName: meta.first_name || '',
        lastName: meta.last_name || '',
      };
    }
    const full = meta.full_name || '';
    if (full.includes(' ')) {
      const parts = full.split(' ');
      return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
      };
    }
    return {
      firstName: full || user?.email?.split('@')[0] || 'Executive',
      lastName: '',
    };
  };

  // Profile Personal Information state initialized from user
  const [profileForm, setProfileForm] = useState(() => getInitialNames());
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const displayFullName =
    `${profileForm.firstName} ${profileForm.lastName}`.trim() ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Executive User';

  const userInitials = (
    (profileForm.firstName?.[0] || '') + (profileForm.lastName?.[0] || profileForm.firstName?.[1] || 'E')
  ).toUpperCase();

  // Handle Personal Details Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!profileForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    try {
      if (updateProfile) {
        await updateProfile({
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          fullName: `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim(),
        });
      }
      toast.success('Profile credentials updated successfully!');
      setProfileErrors({});
    } catch (err) {
      toast.error(err.message || 'Could not update profile');
      setProfileErrors({ form: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!newPassword) {
      errs.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await updatePassword(newPassword);
      toast.success('Your account password has been updated!');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch (err) {
      toast.error(err.message || 'Could not update password');
      setPasswordErrors({ form: err.message });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error(err.message || 'Error signing out');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-blue-500" />
          <span>User Profile & Account Settings</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal credentials, identity profile, security credentials, and workspace preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {displayFullName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Verified Executive
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>{user?.email || 'user@cashpredix.com'}</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <Fingerprint className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] truncate max-w-xs">
                Tenant UID: {user?.id || 'demo-user-id'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          id="profile-signout-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid: Personal Details + Password + Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal Details (First Name, Last Name, Email) */}
        <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Personal Information
                </h3>
                <p className="text-xs text-gray-400">
                  Update your identity details across CashPredix
                </p>
              </div>
            </div>

            {profileErrors.form && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs">
                {profileErrors.form}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name Field */}
                <div>
                  <label
                    htmlFor="profile-first-name"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => {
                      setProfileForm((prev) => ({ ...prev, firstName: e.target.value }));
                      if (profileErrors.firstName) setProfileErrors((prev) => ({ ...prev, firstName: null }));
                    }}
                    placeholder="e.g. Merve"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {profileErrors.firstName && (
                    <p className="mt-1 text-[11px] text-red-500">{profileErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name Field */}
                <div>
                  <label
                    htmlFor="profile-last-name"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => {
                      setProfileForm((prev) => ({ ...prev, lastName: e.target.value }));
                    }}
                    placeholder="e.g. Gazi"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email Field (Displayed & Verified) */}
              <div>
                <label
                  htmlFor="profile-email-display"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="profile-email-display"
                    type="email"
                    value={user?.email || 'user@cashpredix.com'}
                    readOnly
                    className="w-full px-3 py-2 pl-9 text-xs rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed select-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <span className="absolute right-3 top-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Primary corporate email address bound to your Supabase tenant.
                </p>
              </div>

              {/* Department / Executive Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Executive Role & Organization
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="Chief Financial Officer (CFO) — CashPredix Workspace"
                    className="w-full px-3 py-2 pl-9 text-xs rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                  />
                  <Building className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="profile-save-info-btn"
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Personal Information</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Synced with Supabase Auth Metadata
            </span>
            <span>Identity Verified</span>
          </div>
        </div>

        {/* Column 2: Security & Workspace Preferences */}
        <div className="space-y-6">
          {/* Card 2: Security & Password */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Update Security Password
                </h3>
                <p className="text-xs text-gray-400">Change account access credentials</p>
              </div>
            </div>

            {passwordErrors.form && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs">
                {passwordErrors.form}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="profile-new-password"
                  className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="profile-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.newPassword)
                        setPasswordErrors((prev) => ({ ...prev, newPassword: null }));
                    }}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2 pr-10 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-[11px] text-red-500">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="profile-confirm-password"
                  className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="profile-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                id="profile-update-password-btn"
                type="submit"
                disabled={isSubmittingPassword}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmittingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card 3: Appearance & Theme */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Workspace Appearance
                </h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Toggle between Light and Dark interface themes for optimal contrast and battery efficiency.
              </p>

              <button
                type="button"
                onClick={toggleTheme}
                id="profile-theme-toggle-btn"
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <div className="p-2 rounded-lg bg-gray-800 text-blue-400">
                      <Moon className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-500">
                      <Sun className="w-4 h-4" />
                    </div>
                  )}
                  <div className="text-left">
                    <span className="block text-xs font-bold text-gray-900 dark:text-white">
                      Active: {isDark ? 'Dark Mode' : 'Light Mode'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Click to switch to {isDark ? 'Light' : 'Dark'} Mode
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
                  Switch
                </span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>CashPredix Client v0.3.0</span>
              <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                RLS Secured
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
