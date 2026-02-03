import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSpots } from '../../src/context/SpotsContext';
import { useTheme } from '../../src/context/ThemeContext';
import { SPOT_TYPE_LABELS } from '../../src/types/spot';
import type { PhotoSpot } from '../../src/types/spot';

function SpotCard({ spot, theme: t }: { spot: PhotoSpot; theme: ReturnType<typeof useTheme>['theme'] }) {
  const styles = useMemo(() => makeCardStyles(t), [t]);
  return (
    <Link href={`/spot/${spot.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <Image source={{ uri: spot.imageUri }} style={styles.cardImage} />
        <View style={styles.cardOverlay} pointerEvents="none" />
        <View style={styles.cardContent} pointerEvents="none">
          <Text style={styles.cardTitle} numberOfLines={2}>{spot.name}</Text>
          <Text style={styles.cardSubtext} numberOfLines={1}>{spot.bestTime}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { allSpots, favoriteIds, collections, getSpotById } = useSpots();
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const savedSpots = useMemo(
    () => favoriteIds.map((id) => getSpotById(id)).filter((s): s is PhotoSpot => s != null),
    [favoriteIds, getSpotById]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>Favorites and collections</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite spots</Text>
          {savedSpots.length === 0 ? (
            <Text style={styles.emptyText}>No saved spots yet. Tap the heart on a spot to save it.</Text>
          ) : (
            savedSpots.map((spot) => <SpotCard key={spot.id} spot={spot} theme={theme} />)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          {collections.length === 0 ? (
            <Text style={styles.emptyText}>No collections yet. Add a spot to a collection from its detail screen.</Text>
          ) : (
            collections.map((coll) => {
              const count = coll.spotIds.length;
              return (
                <Pressable
                  key={coll.id}
                  style={({ pressed }) => [styles.collectionCard, pressed && styles.collectionCardPressed]}
                  onPress={() => router.push(`/collection/${coll.id}`)}
                >
                  <Ionicons name="folder-open" size={24} color={theme.accent} />
                  <View style={styles.collectionCardText}>
                    <Text style={styles.collectionCardName}>{coll.name}</Text>
                    <Text style={styles.collectionCardCount}>{count} spot{count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: { paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 26, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 6, lineHeight: 20 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 28 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 12 },
    emptyText: { fontSize: 14, color: theme.textMuted, lineHeight: 20 },
    collectionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 10,
    },
    collectionCardPressed: { opacity: 0.9 },
    collectionCardText: { flex: 1, marginLeft: 14 },
    collectionCardName: { fontSize: 16, fontWeight: '600', color: theme.text },
    collectionCardCount: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  });
}

function makeCardStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    card: {
      borderRadius: 18,
      overflow: 'hidden',
      height: 160,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
    },
    cardPressed: { opacity: 0.96 },
    cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
    cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.overlay },
    cardContent: { flex: 1, justifyContent: 'flex-end', padding: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    cardSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.95)', marginTop: 4 },
  });
}
