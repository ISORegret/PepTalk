import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSpots } from '../../src/context/SpotsContext';
import { useTheme } from '../../src/context/ThemeContext';
import type { PhotoSpot } from '../../src/types/spot';

function SpotCard({ spot, theme: t }: { spot: PhotoSpot; theme: ReturnType<typeof useTheme>['theme'] }) {
  const styles = useMemo(() => makeCardStyles(t), [t]);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => {}}
    >
      <Image source={{ uri: spot.imageUri }} style={styles.cardImage} />
      <View style={styles.cardOverlay} pointerEvents="none" />
      <View style={styles.cardContent} pointerEvents="none">
        <Text style={styles.cardTitle} numberOfLines={2}>{spot.name}</Text>
        <Text style={styles.cardSubtext} numberOfLines={1}>{spot.bestTime}</Text>
      </View>
    </Pressable>
  );
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCollectionById, getSpotById } = useSpots();
  const { theme } = useTheme();
  const router = useRouter();
  const collection = id ? getCollectionById(id) : undefined;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const spots = useMemo(() => {
    if (!collection) return [];
    return collection.spotIds
      .map((spotId) => getSpotById(spotId))
      .filter((s): s is PhotoSpot => s != null);
  }, [collection, getSpotById]);

  if (!collection) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.error}>Collection not found</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={16}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{collection.name}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {spots.length === 0 ? (
          <Text style={styles.emptyText}>No spots in this collection yet.</Text>
        ) : (
          spots.map((spot) => (
            <Pressable
              key={spot.id}
              style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
              onPress={() => router.push(`/spot/${spot.id}`)}
            >
              <SpotCard spot={spot} theme={theme} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    error: { fontSize: 16, color: theme.textSecondary },
    backBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border },
    backBtnText: { color: theme.accent, fontWeight: '600' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.surface },
    backButton: { padding: 8, marginRight: 8 },
    title: { flex: 1, fontSize: 18, fontWeight: '700', color: theme.text },
    headerSpacer: { width: 40 },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    emptyText: { fontSize: 14, color: theme.textMuted, textAlign: 'center', marginTop: 24 },
    cardWrap: { marginBottom: 12 },
    cardPressed: { opacity: 0.96 },
  });
}

function makeCardStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    card: { borderRadius: 18, overflow: 'hidden', height: 160, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    cardPressed: { opacity: 0.96 },
    cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
    cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.overlay },
    cardContent: { flex: 1, justifyContent: 'flex-end', padding: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    cardSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.95)', marginTop: 4 },
  });
}
