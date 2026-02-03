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

export type { Collection };

type SpotsContextValue = {
  allSpots: PhotoSpot[];
  userSpots: PhotoSpot[];
  addSpot: (spot: Omit<PhotoSpot, 'id'>) => Promise<void>;
  updateSpot: (spotId: string, updates: Partial<Omit<PhotoSpot, 'id'>>) => Promise<void>;
  addPhotoToSpot: (spotId: string, imageUri: string, photoBy: string, note?: string) => Promise<void>;
  getSpotById: (id: string) => PhotoSpot | undefined;
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
    Promise.all([loadUserSpots(), loadFavorites(), loadCollections()]).then(([loadedSpots, loadedFavs, loadedColls]) => {
      if (!cancelled) setUserSpots(loadedSpots);
      if (!cancelled) setFavoriteIds(loadedFavs);
      if (!cancelled) setCollections(loadedColls);
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const allSpots = [...CURATED_SPOTS, ...userSpots];

  const addSpot = useCallback(async (spot: Omit<PhotoSpot, 'id'>) => {
    const id = `user-${Date.now()}`;
    const newSpot: PhotoSpot = { ...spot, id };
    const next = [...userSpots, newSpot];
    setUserSpots(next);
    await saveUserSpots(next);
  }, [userSpots]);

  const updateSpot = useCallback(async (spotId: string, updates: Partial<Omit<PhotoSpot, 'id'>>) => {
    if (!spotId.startsWith('user-')) return;
    const spot = userSpots.find((s) => s.id === spotId);
    if (!spot) return;
    const updated: PhotoSpot = { ...spot, ...updates };
    const next = userSpots.map((s) => (s.id === spotId ? updated : s));
    setUserSpots(next);
    await saveUserSpots(next);
  }, [userSpots]);

  const addPhotoToSpot = useCallback(async (spotId: string, imageUri: string, photoBy: string, note?: string) => {
    if (!spotId.startsWith('user-')) return;
    const spot = userSpots.find((s) => s.id === spotId);
    if (!spot) return;
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
