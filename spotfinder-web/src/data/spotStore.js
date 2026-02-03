/** Local storage for user spots, favorites, collections — same idea as PepTalk (data on device). */
const USER_SPOTS_KEY = 'spotfinder_user_spots';
const FAVORITES_KEY = 'spotfinder_favorites';
const COLLECTIONS_KEY = 'spotfinder_collections';

export function loadUserSpots() {
  try {
    const raw = localStorage.getItem(USER_SPOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserSpots(spots) {
  localStorage.setItem(USER_SPOTS_KEY, JSON.stringify(spots));
}

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function loadCollections() {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCollections(collections) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}
