import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSpots } from '../../src/context/SpotsContext';
import { useTheme } from '../../src/context/ThemeContext';
import {
  PhotoSpot,
  SpotType,
  SPOT_TYPE_LABELS,
  isAutomotiveSpot,
} from '../../src/types/spot';

export type FilterValue = 'all' | 'saved' | 'automotive' | SpotType;

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'automotive', label: 'Car spots' },
  { value: 'urban', label: SPOT_TYPE_LABELS.urban },
  { value: 'industrial', label: SPOT_TYPE_LABELS.industrial },
  { value: 'garage', label: 'Garage' },
  { value: 'beach', label: SPOT_TYPE_LABELS.beach },
  { value: 'graffiti', label: SPOT_TYPE_LABELS.graffiti },
  { value: 'landscape', label: SPOT_TYPE_LABELS.landscape },
  { value: 'architecture', label: SPOT_TYPE_LABELS.architecture },
];

function filterSpots(spots: PhotoSpot[], filter: FilterValue, favoriteIds: string[]): PhotoSpot[] {
  if (filter === 'saved') return spots.filter((s) => favoriteIds.includes(s.id));
  if (filter === 'all') return spots;
  if (filter === 'automotive') return spots.filter(isAutomotiveSpot);
  return spots.filter((s) => s.spotType === filter);
}

function searchSpots(spots: PhotoSpot[], query: string): PhotoSpot[] {
  const q = query.trim().toLowerCase();
  if (!q) return spots;
  return spots.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      (s.bestTime && s.bestTime.toLowerCase().includes(q))
  );
}

function SpotCard({ spot, theme: t }: { spot: PhotoSpot; theme: ReturnType<typeof useTheme>['theme'] }) {
  const styles = useMemo(() => makeCardStyles(t), [t]);
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
            <Ionicons name="information-circle-outline" size={16} color={t.textMuted} />
            <Text style={styles.tapHintText}>Tap for address, parking, tips & GPS</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { allSpots, favoriteIds } = useSpots();
  const { theme, toggleTheme, mode } = useTheme();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredSpots = useMemo(() => {
    const byFilter = filterSpots(allSpots, filter, favoriteIds);
    return searchSpots(byFilter, searchQuery);
  }, [allSpots, filter, favoriteIds, searchQuery]);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>For You</Text>
          <Pressable style={({ pressed }) => [styles.themeToggle, pressed && styles.themeTogglePressed]} onPress={toggleTheme}>
            <Ionicons name={mode === 'dark' ? 'sunny' : 'moon'} size={24} color={theme.accent} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Photo spots for photographers & car photographers. Tap for address, best time, parking & tips.
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or address…"
          placeholderTextColor={theme.textMuted}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable style={styles.searchClear} onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={theme.textMuted} />
          </Pressable>
        )}
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
            <Ionicons name="images-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No spots in this category yet.</Text>
            <Text style={styles.emptySubtext}>Try "All" or add your own in the Add tab.</Text>
          </View>
        ) : (
          filteredSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} theme={theme} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.5,
    },
    themeToggle: {
      padding: 8,
    },
    themeTogglePressed: {
      opacity: 0.8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 20,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.border,
      paddingHorizontal: 14,
      minHeight: 48,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      paddingVertical: 12,
    },
    searchClear: {
      padding: 4,
    },
    chipWrap: {
      paddingVertical: 12,
    },
    chips: {
      paddingHorizontal: 20,
      gap: 10,
      flexDirection: 'row',
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
    chipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    chipTextActive: {
      color: '#fff',
    },
    whatItDoes: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 14,
      backgroundColor: theme.accentLight,
      borderRadius: 14,
      borderLeftWidth: 4,
      borderLeftColor: theme.accent,
    },
    whatItDoesTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.accentDark,
      marginBottom: 6,
    },
    whatItDoesItem: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 2,
      lineHeight: 18,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 28,
      gap: 18,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 56,
      gap: 10,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textMuted,
    },
  });
}

function makeCardStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    card: {
      borderRadius: 18,
      overflow: 'hidden',
      height: 220,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardPressed: {
      opacity: 0.96,
    },
    cardImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.overlay,
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
      backgroundColor: theme.accent,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    typeBadge: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    mySpotBadge: {
      backgroundColor: theme.surfaceMuted,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    mySpotBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.text,
    },
    scoreText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#fff',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#fff',
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    cardSubtext: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.95)',
      marginTop: 4,
    },
    cardCredit: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
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
      color: 'rgba(255,255,255,0.9)',
    },
  });
}
