import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { AuthContext } from './authContextInstance';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch or initialize user profile from public.profiles
  const fetchUserProfile = async (userId, userAuthEmail = '', userFullName = '') => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Notice fetching user profile:', error.message);
      }

      if (data) {
        setProfile(data);
        return data;
      } else {
        // Fallback profile if record not found in profiles table (e.g. legacy account prior to trigger)
        const fallbackProfile = {
          id: userId,
          full_name: userFullName || '',
          email: userAuthEmail,
          role: 'user',
        };

        // Attempt upserting profile for authenticated session
        const { data: insertedData } = await supabase
          .from('profiles')
          .upsert([fallbackProfile], { onConflict: 'id' })
          .select()
          .maybeSingle();

        const activeProfile = insertedData || fallbackProfile;
        setProfile(activeProfile);
        return activeProfile;
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!isMounted) return;
      setSession(initSession);
      const currentUser = initSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const metaName = currentUser.user_metadata?.full_name || '';
        fetchUserProfile(currentUser.id, currentUser.email, metaName).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const metaName = currentUser.user_metadata?.full_name || '';
        await fetchUserProfile(currentUser.id, currentUser.email, metaName);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Auth Action: Signup
  const signup = async ({ fullName, email, password }) => {
    try {
      // 1. Create auth user with Supabase Auth, passing metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const createdUser = data?.user;
      if (createdUser) {
        // 2. Client-side optimistic profile check/upsert (if session active)
        try {
          await supabase
            .from('profiles')
            .upsert(
              [
                {
                  id: createdUser.id,
                  full_name: fullName,
                  email: email,
                  role: 'user', // STRICT: Normal users ALWAYS default to 'user'
                },
              ],
              { onConflict: 'id' }
            );
        } catch {
          // Ignored: DB Trigger (SECURITY DEFINER) handles insertion automatically
        }

        await fetchUserProfile(createdUser.id, email, fullName);
      }

      return { success: true, user: createdUser };
    } catch (err) {
      return { success: false, error: err.message || 'Signup failed. Please try again.' };
    }
  };

  // Auth Action: Login
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const metaName = data.user.user_metadata?.full_name || '';
        await fetchUserProfile(data.user.id, data.user.email, metaName);
      }

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed. Please try again.' };
    }
  };

  // Auth Action: Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Auth Action: Reset Password Email
  const resetPassword = async (email) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Auth Action: Update Password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile: () => fetchUserProfile(user?.id, user?.email, user?.user_metadata?.full_name),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
