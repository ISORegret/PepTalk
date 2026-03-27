/**
 * Compare semver-like strings (major.minor.patch). Returns positive if a > b.
 */
export function compareSemver(a, b) {
  if (!a || !b) return 0;
  const pa = String(a)
    .split(/[-+]/)[0]
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const pb = String(b)
    .split(/[-+]/)[0]
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

const DISMISSED_KEY = 'peptalk-update-dismissed-version';

/**
 * @param {string} manifestUrl - Full HTTPS URL to JSON (from VITE_APP_UPDATE_MANIFEST_URL)
 * @param {string} currentVersion - App version string (e.g. from APP_VERSION)
 * @returns {Promise<{ updateAvailable: boolean, latestVersion?: string, downloadUrl?: string, releaseNotes?: string }>}
 */
export async function checkForAppUpdate(manifestUrl, currentVersion) {
  const out = { updateAvailable: false };
  if (!manifestUrl || !currentVersion) return out;

  let manifest;
  try {
    const res = await fetch(manifestUrl, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return out;
    manifest = await res.json();
  } catch (e) {
    console.warn('appUpdateCheck: fetch failed', e);
    return out;
  }

  const latest = manifest?.latestVersion;
  const downloadUrl = manifest?.androidDownloadUrl || manifest?.downloadUrl;
  if (!latest || !downloadUrl) return out;

  if (compareSemver(latest, currentVersion) <= 0) return out;

  try {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed === latest) return out;
  } catch (_) {}

  return {
    updateAvailable: true,
    latestVersion: latest,
    downloadUrl,
    releaseNotes: typeof manifest?.releaseNotes === 'string' ? manifest.releaseNotes : '',
  };
}

export function dismissUpdatePrompt(latestVersion) {
  try {
    if (latestVersion) localStorage.setItem(DISMISSED_KEY, latestVersion);
  } catch (_) {}
}

export function openDownloadUrl(url) {
  if (!url) return;
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (_) {
    window.location.href = url;
  }
}
