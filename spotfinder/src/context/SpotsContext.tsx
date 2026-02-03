import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PhotoSpot } from '../types/spot';
import { CURATED_SPOTS } from '../data/spots';
import { getSpotById } from '../data/spots';
import { loadUserSpots, saveUserSpots } from '../data/spotStore';

type SpotsContextValue = {
  allSpots: PhotoSpot[];
  userSpots: PhotoSpot[];
  addSpot: (spot: Omit<PhotoSpot, 'id'>) => Promise<void>;
  getSpotById: (id: string) => PhotoSpot | undefined;
  isLoading: boolean;
};

const SpotsContext = createContext<SpotsContextValue | null>(null);

export function SpotsProvider({ children }: { children: React.ReactNode }) {
  const [userSpots, setUserSpots] = useState<PhotoSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadUserSpots().then((loaded) => {
      if (!cancelled) setUserSpots(loaded);
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

  const getSpotByIdImpl = useCallback(
    (id: string) => getSpotById(id, allSpots),
    [allSpots]
  );

  const value: SpotsContextValue = {
    allSpots,
    userSpots,
    addSpot,
    getSpotById: getSpotByIdImpl,
    isLoading,
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
