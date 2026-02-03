import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useSpots } from '../../../src/context/SpotsContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { SpotType, SPOT_TYPE_LABELS } from '../../../src/types/spot';

const SPOT_TYPES: SpotType[] = [
  'general',
  'urban',
  'industrial',
  'garage',
  'beach',
  'graffiti',
  'racetrack',
  'landscape',
  'architecture',
];

function isRemoteUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSpotById, updateSpot, isUserSpot } = useSpots();
  const { theme } = useTheme();
  const router = useRouter();
  const spot = id ? getSpotById(id) : undefined;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [photoBy, setPhotoBy] = useState('');
  const [spotType, setSpotType] = useState<SpotType | undefined>(undefined);
  const [parkingInfo, setParkingInfo] = useState('');
  const [photographyTips, setPhotographyTips] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  useEffect(() => {
    if (spot && isUserSpot(spot.id)) {
      setName(spot.name);
      setAddress(spot.address);
      setLatitude(spot.latitude.toString());
      setLongitude(spot.longitude.toString());
      setBestTime(spot.bestTime);
      setPhotoBy(spot.photoBy);
      setSpotType(spot.spotType);
      setParkingInfo(spot.parkingInfo ?? '');
      setPhotographyTips(spot.photographyTips ?? '');
      if (isRemoteUri(spot.imageUri)) {
        setImageUri(spot.imageUri);
        setLocalImageUri(null);
      } else {
        setImageUri('');
        setLocalImageUri(spot.imageUri);
      }
    }
  }, [spot?.id, isUserSpot]);

  const pickFromGallery = async () => {
    setPickingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo library access to choose a photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const sourceUri = result.assets[0].uri;
      const dir = `${FileSystem.documentDirectory}spots`;
      const exists = await FileSystem.getInfoAsync(dir);
      if (!exists.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const destUri = `${dir}/spot-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: sourceUri, to: destUri });
      setLocalImageUri(destUri);
      setImageUri('');
    } catch (e) {
      Alert.alert('Error', 'Could not use that photo. Try another or use an image URL.');
    } finally {
      setPickingImage(false);
    }
  };

  const useMyLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow location access to use your current position.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));
      if (!address) setAddress('Current location');
    } catch (e) {
      Alert.alert('Error', 'Could not get location. Try entering coordinates manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!spot?.id.startsWith('user-')) {
      Alert.alert('Error', 'You can only edit spots you created.');
      return;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!name.trim()) {
      Alert.alert('Missing info', 'Enter a spot name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Missing info', 'Enter an address or use "Use my location".');
      return;
    }
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Invalid coordinates', 'Enter valid latitude (-90 to 90) and longitude (-180 to 180), or use "Use my location".');
      return;
    }
    const finalImageUri = localImageUri ?? imageUri.trim();
    if (!finalImageUri) {
      Alert.alert('Missing info', 'Choose a photo from your gallery or enter an image URL.');
      return;
    }

    setSaving(true);
    try {
      await updateSpot(spot.id, {
        name: name.trim(),
        address: address.trim(),
        latitude: lat,
        longitude: lng,
        bestTime: bestTime.trim() || 'Not specified',
        imageUri: finalImageUri,
        photoBy: photoBy.trim() || 'You',
        spotType: spotType ?? undefined,
        parkingInfo: parkingInfo.trim() || undefined,
        photographyTips: photographyTips.trim() || undefined,
      });
      Alert.alert('Spot updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!spot) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.error}>Spot not found</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!isUserSpot(spot.id)) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.error}>You can only edit spots you created.</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={16}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.title}>Edit spot</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>Update name, address, photo, parking & tips.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Spot type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChips}>
            {SPOT_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[styles.typeChip, spotType === type && styles.typeChipActive]}
                onPress={() => setSpotType(spotType === type ? undefined : type)}
              >
                <Text style={[styles.typeChipText, spotType === type && styles.typeChipTextActive]}>
                  {SPOT_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Spot name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sunset at the pier"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Street, city, country"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Coordinates *</Text>
          <View style={styles.coordRow}>
            <TextInput
              style={[styles.input, styles.coordInput]}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="Latitude"
              placeholderTextColor={theme.textMuted}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[styles.input, styles.coordInput]}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Longitude"
              placeholderTextColor={theme.textMuted}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <Pressable
            style={({ pressed }) => [styles.locationBtn, pressed && styles.locationBtnPressed]}
            onPress={useMyLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <>
                <Ionicons name="locate" size={20} color={theme.accent} />
                <Text style={styles.locationBtnText}>Use my location</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Best time to shoot</Text>
          <TextInput
            style={styles.input}
            value={bestTime}
            onChangeText={setBestTime}
            placeholder="e.g. Golden hour, 6–7 PM"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Parking (optional)</Text>
          <TextInput
            style={styles.input}
            value={parkingInfo}
            onChangeText={setParkingInfo}
            placeholder="e.g. Street parking 50m, lot around corner"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photography tips (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={photographyTips}
            onChangeText={setPhotographyTips}
            placeholder="e.g. Best angle, crowd level, golden hour from west"
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photo *</Text>
          {localImageUri ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: localImageUri }} style={styles.photoPreview} />
              <View style={styles.photoPreviewActions}>
                <Pressable
                  style={({ pressed }) => [styles.photoBtn, pressed && styles.photoBtnPressed]}
                  onPress={pickFromGallery}
                  disabled={pickingImage}
                >
                  {pickingImage ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <>
                      <Ionicons name="images" size={20} color={theme.accent} />
                      <Text style={styles.photoBtnText}>Change photo</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.photoBtn, styles.photoBtnRemove, pressed && styles.photoBtnPressed]}
                  onPress={() => setLocalImageUri(null)}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.error} />
                  <Text style={[styles.photoBtnText, styles.photoBtnTextRemove]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [styles.galleryBtn, pickingImage && styles.galleryBtnDisabled, pressed && !pickingImage && styles.galleryBtnPressed]}
                onPress={pickFromGallery}
                disabled={pickingImage}
              >
                {pickingImage ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <>
                    <Ionicons name="images-outline" size={28} color={theme.accent} />
                    <Text style={styles.galleryBtnText}>Choose from gallery</Text>
                  </>
                )}
              </Pressable>
              <Text style={styles.orText}>or paste image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUri}
                onChangeText={(t) => { setImageUri(t); setLocalImageUri(null); }}
                placeholder="https://..."
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photo by</Text>
          <TextInput
            style={styles.input}
            value={photoBy}
            onChangeText={setPhotoBy}
            placeholder="Your name or handle"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            (saving || !name.trim() || (!localImageUri && !imageUri.trim())) && styles.submitBtnDisabled,
            pressed && !saving && styles.submitBtnPressed,
          ]}
          onPress={handleSubmit}
          disabled={saving || !name.trim() || (!localImageUri && !imageUri.trim())}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>Save changes</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
    scroll: { flex: 1 },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      flex: 1,
    },
    headerSpacer: { width: 40 },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 24,
      lineHeight: 20,
    },
    section: { marginBottom: 20 },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
    coordRow: { flexDirection: 'row', gap: 12 },
    coordInput: { flex: 1 },
    typeChips: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
    typeChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
    typeChipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
    typeChipText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
    typeChipTextActive: { color: '#fff' },
    inputMultiline: { minHeight: 80, textAlignVertical: 'top' as const },
    galleryBtn: {
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
    },
    galleryBtnDisabled: { opacity: 0.7 },
    galleryBtnPressed: { opacity: 0.9 },
    galleryBtnText: { fontSize: 16, fontWeight: '600', color: theme.accent },
    orText: { fontSize: 13, color: theme.textMuted, textAlign: 'center' as const, marginVertical: 10 },
    photoPreviewWrap: {
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    photoPreview: { width: '100%', height: 200, resizeMode: 'cover' as const },
    photoPreviewActions: { flexDirection: 'row', gap: 12, padding: 12 },
    photoBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      backgroundColor: theme.surfaceMuted,
      borderRadius: 12,
    },
    photoBtnPressed: { opacity: 0.8 },
    photoBtnRemove: { backgroundColor: 'rgba(220, 38, 38, 0.1)' },
    photoBtnText: { fontSize: 14, fontWeight: '600', color: theme.accent },
    photoBtnTextRemove: { color: theme.error },
    locationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 10,
      paddingVertical: 14,
      backgroundColor: theme.accentLight,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    locationBtnPressed: { opacity: 0.8 },
    locationBtnText: { fontSize: 15, fontWeight: '600', color: theme.accent },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
      paddingVertical: 16,
      backgroundColor: theme.accent,
      borderRadius: 14,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnPressed: { opacity: 0.9 },
    submitBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  });
}
