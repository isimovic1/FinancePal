import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import { ColorValue } from 'react-native';

import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name={name} color={color as string} size={size} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Pregled', tabBarIcon: icon('wallet-outline') }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transakcije', tabBarIcon: icon('list-outline') }} />
      <Tabs.Screen name="savings" options={{ title: 'Štednja', tabBarIcon: icon('trending-up-outline') }} />
      <Tabs.Screen name="report" options={{ title: 'Izvještaj', tabBarIcon: icon('pie-chart-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Postavke', tabBarIcon: icon('settings-outline') }} />
    </Tabs>
  );
}
