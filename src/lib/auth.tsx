import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
};

type AuthActions = {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

// Generic, identical message for any sign-in / sign-up failure — prevents
// account enumeration via differentiated error text.
const GENERIC_AUTH_ERROR = 'Could not complete that request. Check your details and try again.';

// AsyncStorage keys that hold user-scoped data — removed on sign-out so a
// second user on the same device cannot recover the previous user's drafts.
const USER_SCOPED_KEY_PATTERNS = [
  /^nalog_profile_/,
  /^nalog_pub_list_/,
  /^nalog_feed_/,
  /^nalog_draft_y\d+_w\d+$/,
  /^nalog_pub_w\d+$/,
  /^nalog_w\d+_/,
  /^nalog_communities_mine$/,
  /^log_pub_/,
];

async function clearUserScopedCaches(): Promise<void> {
  try {
    const all = await AsyncStorage.getAllKeys();
    const toRemove = all.filter((k) => USER_SCOPED_KEY_PATTERNS.some((p) => p.test(k)));
    if (toRemove.length > 0) await AsyncStorage.multiRemove(toRemove);
  } catch {
    // best-effort wipe; ignore device-side failures
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      lastUserId.current = data.session?.user.id ?? null;
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, next) => {
      // If the active user changed (different uid signed in, or signed out),
      // discard any caches belonging to the previous user.
      const nextUid = next?.user.id ?? null;
      if (lastUserId.current && lastUserId.current !== nextUid) {
        void clearUserScopedCaches();
      }
      lastUserId.current = nextUid;
      setSession(next);
      if (event === 'SIGNED_OUT') void clearUserScopedCaches();
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    loading,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? GENERIC_AUTH_ERROR : null };
    },
    signUp: async (email, password, displayName) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      return { error: error ? GENERIC_AUTH_ERROR : null };
    },
    signOut: async () => {
      await supabase.auth.signOut();
      await clearUserScopedCaches();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
