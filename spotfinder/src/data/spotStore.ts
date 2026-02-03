import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoSpot } from '../types/spot';

const USER_SPOTS_KEY = '@spotfinder/user_spots';

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
