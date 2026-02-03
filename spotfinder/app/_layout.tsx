import { Stack } from 'expo-router';
import { SpotsProvider } from '../src/context/SpotsContext';

export default function RootLayout() {
  return (
    <SpotsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="spot/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </SpotsProvider>
  );
}
