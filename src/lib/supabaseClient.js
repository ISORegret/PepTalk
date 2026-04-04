import { createClient } from '@supabase/supabase-js';

/** Set by main.jsx after fetching public/supabase-config.json (for static web hosts without build-time env). */
const RUNTIME_GLOBAL = '__PEPTALK_SUPABASE__';

function readEnvConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    return { url: String(url).trim(), anonKey: String(anonKey).trim() };
  }
  return null;
}

function readRuntimeWindowConfig() {
  if (typeof window === 'undefined') return null;
  const rt = window[RUNTIME_GLOBAL];
  if (rt?.url && rt?.anonKey) {
    return { url: String(rt.url).trim(), anonKey: String(rt.anonKey).trim() };
  }
  return null;
}

export function getSupabaseConfig() {
  return readEnvConfig() || readRuntimeWindowConfig();
}

let _client = null;
let _clientKey = '';

/**
 * Supabase client singleton. Safe to call after runtime config is applied in main.jsx.
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabase() {
  const cfg = getSupabaseConfig();
  if (!cfg?.url || !cfg?.anonKey) return null;
  const key = `${cfg.url}\0${cfg.anonKey}`;
  if (_client && _clientKey === key) return _client;
  _client = createClient(cfg.url, cfg.anonKey);
  _clientKey = key;
  return _client;
}

export function isSupabaseConfigured() {
  return !!getSupabaseConfig();
}
