import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PhotoSpot } from '../types/spot';
import { CURATED_SPOTS } from '../data/spots';
import { getSpotById } from '../data/spots';
import {
  loadUserSpots,
  saveUserSpots,
  loadFavorites,
  saveFavorites,
  loadCollections,
  saveCollections,
  type Collection,
} from '../data/spotStore';
import {
  fetchSpots as fetchSpotsFromSupabase,
  insertSpot as insertSpotToSupabase,
  updateSpot as updateSpotInSupabase,
  addPhotoToSpot as addPhotoToSpotInSupabase,
  SUPABASE_NOT_CONFIGURED,
} from '../data/supabase';

export type { Collection };

type SpotsContextValue = {
  allSpots: PhotoSpot[];
  userSpots: PhotoSpot[];
  addSpot: (spot: Omit<PhotoSpot, 'id'>) => Promise<void>;
  updateSpot: (spotId: string, updates: Partial<Omit<PhotoSpot, 'id'>>) => Promise<void>;
  addPhotoToSpot: (spotId: string, imageUri: string, photoBy: string, note?: string) => Promise<void>;
  getSpotById: (id: string) => PhotoSpot | undefined;
  isUserSpot: (spotId: string) => boolean;
  isLoading: boolean;
  favoriteIds: string[];
  toggleFavorite: (spotId: string) => Promise<void>;
  isFavorite: (spotId: string) => boolean;
  collections: Collection[];
  addCollection: (name: string) => Promise<Collection>;
  addSpotToCollection: (collectionId: string, spotId: string) => Promise<void>;
  removeSpotFromCollection: (collectionId: string, spotId: string) => Promise<void>;
  getCollectionById: (id: string) => Collection | undefined;
  deleteCollection: (id: string) => Promise<void>;
};

const SpotsContext = createContext<SpotsContextValue | null>(null);

