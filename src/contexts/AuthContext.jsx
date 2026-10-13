import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

export function formatAuthError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = (err.message || String(err)).toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Your email address has not been confirmed yet. Please check your inbox for the verification link.';
  }
  if (msg.includes('email rate limit exceeded') || msg.includes('rate limit')) {
    return 'Too many requests. Please wait a few moments before trying again.';
  }
  if (msg.includes('user not found')) {
    return 'No account was found with this email address.';
  }
  if (msg.includes('otp_expired') || msg.includes('token has expired') || msg.includes('invalid or has expired')) {
    return 'The verification or reset link has expired or has already been used. Please request a new link.';
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Unable to reach the server. Please check your internet connection.';
  }
  if (msg.includes('502') || msg.includes('bad gateway')) {
    return 'Authentication server is temporarily unavailable (502). Please try again in a few moments or use Demo Sign In.';
  }
  return err.message || 'Authentication request failed. Please check your information and try again.';
}


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedDemo = localStorage.getItem('cashpredix_demo_session');
    if (savedDemo) {
      try {
        return JSON.parse(savedDemo);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [session, setSession] = useState(() => {
    const savedDemo = localStorage.getItem('cashpredix_demo_session');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        return { user: parsed, access_token: 'demo-token' };
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // 'connected' | 'paused' | 'error'

  useEffect(() => {
    // Check for auth error parameters in URL hash
    if (window.location.hash.includes('error=')) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDesc = hashParams.get('error_description') || hashParams.get('error');
        if (errorDesc) {
          toast.error(`Auth Notice: ${decodeURIComponent(errorDesc.replace(/\+/g, ' '))}`, {
            duration: 6000,
          });
        }
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.warn('Could not parse hash error:', e);
      }
    }

    // Check if arriving from a password recovery link
    if (window.location.hash.includes('type=recovery')) {
      const changePwPath = `${window.location.origin}${import.meta.env.BASE_URL}change-password${window.location.hash}`;
      if (!window.location.pathname.includes('/change-password')) {
        window.location.replace(changePwPath);
        return;
      }
    }

    // Check Supabase session with safety timeout
    let isMounted = true;
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 3500));

    Promise.race([sessionPromise, timeoutPromise])
      .then((result) => {
        if (!isMounted) return;
        if (result && !result.timeout) {
          const { data, error } = result;
          if (error) {
            console.warn('Supabase session notice:', error);
            setSupabaseStatus('paused');
          } else if (data?.session) {
            setSession(data.session);
            setUser(data.session.user);
            setSupabaseStatus('connected');
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Initial session check caught:', err);
        if (isMounted) {
          setSupabaseStatus('paused');
          setLoading(false);
        }
      });

    // 3. Listen for Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        setSupabaseStatus('connected');
        localStorage.removeItem('cashpredix_demo_session');

        // Redirect to change-password if recovery link triggered
        if (event === 'PASSWORD_RECOVERY') {
          const target = `${window.location.origin}${import.meta.env.BASE_URL}change-password`;
          if (!window.location.pathname.includes('/change-password')) {
            window.location.replace(target);
          }
        }
      } else if (!localStorage.getItem('cashpredix_demo_session')) {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setSupabaseStatus('connected');
      return data;
    } catch (err) {
      // Check if project returned 502 / bad gateway
      if (err.status === 502 || err.message?.includes('502') || err.message?.includes('Failed to fetch')) {
        setSupabaseStatus('paused');
        throw new Error('Supabase project is temporarily paused or unavailable (502). Please resume it from your Supabase Dashboard or use Demo Executive sign in.');
      }
      throw err;
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      setSupabaseStatus('connected');
      return data;
    } catch (err) {
      if (err.status === 502 || err.message?.includes('502') || err.message?.includes('Failed to fetch')) {
        setSupabaseStatus('paused');
        throw new Error('Supabase project is temporarily paused or unavailable (502). Please resume it from your Supabase Dashboard or use Demo Executive sign in.');
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('cashpredix_demo_session');
      await supabase.auth.signOut().catch(() => {});
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const updatePassword = async (newPassword) => {
    // If running in local demo mode, simulate success
    if (localStorage.getItem('cashpredix_demo_session')) {
      return { user };
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email) => {
    const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}change-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
    return data;
  };

  // Demo Executive account with offline fallback
  const signInDemo = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@cashpredix.com',
        password: 'DemoPassword123!',
      });
      if (error) throw error;
      localStorage.removeItem('cashpredix_demo_session');
      return data;
    } catch {
      // If Supabase is paused or credentials not found, activate local demo session
      const demoUser = {
        id: 'demo-exec-uuid-999',
        email: 'demo@cashpredix.com',
        user_metadata: {
          full_name: 'Demo Executive',
        },
      };
      localStorage.setItem('cashpredix_demo_session', JSON.stringify(demoUser));
      setUser(demoUser);
      setSession({ user: demoUser, access_token: 'mock-session-token' });
      return { user: demoUser };
    }
  };

  const value = {
    user,
    session,
    loading,
    supabaseStatus,
    signIn,
    signUp,
    signOut,
    updatePassword,
    resetPassword,
    signInDemo,
    formatAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
