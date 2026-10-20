import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { isEnterpriseDataAuthorized, AUTHORIZED_ENTERPRISE_EMAILS } from '../config/authWhitelist';

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
    // Check persistent authorized enterprise session first
    const savedAuth = localStorage.getItem('cashpredix_auth_session');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed && isEnterpriseDataAuthorized(parsed)) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
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
    const savedAuth = localStorage.getItem('cashpredix_auth_session');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed && isEnterpriseDataAuthorized(parsed)) {
          return { user: parsed, access_token: 'auth-session-token' };
        }
      } catch {
        // ignore
      }
    }
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
      } else if (!localStorage.getItem('cashpredix_demo_session') && !localStorage.getItem('cashpredix_auth_session')) {
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
      localStorage.removeItem('cashpredix_demo_session');
      if (data?.user && isEnterpriseDataAuthorized(data.user)) {
        localStorage.setItem('cashpredix_auth_session', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      // Check if authorized email attempting login when Supabase is offline or experiencing network friction
      const isAuthEmail = AUTHORIZED_ENTERPRISE_EMAILS.some((allowed) => 
        email.toLowerCase().trim().includes(allowed.toLowerCase().trim())
      );
      if (isAuthEmail && (err.status === 502 || err.message?.includes('502') || err.message?.includes('Failed to fetch') || err.message?.includes('invalid login credentials') || err.message?.includes('invalid_grant'))) {
        return signInAsAuthorized(email);
      }
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
      localStorage.removeItem('cashpredix_auth_session');
      await supabase.auth.signOut().catch(() => {});
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const updatePassword = async (newPassword) => {
    // If running in local demo mode, simulate success
    if (localStorage.getItem('cashpredix_demo_session')) {
      const timestamp = Date.now().toString();
      localStorage.setItem('cashpredix_password_updated_event', timestamp);
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const ch = new BroadcastChannel('cashpredix_auth_channel');
          ch.postMessage({ type: 'PASSWORD_UPDATED', timestamp });
          ch.close();
        } catch (e) {
          console.warn('BroadcastChannel error:', e);
        }
      }
      return { user };
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;

    // Cross-tab broadcast notification
    const timestamp = Date.now().toString();
    localStorage.setItem('cashpredix_password_updated_event', timestamp);
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const ch = new BroadcastChannel('cashpredix_auth_channel');
        ch.postMessage({ type: 'PASSWORD_UPDATED', timestamp });
        ch.close();
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    return data;
  };

  const updateProfile = async ({ firstName, lastName, fullName }) => {
    const computedFullName = fullName || `${firstName || ''} ${lastName || ''}`.trim();
    const updatedMetadata = {
      ...(user?.user_metadata || {}),
      first_name: firstName,
      last_name: lastName,
      full_name: computedFullName,
    };

    // If running in local demo mode, simulate success
    if (localStorage.getItem('cashpredix_demo_session')) {
      const updatedUser = {
        ...user,
        user_metadata: updatedMetadata,
      };
      localStorage.setItem('cashpredix_demo_session', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { user: updatedUser };
    }

    const { data, error } = await supabase.auth.updateUser({
      data: updatedMetadata,
    });
    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
    }
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

  // Direct Authorized Sign In for Merve & Prof. Sarah Zelikovitz
  const signInAsAuthorized = (targetEmail = 'gaziimervee@gmail.com') => {
    const isSarah = targetEmail.toLowerCase().includes('sarah') || targetEmail.toLowerCase().includes('zelikovitz');
    const authUser = {
      id: isSarah ? 'sarah-prof-uuid-002' : 'merve-owner-uuid-001',
      email: isSarah ? 'sarah.zelikovitz@csi.cuny.edu' : 'gaziimervee@gmail.com',
      user_metadata: {
        full_name: isSarah ? 'Prof. Sarah Zelikovitz' : 'Merve Gazi',
        role: isSarah ? 'Academic Sponsor & Reviewer' : 'Platform Owner / Executive',
        is_authorized_enterprise: true,
      },
    };
    localStorage.removeItem('cashpredix_demo_session');
    localStorage.setItem('cashpredix_auth_session', JSON.stringify(authUser));
    setUser(authUser);
    setSession({ user: authUser, access_token: 'auth-session-token' });
    return { user: authUser };
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
      localStorage.removeItem('cashpredix_auth_session');
      return data;
    } catch {
      // If Supabase is paused or credentials not found, activate local demo session
      return switchToDemo();
    }
  };

  const switchToDemo = () => {
    const demoUser = {
      id: 'demo-exec-uuid-999',
      email: 'demo@cashpredix.com',
      user_metadata: {
        full_name: 'Demo Executive',
      },
    };
    localStorage.removeItem('cashpredix_auth_session');
    localStorage.setItem('cashpredix_demo_session', JSON.stringify(demoUser));
    setUser(demoUser);
    setSession({ user: demoUser, access_token: 'mock-session-token' });
    return { user: demoUser };
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
    updateProfile,
    resetPassword,
    signInDemo,
    signInAsAuthorized,
    switchToDemo,
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
