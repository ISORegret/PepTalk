import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoSpot } from '../types/spot';

const USER_SPOTS_KEY = '@spotfinder/user_spots';
const FAVORITES_KEY = '@spotfinder/favorites';
const COLLECTIONS_KEY = '@spotfinder/collections';

export async function loadUserSpots(): Promise<PhotoSpot[]> {
  try {
    const raw = await AsyncStorage.getItem(USER_SPOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveUserSpots(spots: PhotoSpot[]): Promise<void> {
  await AsyncStorage.setItem(USER_SPOTS_KEY, JSON.stringify(spots));
}

export async function loadFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export type Collection = { id: string; name: string; spotIds: string[] };

export async function loadCollections(): Promise<Collection[]> {
  try {
    const raw = await AsyncStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCollections(collections: Collection[]): Promise<void> {
  await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}
