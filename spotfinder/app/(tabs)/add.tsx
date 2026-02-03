import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
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
import { useSpots } from '../../src/context/SpotsContext';
import { SpotType, SPOT_TYPE_LABELS } from '../../src/types/spot';

const defaultScore = 0;

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

export default function AddSpotScreen() {
  const { addSpot } = useSpots();
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
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
    if (params.lat != null && params.lng != null) {
      setLatitude(params.lat);
      setLongitude(params.lng);
      if (!address) setAddress('Picked from map');
    }
  }, [params.lat, params.lng]);

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
      const filename = `spot-${Date.now()}.jpg`;
      const destUri = `${dir}/${filename}`;
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
      await addSpot({
        name: name.trim(),
        address: address.trim(),
        latitude: lat,
        longitude: lng,
        bestTime: bestTime.trim() || 'Not specified',
        score: defaultScore,
        imageUri: finalImageUri,
        photoBy: photoBy.trim() || 'You',
        spotType: spotType ?? undefined,
        parkingInfo: parkingInfo.trim() || undefined,
        photographyTips: photographyTips.trim() || undefined,
      });
      Alert.alert('Spot added', 'Your photo spot is saved and will appear in For You and on the Map.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
      setName('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setBestTime('');
      setImageUri('');
      setPhotoBy('');
      setSpotType(undefined);
      setParkingInfo('');
      setPhotographyTips('');
      setLocalImageUri(null);
    } catch (e) {
      Alert.alert('Error', 'Could not save spot. Try again.');
    } finally {
      setSaving(false);
    }
  };

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
        <View style={styles.header}>
          <Text style={styles.title}>Add a photo spot</Text>
          <Text style={styles.subtitle}>
            For photographers & car photographers. Add parking and tips so others can plan shoots.
          </Text>
        </View>

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
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Street, city, country"
            placeholderTextColor="#64748b"
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
              placeholderTextColor="#64748b"
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[styles.input, styles.coordInput]}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Longitude"
              placeholderTextColor="#64748b"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <Pressable
            style={({ pressed }) => [styles.locationBtn, pressed && styles.locationBtnPressed]}
            onPress={useMyLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : (
              <>
                <Ionicons name="locate" size={20} color="#0ea5e9" />
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
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Parking (optional)</Text>
          <TextInput
            style={styles.input}
            value={parkingInfo}
            onChangeText={setParkingInfo}
            placeholder="e.g. Street parking 50m, lot around corner"
            placeholderTextColor="#64748b"
          />
          <Text style={styles.hint}>Helps car photographers plan shoots (Locationscout-style)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photography tips (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={photographyTips}
            onChangeText={setPhotographyTips}
            placeholder="e.g. Best angle, crowd level, golden hour from west"
            placeholderTextColor="#64748b"
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
                    <ActivityIndicator size="small" color="#0ea5e9" />
                  ) : (
                    <>
                      <Ionicons name="images" size={20} color="#0ea5e9" />
                      <Text style={styles.photoBtnText}>Change photo</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.photoBtn, styles.photoBtnRemove, pressed && styles.photoBtnPressed]}
                  onPress={() => { setLocalImageUri(null); }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
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
                  <ActivityIndicator size="small" color="#0ea5e9" />
                ) : (
                  <>
                    <Ionicons name="images-outline" size={28} color="#0ea5e9" />
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
                placeholderTextColor="#64748b"
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
            placeholderTextColor="#64748b"
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
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>Add spot</Text>
            </>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Spots you add are stored on this device. To share them across devices or with others, you’d need a backend (we can add that later).
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordInput: {
    flex: 1,
  },
  typeChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeChipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    borderStyle: 'dashed',
  },
  galleryBtnDisabled: {
    opacity: 0.7,
  },
  galleryBtnPressed: {
    opacity: 0.9,
  },
  galleryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  orText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 10,
  },
  photoPreviewWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoPreviewActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
  },
  photoBtnPressed: {
    opacity: 0.8,
  },
  photoBtnRemove: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  photoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  photoBtnTextRemove: {
    color: '#ef4444',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  locationBtnPressed: {
    opacity: 0.8,
  },
  locationBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnPressed: {
    opacity: 0.9,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
