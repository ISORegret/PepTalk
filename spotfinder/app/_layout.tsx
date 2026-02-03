import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { SpotsProvider } from '../src/context/SpotsContext';

function RootStack() {
  const { theme } = useTheme();
  const isDark = theme.bg === '#0f1419';
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="spot/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="spot/edit/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SpotsProvider>
          <RootStack />
        </SpotsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
