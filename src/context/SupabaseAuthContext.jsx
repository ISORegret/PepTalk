import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  applyPayloadToLocalStorage,
  clearPeptalkHealthStorage,
  fetchCloudBackup,
  healthPayloadMatchesLocal,
  isLocalHealthDataEmpty,
  pushCloudBackup,
} from '../lib/cloudSync';

const SupabaseAuthContext = createContext(null);

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(!!isSupabaseConfigured());
  const [pendingCloudRestore, setPendingCloudRestore] = useState(null);
  const cloudFetchGeneration = useRef(0);

  useEffect(() => {
    const supabase = getSupabase();
    if (!isSupabaseConfigured() || !supabase) {
      setAuthLoading(false);
      return undefined;
    }

    const runCloudSyncForUser = async () => {
      const gen = ++cloudFetchGeneration.current;
      const { row, error, message: fetchMessage } = await fetchCloudBackup();
      if (gen !== cloudFetchGeneration.current) return;
      if (error && error !== 'no_session' && error !== 'not_configured') {
        console.warn('fetchCloudBackup', error, fetchMessage || '');
      }

      const payload = row?.payload;
      const hasCloud =
        payload &&
        typeof payload === 'object' &&
        Object.keys(payload).length > 0;

      if (hasCloud) {
        if (gen !== cloudFetchGeneration.current) return;
        if (isLocalHealthDataEmpty()) {
          applyPayloadToLocalStorage(payload);
          window.location.reload();
          return;
        }
        if (gen !== cloudFetchGeneration.current) return;
        if (healthPayloadMatchesLocal(payload)) {
          return;
        }
        if (gen !== cloudFetchGeneration.current) return;
        setPendingCloudRestore({
          payload,
          updatedAt: row.updated_at,
        });
      } else {
        if (gen !== cloudFetchGeneration.current) return;
        await pushCloudBackup();
      }
    };

    const applyAuth = async (sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess?.user) {
        setPendingCloudRestore(null);
        cloudFetchGeneration.current += 1;
        return;
      }
      await runCloudSyncForUser();
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      applyAuth(s);
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      applyAuth(s);
    });

    return () => {
      cloudFetchGeneration.current += 1;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const client = getSupabase();
    if (!client) return { error: new Error('Supabase not configured') };
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    return { error };
  }, []);

  const signUp = useCallback(async (email, password) => {
    const client = getSupabase();
    if (!client) return { error: new Error('Supabase not configured') };
    const { error } = await client.auth.signUp({ email: email.trim(), password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    cloudFetchGeneration.current += 1;
    setPendingCloudRestore(null);
    await client.auth.signOut();
  }, []);

  const resolveCloudRestore = useCallback(async (choice) => {
    if (choice === 'cloud' && pendingCloudRestore?.payload) {
      clearPeptalkHealthStorage();
      applyPayloadToLocalStorage(pendingCloudRestore.payload);
      setPendingCloudRestore(null);
      window.location.reload();
      return;
    }
    if (choice === 'local') {
      setPendingCloudRestore(null);
      await pushCloudBackup();
    }
  }, [pendingCloudRestore]);

  const syncNow = useCallback(async () => {
    return pushCloudBackup();
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      authLoading,
      isConfigured: isSupabaseConfigured(),
      pendingCloudRestore,
      resolveCloudRestore,
      signIn,
      signUp,
      signOut,
      syncNow,
    }),
    [
      user,
      session,
      authLoading,
      pendingCloudRestore,
      resolveCloudRestore,
      signIn,
      signUp,
      signOut,
      syncNow,
    ]
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return ctx;
}
