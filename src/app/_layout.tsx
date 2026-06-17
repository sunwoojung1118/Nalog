import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { useAutoPublish } from '@/hooks/useAutoPublish';

function AppEffects() {
  useAutoPublish();
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.community }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppEffects />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.community } }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