export function SpotsProvider({ children }: { children: React.ReactNode }) {
  const [userSpots, setUserSpots] = useState<PhotoSpot[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [favs, colls] = await Promise.all([loadFavorites(), loadCollections()]);
      if (!cancelled) setFavoriteIds(favs);
      if (!cancelled) setCollections(colls);
      try {
        const spots = await fetchSpotsFromSupabase();
        if (!cancelled) {
          setUserSpots(spots);
          await saveUserSpots(spots);
        }
      } catch {
        const spots = await loadUserSpots();
        if (!cancelled) setUserSpots(spots);
      }
      if (!cancelled) setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const allSpots = [...CURATED_SPOTS, ...userSpots];

  const addSpot = useCallback(async (spot: Omit<PhotoSpot, 'id'>) => {
    try {
      const newSpot = await insertSpotToSupabase(spot);
      const next = [newSpot, ...userSpots];
      setUserSpots(next);
      await saveUserSpots(next);
      return;
    } catch (e) {
      if ((e as Error).message === SUPABASE_NOT_CONFIGURED) {
        // fall through to local
      } else {
        throw e;
      }
    }
    const id = `user-${Date.now()}`;
    const newSpot: PhotoSpot = { ...spot, id };
    const next = [...userSpots, newSpot];
    setUserSpots(next);
    await saveUserSpots(next);
  }, [userSpots]);

  const updateSpot = useCallback(async (spotId: string, updates: Partial<Omit<PhotoSpot, 'id'>>) => {
    const spot = userSpots.find((s) => s.id === spotId);
    if (!spot) return;
    try {
      await updateSpotInSupabase(spotId, updates);
      const refreshed = await fetchSpotsFromSupabase();
      setUserSpots(refreshed);
      await saveUserSpots(refreshed);
      return;
    } catch (e) {
      if ((e as Error).message === SUPABASE_NOT_CONFIGURED) {
        // fall through to local
      } else {
        throw e;
      }
    }
    const updated: PhotoSpot = { ...spot, ...updates };
    const next = userSpots.map((s) => (s.id === spotId ? updated : s));
    setUserSpots(next);
    await saveUserSpots(next);
  }, [userSpots]);

  const addPhotoToSpot = useCallback(async (spotId: string, imageUri: string, photoBy: string, note?: string) => {
    const spot = userSpots.find((s) => s.id === spotId);
    if (!spot) return;
    try {
      await addPhotoToSpotInSupabase(spotId, imageUri, photoBy, note);
      const refreshed = await fetchSpotsFromSupabase();
      setUserSpots(refreshed);
      await saveUserSpots(refreshed);
      return;
    } catch (e) {
      if ((e as Error).message === SUPABASE_NOT_CONFIGURED) {
        // fall through to local
      } else {
        throw e;
      }
    }
    const additional = spot.additionalPhotos ?? [];
    const updated: PhotoSpot = {
      ...spot,
      additionalPhotos: [...additional, { imageUri, photoBy, note: note?.trim() || undefined }],
    };
    const next = userSpots.map((s) => (s.id === spotId ? updated : s));
    setUserSpots(next);
    await saveUserSpots(next);
  }, [userSpots]);

  const getSpotByIdImpl = useCallback(
    (id: string) => getSpotById(id, allSpots),
    [allSpots]
  );

  const isUserSpot = useCallback((spotId: string) => userSpots.some((s) => s.id === spotId), [userSpots]);

  const toggleFavorite = useCallback(async (spotId: string) => {
    const next = favoriteIds.includes(spotId)
      ? favoriteIds.filter((id) => id !== spotId)
      : [...favoriteIds, spotId];
    setFavoriteIds(next);
    await saveFavorites(next);
  }, [favoriteIds]);

  const isFavorite = useCallback((spotId: string) => favoriteIds.includes(spotId), [favoriteIds]);

  const addCollection = useCallback(async (name: string) => {
    const id = `coll-${Date.now()}`;
    const coll: Collection = { id, name: name.trim(), spotIds: [] };
    const next = [...collections, coll];
    setCollections(next);
    await saveCollections(next);
    return coll;
  }, [collections]);

  const addSpotToCollection = useCallback(async (collectionId: string, spotId: string) => {
    const coll = collections.find((c) => c.id === collectionId);
    if (!coll || coll.spotIds.includes(spotId)) return;
    const updated: Collection = { ...coll, spotIds: [...coll.spotIds, spotId] };
    const next = collections.map((c) => (c.id === collectionId ? updated : c));
    setCollections(next);
    await saveCollections(next);
  }, [collections]);

  const removeSpotFromCollection = useCallback(async (collectionId: string, spotId: string) => {
    const coll = collections.find((c) => c.id === collectionId);
    if (!coll) return;
    const updated: Collection = { ...coll, spotIds: coll.spotIds.filter((id) => id !== spotId) };
    const next = collections.map((c) => (c.id === collectionId ? updated : c));
    setCollections(next);
    await saveCollections(next);
  }, [collections]);

  const getCollectionById = useCallback((id: string) => collections.find((c) => c.id === id), [collections]);

  const deleteCollection = useCallback(async (id: string) => {
    const next = collections.filter((c) => c.id !== id);
    setCollections(next);
    await saveCollections(next);
  }, [collections]);

  const value: SpotsContextValue = {
    allSpots,
    userSpots,
    addSpot,
    updateSpot,
    addPhotoToSpot,
    getSpotById: getSpotByIdImpl,
    isUserSpot,
    isLoading,
    favoriteIds,
    toggleFavorite,
    isFavorite,
    collections,
    addCollection,
    addSpotToCollection,
    removeSpotFromCollection,
    getCollectionById,
    deleteCollection,
  };

  return (
    <SpotsContext.Provider value={value}>
      {children}
    </SpotsContext.Provider>
  );
}

export function useSpots() {
  const ctx = useContext(SpotsContext);
  if (!ctx) throw new Error('useSpots must be used inside SpotsProvider');
  return ctx;
}
