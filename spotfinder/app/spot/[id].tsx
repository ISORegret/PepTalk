import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSpots } from '../../src/context/SpotsContext';
import { SPOT_TYPE_LABELS } from '../../src/types/spot';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSpotById } = useSpots();
  const router = useRouter();
  const spot = id ? getSpotById(id) : undefined;

  if (!spot) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Spot not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: spot.imageUri }} style={styles.image} />
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={16}
          >
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </Pressable>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{spot.score}</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.badges}>
            {spot.spotType && (
              <View style={styles.spotTypeBadge}>
                <Text style={styles.spotTypeBadgeText}>{SPOT_TYPE_LABELS[spot.spotType]}</Text>
              </View>
            )}
            {spot.id.startsWith('user-') && (
              <View style={styles.addedByYou}>
                <Text style={styles.addedByYouText}>Added by you</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{spot.name}</Text>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={18} color="#94a3b8" />
            <Text style={styles.bestTime}>{spot.bestTime}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={18} color="#94a3b8" />
            <Text style={styles.address}>{spot.address}</Text>
          </View>
          {spot.parkingInfo ? (
            <View style={styles.infoBlock}>
              <View style={styles.infoHeader}>
                <Ionicons name="car-outline" size={18} color="#0ea5e9" />
                <Text style={styles.infoTitle}>Parking</Text>
              </View>
              <Text style={styles.infoText}>{spot.parkingInfo}</Text>
            </View>
          ) : null}
          {spot.photographyTips ? (
            <View style={styles.infoBlock}>
              <View style={styles.infoHeader}>
                <Ionicons name="camera-outline" size={18} color="#0ea5e9" />
                <Text style={styles.infoTitle}>Photography tips</Text>
              </View>
              <Text style={styles.infoText}>{spot.photographyTips}</Text>
            </View>
          ) : null}
          <View style={styles.coords}>
            <Text style={styles.coordsText}>
              {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
            </Text>
          </View>
          <Text style={styles.credit}>Photo by {spot.photoBy}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  error: {
    fontSize: 16,
    color: '#94a3b8',
  },
  backBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  backBtnText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  imageWrap: {
    height: 280,
    position: 'relative',
    backgroundColor: '#1e293b',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  spotTypeBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  spotTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  addedByYou: {
    backgroundColor: '#475569',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addedByYouText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  infoBlock: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bestTime: {
    fontSize: 15,
    color: '#cbd5e1',
    flex: 1,
  },
  address: {
    fontSize: 15,
    color: '#cbd5e1',
    flex: 1,
  },
  coords: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  coordsText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#94a3b8',
  },
  credit: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 16,
  },
});
