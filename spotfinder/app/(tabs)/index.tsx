import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSpots } from '../../src/context/SpotsContext';
import {
  PhotoSpot,
  SpotType,
  SPOT_TYPE_LABELS,
  isAutomotiveSpot,
} from '../../src/types/spot';

export type FilterValue = 'all' | 'automotive' | SpotType;

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'automotive', label: 'Car spots' },
  { value: 'urban', label: SPOT_TYPE_LABELS.urban },
  { value: 'industrial', label: SPOT_TYPE_LABELS.industrial },
  { value: 'garage', label: 'Garage' },
  { value: 'beach', label: SPOT_TYPE_LABELS.beach },
  { value: 'graffiti', label: SPOT_TYPE_LABELS.graffiti },
  { value: 'landscape', label: SPOT_TYPE_LABELS.landscape },
  { value: 'architecture', label: SPOT_TYPE_LABELS.architecture },
];

function filterSpots(spots: PhotoSpot[], filter: FilterValue): PhotoSpot[] {
  if (filter === 'all') return spots;
  if (filter === 'automotive') return spots.filter(isAutomotiveSpot);
  return spots.filter((s) => s.spotType === filter);
}

function SpotCard({ spot }: { spot: PhotoSpot }) {
  return (
    <Link href={`/spot/${spot.id}`} asChild>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Image source={{ uri: spot.imageUri }} style={styles.cardImage} />
        <View style={styles.cardOverlay} pointerEvents="none" />
        <View style={styles.cardContent} pointerEvents="none">
          <View style={styles.badges}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{spot.score}</Text>
            </View>
            {spot.spotType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {SPOT_TYPE_LABELS[spot.spotType]}
                </Text>
              </View>
            )}
            {spot.id.startsWith('user-') && (
              <View style={styles.mySpotBadge}>
                <Text style={styles.mySpotBadgeText}>Your spot</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {spot.name}
          </Text>
          <Text style={styles.cardSubtext} numberOfLines={1}>
            {spot.bestTime}
          </Text>
          <Text style={styles.cardCredit}>Photo by {spot.photoBy}</Text>
          <View style={styles.tapHint}>
            <Ionicons name="information-circle-outline" size={16} color="#94a3b8" />
            <Text style={styles.tapHintText}>Tap for address, parking, tips & GPS</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function ExploreScreen() {
  const { allSpots } = useSpots();
  const [filter, setFilter] = useState<FilterValue>('all');
  const filteredSpots = useMemo(() => filterSpots(allSpots, filter), [allSpots, filter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>For You</Text>
        <Text style={styles.subtitle}>
          Photo spots for photographers & car photographers. Tap for address, best time, parking & tips.
        </Text>
      </View>

      <View style={styles.chipWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTER_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.chip,
                filter === opt.value && styles.chipActive,
              ]}
              onPress={() => setFilter(opt.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === opt.value && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.whatItDoes}>
        <Text style={styles.whatItDoesTitle}>What you can do</Text>
        <Text style={styles.whatItDoesItem}>• Filter by Car spots, Urban, Garage, etc.</Text>
        <Text style={styles.whatItDoesItem}>• Tap a photo → address, best time, parking, tips, GPS</Text>
        <Text style={styles.whatItDoesItem}>• Map tab → see all spots; Add tab → add your own</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSpots.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={48} color="#475569" />
            <Text style={styles.emptyText}>No spots in this category yet.</Text>
            <Text style={styles.emptySubtext}>Try "All" or add your own in the Add tab.</Text>
          </View>
        ) : (
          filteredSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  chipWrap: {
    paddingVertical: 10,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  chipTextActive: {
    color: '#fff',
  },
  whatItDoes: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  whatItDoesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  whatItDoesItem: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#1e293b',
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  scoreBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  mySpotBadge: {
    backgroundColor: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mySpotBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  cardSubtext: {
    fontSize: 13,
    color: '#cbd5e1',
    marginTop: 4,
  },
  cardCredit: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  tapHintText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
