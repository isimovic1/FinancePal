import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider, useStore } from '../lib/store';
import { colors } from '../theme';

function RootNavigator() {
  const { state, ready } = useStore();
  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  const setupDone = state.settings.setupDone;
  return (
    <Stack screenOptions={{ headerTintColor: colors.primary, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!setupDone}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={setupDone}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="transaction" options={{ title: 'Transakcija', presentation: 'modal' }} />
        <Stack.Screen name="category" options={{ title: 'Kategorija', presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
