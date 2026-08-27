import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { PEPTALK_HEALTH_STORAGE_KEYS, PEPTALK_OPTIONAL_STORAGE_KEYS } from './pepTalkStorageKeys';

const TABLE = 'peptalk_app_state';
let debounceTimer = null;
const DEBOUNCE_MS = 4500;
let lastSyncFailNotifyAt = 0;
const SYNC_FAIL_NOTIFY_COOLDOWN_MS = 12000;

/** User-facing message for Supabase/network failures (auth, sync, fetch). */
export function formatCloudError(err) {
  if (err == null) return "Something went wrong. Your data is still saved on this device.";
  const msg = typeof err === 'string' ? err : err?.message != null ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return "You're offline. Connect to the internet and try again.";
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed') ||
    lower.includes('fetch failed') ||
    lower.includes('the internet connection appears to be offline')
  ) {
    return "Can't reach the server. Check your connection — your data stays on this device.";
  }
  if (lower.includes('jwt') && (lower.includes('expired') || lower.includes('invalid'))) {
    return 'Session expired. Sign out and sign in again to sync.';
  }
  return msg;
}

function allKeys() {
  return [...PEPTALK_HEALTH_STORAGE_KEYS, ...PEPTALK_OPTIONAL_STORAGE_KEYS];
}

/** Build JSON-serializable payload from localStorage (parsed values for JSONB). */
export function collectLocalPayload() {
  const payload = {};
  for (const key of allKeys()) {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === '') continue;
    try {
      payload[key] = JSON.parse(raw);
    } catch {
      payload[key] = raw;
    }
  }
  return payload;
}

/** Remove health-sync keys from localStorage (before full cloud replace). Does not clear welcome/tutorial prefs. */
export function clearPeptalkHealthStorage() {
  try {
    for (const key of PEPTALK_HEALTH_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('clearPeptalkHealthStorage', e);
  }
}

/** Write payload back to localStorage and stringify objects. */
export function applyPayloadToLocalStorage(payload) {
  if (!payload || typeof payload !== 'object') return;
  for (const key of Object.keys(payload)) {
    const v = payload[key];
    if (v === undefined) continue;
    try {
      localStorage.setItem(key, typeof v === 'string' ? v : JSON.stringify(v));
    } catch (e) {
      console.warn('cloudSync: skip key', key, e);
    }
  }
}

/** Deep comparison ignoring object key order (Supabase JSONB order can differ from localStorage round-trip). */
function stableStringify(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  const t = typeof val;
  if (t !== 'object') return JSON.stringify(val);
  if (Array.isArray(val)) return `[${val.map(stableStringify).join(',')}]`;
  const keys = Object.keys(val).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(val[k])}`).join(',')}}`;
}

/**
 * True when local health keys match the cloud payload (no merge conflict).
 * Used so we don't re-open the restore modal after the user chose "use cloud" and reloaded.
 */
export function healthPayloadMatchesLocal(cloudPayload) {
  if (!cloudPayload || typeof cloudPayload !== 'object') return false;
  try {
    for (const key of PEPTALK_HEALTH_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      let localParsed;
      if (raw == null || raw === '') {
        localParsed = undefined;
      } else {
        try {
          localParsed = JSON.parse(raw);
        } catch {
          localParsed = raw;
        }
      }
      const cloudVal = cloudPayload[key];
      const a = localParsed === undefined ? null : localParsed;
      const b = cloudVal === undefined ? null : cloudVal;
      if (stableStringify(a) !== stableStringify(b)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function isLocalHealthDataEmpty() {
  try {
    const w = localStorage.getItem('health-weight-entries');
    const i = localStorage.getItem('health-injection-entries');
    const wa = w ? JSON.parse(w) : [];
    const ia = i ? JSON.parse(i) : [];
    const hasW = Array.isArray(wa) && wa.length > 0;
    const hasI = Array.isArray(ia) && ia.length > 0;
    return !hasW && !hasI;
  } catch {
    return true;
  }
}

/**
 * Push current localStorage snapshot to Supabase (requires active session).
 * @returns {{ ok: true } | { ok: false, code: 'not_configured' | 'no_session' | 'supabase' | 'network', message?: string }}
 */
export async function pushCloudBackup() {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) return { ok: false, code: 'not_configured' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { ok: false, code: 'no_session' };

    const payload = collectLocalPayload();
    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: session.user.id,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) {
      console.error('pushCloudBackup', error);
      return { ok: false, code: 'supabase', message: formatCloudError(error.message) };
    }
    return { ok: true };
  } catch (e) {
    console.error('pushCloudBackup', e);
    return { ok: false, code: 'network', message: formatCloudError(e) };
  }
}

/** Fetch cloud row for current user. */
export async function fetchCloudBackup() {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) return { row: null, error: 'not_configured' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { row: null, error: 'no_session' };

    const { data, error } = await supabase
      .from(TABLE)
      .select('payload, updated_at')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('fetchCloudBackup', error);
      return { row: null, error: 'fetch_failed', message: formatCloudError(error.message) };
    }
    return { row: data, error: null };
  } catch (e) {
    console.error('fetchCloudBackup', e);
    return { row: null, error: 'fetch_failed', message: formatCloudError(e) };
  }
}

/** Debounced push after local saves (when logged in). Notifies UI on failure (throttled). */
export function scheduleCloudSync() {
  if (!isSupabaseConfigured()) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    pushCloudBackup()
      .then((r) => {
        if (typeof window === 'undefined' || !window.dispatchEvent) return;
        if (r.ok) {
          lastSyncFailNotifyAt = 0;
          window.dispatchEvent(new CustomEvent('peptalk:cloud-sync-result', { detail: { ok: true } }));
          return;
        }
        if (r.code === 'no_session' || r.code === 'not_configured') return;
        const now = Date.now();
        if (now - lastSyncFailNotifyAt < SYNC_FAIL_NOTIFY_COOLDOWN_MS) return;
        lastSyncFailNotifyAt = now;
        window.dispatchEvent(
          new CustomEvent('peptalk:cloud-sync-result', {
            detail: { ok: false, message: r.message || "Couldn't sync to the cloud." },
          })
        );
      })
      .catch((e) => {
        console.warn('scheduleCloudSync', e);
        if (typeof window === 'undefined' || !window.dispatchEvent) return;
        const now = Date.now();
        if (now - lastSyncFailNotifyAt < SYNC_FAIL_NOTIFY_COOLDOWN_MS) return;
        lastSyncFailNotifyAt = now;
        window.dispatchEvent(
          new CustomEvent('peptalk:cloud-sync-result', {
            detail: { ok: false, message: formatCloudError(e) },
          })
        );
      });
  }, DEBOUNCE_MS);
}
