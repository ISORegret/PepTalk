import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useSpots } from '../../src/context/SpotsContext';
import { useTheme } from '../../src/context/ThemeContext';
import { SPOT_TYPE_LABELS } from '../../src/types/spot';
import { getSunTimesForSpot } from '../../src/utils/sunTimes';

type WeatherData = { temp: number; desc: string; high: number; low: number } | null;

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getSpotById,
    addPhotoToSpot,
    toggleFavorite,
    isFavorite,
    collections,
    addCollection,
    addSpotToCollection,
    getCollectionById,
  } = useSpots();
  const { theme } = useTheme();
  const router = useRouter();
  const spot = id ? getSpotById(id) : undefined;
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [addPhotoNote, setAddPhotoNote] = useState('');
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const sunTimes = spot ? getSunTimesForSpot(spot.latitude, spot.longitude) : null;

  useEffect(() => {
    if (!spot) return;
    setWeatherLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${spot.latitude}&longitude=${spot.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => {
        const code = data.current?.weather_code ?? 0;
        const desc = code === 0 ? 'Clear' : code < 4 ? 'Cloudy' : code < 70 ? 'Precipitation' : 'Snow';
        setWeather({
          temp: Math.round(data.current?.temperature_2m ?? 0),
          desc,
          high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
          low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [spot?.id, spot?.latitude, spot?.longitude]);

  const openInMaps = () => {
    if (!spot) return;
    const { latitude, longitude } = spot;
    const url = Platform.select({
      ios: `maps:?q=${latitude},${longitude}&ll=${latitude},${longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    Linking.openURL(url);
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!spot) return;
    await addSpotToCollection(collectionId, spot.id);
    setShowAddToCollectionModal(false);
  };

  const handleCreateCollectionAndAdd = async () => {
    if (!spot || !newCollectionName.trim()) return;
    const coll = await addCollection(newCollectionName.trim());
    await addSpotToCollection(coll.id, spot.id);
    setNewCollectionName('');
    setShowAddToCollectionModal(false);
  };

  const openAddPhoto = () => {
    if (!spot?.id.startsWith('user-')) return;
    setShowAddPhotoModal(true);
    setAddPhotoNote('');
    setPendingPhotoUri(null);
  };

  const pickPhotoForAdd = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to add your photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setPendingPhotoUri(result.assets[0].uri);
  };

  const confirmAddPhoto = async () => {
    if (!spot?.id.startsWith('user-') || !pendingPhotoUri) return;
    setAddingPhoto(true);
    setShowAddPhotoModal(false);
    try {
      const dir = `${FileSystem.documentDirectory}spots`;
      const exists = await FileSystem.getInfoAsync(dir);
      if (!exists.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const destUri = `${dir}/spot-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: pendingPhotoUri, to: destUri });
      await addPhotoToSpot(spot.id, destUri, 'You', addPhotoNote.trim() || undefined);
      setPendingPhotoUri(null);
      setAddPhotoNote('');
    } catch (e) {
      Alert.alert('Error', 'Could not add photo. Try again.');
    } finally {
      setAddingPhoto(false);
    }
  };

  const cancelAddPhoto = () => {
    setShowAddPhotoModal(false);
    setPendingPhotoUri(null);
    setAddPhotoNote('');
  };

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

  const additionalPhotos = spot.additionalPhotos ?? [];
  const isUserSpot = spot.id.startsWith('user-');

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
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          {isUserSpot && (
            <Pressable
              style={styles.editButton}
              onPress={() => router.push(`/spot/edit/${spot.id}`)}
              hitSlop={16}
            >
              <Ionicons name="pencil" size={22} color="#fff" />
            </Pressable>
          )}
          <Pressable
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(spot.id)}
            hitSlop={16}
          >
            <Ionicons
              name={isFavorite(spot.id) ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite(spot.id) ? '#f87171' : '#fff'}
            />
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
            {isUserSpot && (
              <View style={styles.addedByYou}>
                <Text style={styles.addedByYouText}>Added by you</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{spot.name}</Text>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
            <Text style={styles.bestTime}>{spot.bestTime}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={18} color={theme.textSecondary} />
            <Text style={styles.address}>{spot.address}</Text>
          </View>
          {spot.parkingInfo ? (
            <View style={styles.infoBlock}>
              <View style={styles.infoHeader}>
                <Ionicons name="car-outline" size={18} color={theme.accent} />
                <Text style={styles.infoTitle}>Parking</Text>
              </View>
              <Text style={styles.infoText}>{spot.parkingInfo}</Text>
            </View>
          ) : null}
          {spot.photographyTips ? (
            <View style={styles.infoBlock}>
              <View style={styles.infoHeader}>
                <Ionicons name="camera-outline" size={18} color={theme.accent} />
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

          <View style={styles.actionRow}>
            <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]} onPress={openInMaps}>
              <Ionicons name="navigate" size={20} color={theme.accent} />
              <Text style={styles.actionBtnText}>Open in Maps</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => setShowAddToCollectionModal(true)}
            >
              <Ionicons name="folder-open-outline" size={20} color={theme.accent} />
              <Text style={styles.actionBtnText}>Add to collection</Text>
            </Pressable>
          </View>

          {sunTimes && (
            <View style={styles.infoBlock}>
              <View style={styles.infoHeader}>
                <Ionicons name="sunny-outline" size={18} color={theme.accent} />
                <Text style={styles.infoTitle}>Sun today</Text>
              </View>
              <Text style={styles.infoText}>Sunrise {sunTimes.sunrise} · Sunset {sunTimes.sunset}</Text>
              <Text style={styles.infoText}>Golden hour AM: {sunTimes.goldenHourAM}</Text>
              <Text style={styles.infoText}>Golden hour PM: {sunTimes.goldenHourPM}</Text>
            </View>
          )}

          {weatherLoading && (
            <View style={styles.weatherBlock}>
              <ActivityIndicator size="small" color={theme.accent} />
              <Text style={styles.weatherText}>Loading weather…</Text>
            </View>
          )}
          {!weatherLoading && weather && (
            <View style={styles.infoBlock}>
              <View style={styles.infoHeader}>
                <Ionicons name="cloud-outline" size={18} color={theme.accent} />
                <Text style={styles.infoTitle}>Weather</Text>
              </View>
              <Text style={styles.infoText}>
                {weather.temp}° · {weather.desc} · High {weather.high}° / Low {weather.low}°
              </Text>
            </View>
          )}

          <Text style={styles.credit}>Photo by {spot.photoBy}</Text>

          {(isUserSpot || additionalPhotos.length > 0) && (
            <View style={styles.morePhotosSection}>
              <Text style={styles.morePhotosTitle}>More photos at this spot</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.morePhotosList}>
                {additionalPhotos.map((p, i) => (
                  <View key={i} style={styles.morePhotoCard}>
                    <Image source={{ uri: p.imageUri }} style={styles.morePhotoImage} />
                    <Text style={styles.morePhotoCredit}>Photo by {p.photoBy}</Text>
                    {p.note ? <Text style={styles.morePhotoNote}>{p.note}</Text> : null}
                  </View>
                ))}
                {isUserSpot && (
                  <Pressable
                    style={({ pressed }) => [styles.addPhotoCard, pressed && styles.addPhotoCardPressed]}
                    onPress={openAddPhoto}
                    disabled={addingPhoto}
                  >
                    {addingPhoto ? (
                      <ActivityIndicator size="small" color={theme.accent} />
                    ) : (
                      <>
                        <Ionicons name="add-circle-outline" size={40} color={theme.accent} />
                        <Text style={styles.addPhotoCardText}>Add your photo</Text>
                        <Text style={styles.addPhotoCardSub}>Add a note (optional)</Text>
                      </>
                    )}
                  </Pressable>
                )}
              </ScrollView>
              {isUserSpot && (
                <Text style={styles.morePhotosHint}>Anyone using this app on this device can add a photo and note to this spot.</Text>
              )}
            </View>
          )}

          {showAddToCollectionModal && (
            <Modal visible transparent animationType="fade">
              <Pressable style={styles.modalOverlay} onPress={() => setShowAddToCollectionModal(false)}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                  <Text style={styles.modalTitle}>Add to collection</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                    placeholder="New collection name"
                    placeholderTextColor={theme.textMuted}
                  />
                  <Pressable
                    style={({ pressed }) => [styles.modalBtn, styles.modalBtnConfirm, pressed && styles.modalBtnPressed]}
                    onPress={handleCreateCollectionAndAdd}
                    disabled={!newCollectionName.trim()}
                  >
                    <Text style={styles.modalBtnTextConfirm}>Create & add</Text>
                  </Pressable>
                  {collections.length > 0 && (
                    <>
                      <Text style={styles.modalLabel}>Or add to existing</Text>
                      {collections.map((coll) => (
                        <Pressable
                          key={coll.id}
                          style={({ pressed }) => [styles.collectionItem, pressed && styles.modalBtnPressed]}
                          onPress={() => handleAddToCollection(coll.id)}
                        >
                          <Text style={styles.collectionItemText}>{coll.name}</Text>
                          <Text style={styles.collectionItemCount}>{coll.spotIds.length} spots</Text>
                        </Pressable>
                      ))}
                    </>
                  )}
                  <Pressable
                    style={({ pressed }) => [styles.modalBtn, styles.modalBtnCancel, pressed && styles.modalBtnPressed]}
                    onPress={() => setShowAddToCollectionModal(false)}
                  >
                    <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>
          )}

          {showAddPhotoModal && (
            <Modal visible transparent animationType="fade">
              <Pressable style={styles.modalOverlay} onPress={cancelAddPhoto}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={styles.modalContentWrap}
                >
                  <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    <Text style={styles.modalTitle}>Add your photo</Text>
                    {!pendingPhotoUri ? (
                      <Pressable
                        style={({ pressed }) => [styles.modalPickBtn, pressed && styles.modalPickBtnPressed]}
                        onPress={pickPhotoForAdd}
                      >
                        <Ionicons name="images-outline" size={28} color={theme.accent} />
                        <Text style={styles.modalPickBtnText}>Choose from gallery</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.modalPreviewWrap}>
                        <Image source={{ uri: pendingPhotoUri }} style={styles.modalPreview} />
                        <Pressable style={styles.modalChangePhoto} onPress={pickPhotoForAdd}>
                          <Text style={styles.modalChangePhotoText}>Change photo</Text>
                        </Pressable>
                      </View>
                    )}
                    <Text style={styles.modalLabel}>Note (optional)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={addPhotoNote}
                      onChangeText={setAddPhotoNote}
                      placeholder="e.g. Shot at golden hour, empty lot"
                      placeholderTextColor={theme.textMuted}
                      multiline
                      numberOfLines={2}
                    />
                    <View style={styles.modalActions}>
                      <Pressable style={({ pressed }) => [styles.modalBtn, styles.modalBtnCancel, pressed && styles.modalBtnPressed]} onPress={cancelAddPhoto}>
                        <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.modalBtn, styles.modalBtnConfirm, pressed && styles.modalBtnPressed]}
                        onPress={confirmAddPhoto}
                        disabled={!pendingPhotoUri}
                      >
                        <Text style={styles.modalBtnTextConfirm}>Add photo</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                </KeyboardAvoidingView>
              </Pressable>
            </Modal>
          )}
        </View>
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
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.bg,
      padding: 20,
    },
    error: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    backBtn: {
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    backBtnText: {
      color: theme.accent,
      fontWeight: '600',
    },
    scroll: {
      flex: 1,
    },
    imageWrap: {
      height: 280,
      position: 'relative',
      backgroundColor: theme.surfaceMuted,
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
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      position: 'absolute',
      top: 48,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    favoriteButton: {
      position: 'absolute',
      top: 48,
      right: 72,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scoreBadge: {
      position: 'absolute',
      bottom: 16,
      right: 20,
      backgroundColor: theme.accent,
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
      backgroundColor: theme.bg,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    spotTypeBadge: {
      backgroundColor: theme.surfaceMuted,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    spotTypeBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    addedByYou: {
      backgroundColor: theme.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    addedByYouText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.accentDark,
    },
    infoBlock: {
      marginTop: 16,
      padding: 14,
      backgroundColor: theme.accentLight,
      borderRadius: 14,
      borderLeftWidth: 4,
      borderLeftColor: theme.accent,
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
      color: theme.text,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
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
      color: theme.textSecondary,
      flex: 1,
    },
    address: {
      fontSize: 15,
      color: theme.textSecondary,
      flex: 1,
    },
    coords: {
      marginTop: 12,
      padding: 14,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    coordsText: {
      fontSize: 14,
      fontFamily: 'monospace',
      color: theme.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    actionBtnPressed: { opacity: 0.9 },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.accent,
    },
    weatherBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 16,
      padding: 14,
      backgroundColor: theme.surfaceMuted,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    weatherText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    collectionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginTop: 8,
      backgroundColor: theme.surfaceMuted,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    collectionItemText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    collectionItemCount: {
      fontSize: 13,
      color: theme.textMuted,
    },
    credit: {
      fontSize: 13,
      color: theme.textMuted,
      marginTop: 16,
    },
    morePhotosSection: {
      marginTop: 24,
    },
    morePhotosTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    morePhotosList: {
      gap: 12,
      paddingRight: 20,
    },
    morePhotoCard: {
      width: 160,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    morePhotoImage: {
      width: 160,
      height: 100,
      resizeMode: 'cover',
    },
    morePhotoCredit: {
      fontSize: 11,
      color: theme.textMuted,
      padding: 8,
    },
    morePhotoNote: {
      fontSize: 11,
      color: theme.textSecondary,
      paddingHorizontal: 8,
      paddingBottom: 8,
      lineHeight: 14,
    },
    addPhotoCard: {
      width: 160,
      height: 140,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.accent,
      borderStyle: 'dashed',
      backgroundColor: theme.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    addPhotoCardPressed: {
      opacity: 0.9,
    },
    addPhotoCardText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.accent,
    },
    addPhotoCardSub: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    morePhotosHint: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 10,
      lineHeight: 18,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalContentWrap: {
      width: '100%',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    modalPickBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 18,
      backgroundColor: theme.accentLight,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.accent,
      borderStyle: 'dashed',
      marginBottom: 16,
    },
    modalPickBtnPressed: { opacity: 0.9 },
    modalPickBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accent,
    },
    modalPreviewWrap: {
      marginBottom: 16,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: theme.surfaceMuted,
    },
    modalPreview: {
      width: '100%',
      height: 160,
      resizeMode: 'cover',
    },
    modalChangePhoto: {
      padding: 10,
      alignItems: 'center',
    },
    modalChangePhotoText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.accent,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    modalInput: {
      backgroundColor: theme.bg,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: 56,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalBtnPressed: { opacity: 0.9 },
    modalBtnCancel: {
      backgroundColor: theme.surfaceMuted,
    },
    modalBtnConfirm: {
      backgroundColor: theme.accent,
    },
    modalBtnTextCancel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    modalBtnTextConfirm: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
  });
}
